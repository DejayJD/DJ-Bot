/*
 *  Created By JD.Francis on 9/26/18
 */
import {Service} from "../services/ServiceManager";
import {SpotifyService} from "../services/SpotifyService";
import * as Timeout from 'await-timeout';
import * as _ from "lodash";
import {Observable} from "rxjs/index";
import {UserService} from "../services/UserService";
import {ChannelService} from "../services/ChannelService";

export class ChannelPlayer {
    _id: number;
    channel_id: number;
    channel_name: string;
    current_song: any = null;  // Current song uri + start time
    songHistory: any[] = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
    currentDevices: any[] = [];
    // -- dj_queue will be in the order that djs will take turns in
    dj_queue: any[] = [];// ["User 1", "User 2", "User 3"]
    channel_listeners: any; //User id list of who is listening

    spotifyService: SpotifyService;
    userService: UserService;
    channelService: ChannelService;
    outgoingMessageEmitter;
    outgoingMessages: Observable<any>;

    constructor(channelData) {
        //Setup data
        this._id = channelData['_id'];
        this.channel_name = channelData['channel_name'];
        this.channel_id = channelData['channel_id'];
        this.channel_listeners = channelData['channel_listeners'] || [];
        this.dj_queue = channelData['dj_queue'] || [];

        //Init services
        this.spotifyService = Service.getService(SpotifyService);
        this.userService = Service.getService(UserService);
        this.channelService = Service.getService(ChannelService);

        //Init outgoing messages
        this.outgoingMessages = Observable.create(e => this.outgoingMessageEmitter = e);
        this.outgoingMessages.subscribe(this.outgoingMessageEmitter);
    }

    addListener(user) {
        let listenerId = user;
        if (typeof user !== 'string') {
            listenerId = user.user_uuid;
        }
        let existingListener = this.channel_listeners.includes(listenerId);
        if (!existingListener) {
            this.channel_listeners.push(listenerId);
            this.channelService.updateChannelListeners(this, this.channel_listeners);
        }
    }

    async syncUser(user) {
        if (this.current_song == null) {
            return 'no-song';
        }
        if (!this.channel_listeners.includes(user['user_uuid'])) {
            this.addListener(user);
        }
        let currentTimestamp: any = new Date(); // Had to cast it to any to make typescript stop complaining.
        let start_time: any = this.current_song.start_time; // Had to cast it to any to make typescript stop complaining.
        let playbackDifference = Math.abs(currentTimestamp - start_time);
        let playData = {uris: [this.current_song.uri], 'position_ms': playbackDifference};
        try {
            if (_.isNil(user['access_token'])) {
                user = await this.userService.getUser({user_uuid: user['user_uuid']});
            }
            let response = await this.spotifyService.spotifyApi(user, 'play', playData);
            // if (response === 'not-premium') {
            //     return response;
            // }
            return 'syncing';
        }
        catch (e) {
            console.error('unable to sync music. playData = ');
            console.error(playData);
            console.error('access_token = ' + user['access_token']);
            console.error(e);
        }
    }

    scheduleSongTransition(current_song) {
        let timer = new Timeout();
        this.current_song.timer = timer;
        timer.set(current_song['duration_ms']).then(() => {
            this.nextSong();
        });
    }

    async syncChannelListeners() {
        //TODO: figure out the channel_listeners logic
        for (let listenerId of this.channel_listeners) {
            let user = await this.userService.getUser({user_uuid: listenerId});
            this.syncUser(user);
        }
    }

    async moveTopSongToBottom(user) {
        try {
            let playlist = await this.spotifyService.spotifyApi(user, 'getPlaylist', user['playlist_id']);
            let playlistLength = playlist.body.tracks.total;
            let res = await this.spotifyService.spotifyApi(user, 'reorderTracksInPlaylist', user['playlist_id'], 0, playlistLength);
        }
        catch (e) {
            console.error("Unable to move user track from top to bottom");
            console.error(e);
        }
    }

    async getUsersNextSong(user) {
        try {
            let tracks = await this.spotifyService.spotifyApi(user, 'getPlaylistTracks', user.playlist_id);
            return tracks.body.items[0];
        }
        catch (e) {
            console.error("Unable to find users playlist songs");

            // console.error(e);
        }
    }

