"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Created By JD.Francis on 9/26/18
 */
const ServiceManager_1 = require("../services/ServiceManager");
const SpotifyService_1 = require("../services/SpotifyService");
const Timeout = require("await-timeout");
const _ = require("lodash");
const index_1 = require("rxjs/index");
const UserService_1 = require("../services/UserService");
const ChannelService_1 = require("../services/ChannelService");
class ChannelPlayer {
    constructor(channelData) {
        this.current_song = null; // Current song uri + start time
        this.songHistory = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
        this.currentDevices = [];
        // -- dj_queue will be in the order that djs will take turns in
        this.dj_queue = []; // ["User 1", "User 2", "User 3"]
        //Setup data
        this._id = channelData['_id'];
        this.channel_name = channelData['channel_name'];
        this.channel_id = channelData['channel_id'];
        this.channel_listeners = channelData['channel_listeners'] || [];
        this.dj_queue = channelData['dj_queue'] || [];
        //Init services
        this.spotifyService = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService);
        this.userService = ServiceManager_1.Service.getService(UserService_1.UserService);
        this.channelService = ServiceManager_1.Service.getService(ChannelService_1.ChannelService);
        //Init outgoing messages
        this.outgoingMessages = index_1.Observable.create(e => this.outgoingMessageEmitter = e);
        this.outgoingMessages.subscribe(this.outgoingMessageEmitter);
        this.current_song = channelData['current_song'] || null;
        this.resumePlayback();
    }
    resumePlayback() {
        if (!_.isNil(this.current_song) && this.dj_queue.length > 0) {
            let playback_position_ms = this.getPlaybackOffset(this.current_song.start_time);
            if (playback_position_ms >= this.current_song.duration_ms) {
                this.nextSong();
            }
            else {
                this.scheduleSongTransition(this.current_song, playback_position_ms);
            }
        }
    }
    getPlaybackOffset(start_time) {
        let currentTimestamp = new Date(); // Had to cast it to any to make typescript stop complaining.
        return Math.abs(currentTimestamp - start_time);
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
    syncUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.current_song == null) {
                return 'no-song';
            }
            if (!this.channel_listeners.includes(user['user_uuid'])) {
                this.addListener(user);
            }
            let start_time = this.current_song.start_time; // Had to cast it to any to make typescript stop complaining.
            let playbackDifference = this.getPlaybackOffset(start_time);
            let playData = { uris: [this.current_song.uri], 'position_ms': playbackDifference };
            try {
                if (_.isNil(user['access_token'])) {
                    user = yield this.userService.getUser({ user_uuid: user['user_uuid'] });
                }
                let response = yield this.spotifyService.spotifyApi(user, 'play', playData);
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
        });
    }
    scheduleSongTransition(current_song, offset = 0) {
        let timer = new Timeout();
        this.current_song.timer = timer;
        timer.set(current_song['duration_ms'] - offset).then(() => {
            this.nextSong();
        });
    }
    syncChannelListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: figure out the channel_listeners logic
            for (let listenerId of this.channel_listeners) {
                let user = yield this.userService.getUser({ user_uuid: listenerId });
                this.syncUser(user);
            }
        });
    }
    moveTopSongToBottom(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let playlist = yield this.spotifyService.spotifyApi(user, 'getPlaylist', user['playlist_id']);
                let playlistLength = playlist.body.tracks.total;
                let res = yield this.spotifyService.spotifyApi(user, 'reorderTracksInPlaylist', user['playlist_id'], 0, playlistLength);
            }
            catch (e) {
                console.error("Unable to move user track from top to bottom");
                console.error(e);
            }
        });
    }
    getUsersNextSong(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tracks = yield this.spotifyService.spotifyApi(user, 'getPlaylistTracks', user.playlist_id);
                return tracks.body.items[0];
            }
            catch (e) {
                console.error("Unable to find users playlist songs");
                // console.error(e);
            }
        });
    }
    //Converts uuids to user objs
    getChannelListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            let fullUserData = [];
            for (let listener of this.channel_listeners) {
                fullUserData.push(yield this.userService.getUser({ user_uuid: listener }));
            }
            return fullUserData;
        });
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
            return { track: this.current_song, user: this.dj_queue[0] };
        }
    }
    nextSong() {
        return __awaiter(this, void 0, void 0, function* () {
            //Move to the next DJ - this will update the DJ order and get the next person
            let nextDj = yield this.goToNextDj();
            // nextDj = await this.userService.getUser({user_uuid:nextDj});
            //Get the next song
            let nextSong = yield this.getUsersNextSong(nextDj);
            if (_.isNil(nextSong)) {
                console.error("unable to find users nextSong! user = " + JSON.stringify(nextDj));
                this.current_song = null;
                return;
            }
            //Cycle their song to the bottom of their playlist
            this.moveTopSongToBottom(nextDj);
            //Send out the message of whats playing
            this.outgoingMessageEmitter.next({ type: "nowPlaying", data: nextSong.track, channel: this.channel_name, user: nextDj });
            //Update the channel obj, and write to db
            this.updateCurrentSong(nextSong.track);
            //Sync all the listening devices up
            yield this.syncChannelListeners();
            //Schedule the next song to start after this one
            this.scheduleSongTransition(nextSong.track);
        });
    }
    goToNextDj() {
        this.cycleFirstArrayItem(this.dj_queue);
        this.channelService.updateDjQueue(this, this.dj_queue);
        return this.dj_queue[0];
    }
    addDj(dj) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingDj = _.find(this.dj_queue, (queueDj) => {
                return queueDj['user_uuid'] == dj['user_uuid'];
            });
            if (!_.isNil(existingDj)) {
                return 'already-added';
            }
            else {
                let nextSong = yield this.getUsersNextSong(dj);
                if (_.isNil(nextSong)) { //User didnt have a song ready to dj so we kick them back
                    return 'empty-playlist';
                }
                this.dj_queue.push(dj);
                this.channelService.updateDjQueue(this, this.dj_queue);
                if (this.current_song == null) {
                    this.nextSong();
                }
                return 'added';
            }
        });
    }
    removeDj(dj) {
        let existingDj = _.find(this.dj_queue, (queueDj) => {
            return queueDj['user_uuid'] == dj['user_uuid'];
        });
        if (_.isNil(existingDj)) {
            return 'doesnt-exist';
        }
        else {
            _.remove(this.dj_queue, (queueDj) => {
                return queueDj['user_uuid'] == dj['user_uuid'];
            });
            if (this.dj_queue.length === 0) {
                this.clearCurrentSong();
                this.current_song = null;
            }
            this.channelService.updateDjQueue(this, this.dj_queue);
            this.channelService.updateCurrentSong(this, this.current_song);
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
    getCurrentDjs() {
        return __awaiter(this, void 0, void 0, function* () {
            let djList = [];
            for (let dj of this.dj_queue) {
                let fullDjUserInfo = yield this.userService.getUser({ user_uuid: dj['user_uuid'] });
                djList.push(fullDjUserInfo);
            }
            return djList;
        });
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
exports.ChannelPlayer = ChannelPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL0NoYW5uZWxQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBQ0gsK0RBQW1EO0FBQ25ELCtEQUEwRDtBQUMxRCx5Q0FBeUM7QUFDekMsNEJBQTRCO0FBQzVCLHNDQUFzQztBQUN0Qyx5REFBb0Q7QUFDcEQsK0RBQTBEO0FBRTFELE1BQWEsYUFBYTtJQWlCdEIsWUFBWSxXQUFXO1FBYnZCLGlCQUFZLEdBQVEsSUFBSSxDQUFDLENBQUUsZ0NBQWdDO1FBQzNELGdCQUFXLEdBQVUsRUFBRSxDQUFDLENBQUMscURBQXFEO1FBQzlFLG1CQUFjLEdBQVUsRUFBRSxDQUFDO1FBQzNCLCtEQUErRDtRQUMvRCxhQUFRLEdBQVUsRUFBRSxDQUFDLENBQUEsaUNBQWlDO1FBVWxELFlBQVk7UUFDWixJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hFLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU5QyxlQUFlO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQywrQkFBYyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLGNBQWMsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQywr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