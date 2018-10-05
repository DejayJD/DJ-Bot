/*
 *  Created By JD.Francis on 9/26/18
 */
import {Service} from "../services/ServiceManager";
import {Track} from "../models/Track";
import {SpotifyService} from "../services/SpotifyService";
import * as Timeout from 'await-timeout';
import * as _ from "lodash";
import {Observable} from "rxjs/index";

export class ChannelPlayer {
    channel_id: number;
    channel_name: string;
    currentSong?: Track = {  // Current song uri + start time
        uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
        startTime: new Date()
    };
    songHistory: any[] = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
    currentDevices: any[] = [];
    // -- djQueue will be in the order that djs will take turns in
    djQueue: any[] = [];// ["User 1", "User 2", "User 3"]
    spotifyService: any;

    outgoingMessageEmitter;
    outgoingMessages : Observable<any>;

    constructor(channel_id, channel_name) {
        this.channel_id = channel_id;
        this.channel_name = channel_name;
        this.spotifyService = Service.getService(SpotifyService);
        this.outgoingMessages = Observable.create(e => this.outgoingMessageEmitter = e);
        this.outgoingMessages.subscribe(this.outgoingMessageEmitter);
    }

    async syncUser(user) {
        let currentTimestamp: any = new Date(); // Had to cast it to any to make typescript stop complaining.
        let startTime: any = this.currentSong.startTime; // Had to cast it to any to make typescript stop complaining.
        let playbackDifference = Math.abs(currentTimestamp - startTime);
        let playData = {uris: [this.currentSong.uri], 'position_ms': playbackDifference};
        try {
            await this.spotifyService.spotifyApi(user, 'play', playData);
        }
        catch (e) {
            console.error('unable to sync music. playData = ');
            console.error(playData);
            console.error('access_token = ' + user['access_token']);
            console.error(e);
        }
    }

    async scheduleSongTransition(currentSong, users) {
        let timer = new Timeout();
        this.currentSong.timer = timer;
        timer.set(currentSong['duration_ms']).then(() => {
            this.nextSong(users);
        });

    }

    syncUsers(users) {
        for (let user of users) {
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
            console.error(e);
        }
    }

    updateCurrentSong(track) {
        this.currentSong = {
            uri: track['uri'],
            startTime: new Date(),
            duration_ms: track['duration_ms']
        }
    }

    clearCurrentSong() {
        if (!_.isNil(this.currentSong.timer)) {
            this.currentSong.timer.clear();
        }
    }

    async nextSong(users) {
        let nextDj = await this.goToNextDj();
        //TODO: Implement DJ queue
        let nextSong = await this.getUsersNextSong(nextDj);
        if (_.isNil(nextSong)) {
            console.error("unable to find users nextSong! user = " + JSON.stringify(nextDj));
        }
        this.moveTopSongToBottom(nextDj);
        this.outgoingMessageEmitter.next({type:"nowPlaying", data:nextSong.track, channel:this.channel_name});
        this.updateCurrentSong(nextSong.track);
        this.syncUsers(users);
        //TODO: figure out listeners logic
        this.scheduleSongTransition(nextSong.track, users);
    }

    //TODO: add DJ logic
    goToNextDj() {
        this.cycleFirstArrayItem(this.djQueue);
        return this.djQueue[0];
    }

    addDj(dj) {
        this.djQueue.push(dj);
    }

    removeDj(dj) {
        //TODO: find and remove a dj to the dj queue
    }

    moveDjPosition(dj, newPosition) {
        //TODO: find dj reference and move them to new position
    }


    cycleFirstArrayItem(array) {
        if (array.length > 1) {
            let firstItem = array[0];
            array = array.shift();
            array.push(firstItem);
        }
        return array;
    }

    getCurrentDJ() {
        return this.djQueue[0];
    }
}