    //Converts uuids to user objs
    async getChannelListeners() {
        let fullUserData = [];
        for (let listener of this.channel_listeners) {
            fullUserData.push(await this.userService.getUser({user_uuid:listener}));
        }
        return fullUserData;
    }

    updateCurrentSong(track) {
        this.current_song = {
            uri: track['uri'],
            start_time: new Date(),
            duration_ms: track['duration_ms'],
            track_data: track
        };
        //write out to db
        this.channelService.updateCurrentSong(this, this.current_song);
    }

    //Cancel the current song timer
    clearCurrentSong() {
        if (!_.isNil(this.current_song)) {
            if (!_.isNil(this.current_song.timer)) {
                this.current_song.timer.clear();
            }
        }
    }

    getCurrentSong() {
        if (_.isNil(this.current_song)) {
            return 'no-song-playing';
        }
        else {
            return {track: this.current_song, user:this.dj_queue[0]};
        }

    }

    async nextSong() {
        //Move to the next DJ - this will update the DJ order and get the next person
        let nextDj = await this.goToNextDj();
        // nextDj = await this.userService.getUser({user_uuid:nextDj});
        //Get the next song
        let nextSong = await this.getUsersNextSong(nextDj);
        if (_.isNil(nextSong)) {
            console.error("unable to find users nextSong! user = " + JSON.stringify(nextDj));
        }
        //Cycle their song to the bottom of their playlist
        this.moveTopSongToBottom(nextDj);
        //Send out the message of whats playing
        this.outgoingMessageEmitter.next(
            {type: "nowPlaying", data: nextSong.track, channel: this.channel_name, user: nextDj}
        );
        //Update the channel obj, and write to db
        this.updateCurrentSong(nextSong.track);
        //Sync all the listening devices up
        await this.syncChannelListeners();
        //Schedule the next song to start after this one
        this.scheduleSongTransition(nextSong.track);
    }

    goToNextDj() {
        this.cycleFirstArrayItem(this.dj_queue);
        this.channelService.updateDjQueue(this, this.dj_queue);
        return this.dj_queue[0];
    }

    addDj(dj) {
        let existingDj = _.find(this.dj_queue, (queueDj) => {
            return queueDj['user_uuid'] == dj['user_uuid']
        });
        if (!_.isNil(existingDj)) {
            return 'already-added';
        }
        else {
            this.dj_queue.push(dj);
            this.channelService.updateDjQueue(this, this.dj_queue);
            if (this.current_song == null) {
                this.nextSong()
            }
            return 'added';
        }
    }

    removeDj(dj) {
        let existingDj = _.find(this.dj_queue, (queueDj) => {
            return queueDj['user_uuid'] == dj['user_uuid']
        });
        if (_.isNil(existingDj)) {
            return 'doesnt-exist';
        }
        else {
            _.remove(this.dj_queue, (queueDj) => {
                return queueDj['user_uuid'] == dj['user_uuid'];
            });
            this.channelService.updateDjQueue(this, this.dj_queue);
            return 'removed';
        }
    }

    removeListener(user) {
        let existingListener = this.channel_listeners.includes(user['user_uuid']);
        if (!existingListener) {
            return 'listener-doesnt-exist';
        }
        else {
            _.remove(this.channel_listeners, (listener) => {
                return listener == user['user_uuid'];
            });
            this.channelService.updateChannelListeners(this, this.channel_listeners);
            this.spotifyService.spotifyApi(user, 'pause');
            return 'removed-listener';
        }
    }

    moveDjPosition(dj, newPosition) {
        //TODO: First implement 'admin' roles
        //TODO: find dj reference and move them to new position
    }

    async getCurrentDjs() {
        let djList = [];
        for (let dj of this.dj_queue) {
            let fullDjUserInfo = await this.userService.getUser({user_uuid: dj['user_uuid']});
            djList.push(fullDjUserInfo)
        }
        return djList;
    }

    cycleFirstArrayItem(array) {
        if (array.length > 1) {
            let firstItem = array[0];
            array.shift();
            array.push(firstItem);
        }
        return array;
    }
}
