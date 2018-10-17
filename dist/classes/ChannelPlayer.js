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
            let currentTimestamp = new Date(); // Had to cast it to any to make typescript stop complaining.
            let start_time = this.current_song.start_time; // Had to cast it to any to make typescript stop complaining.
            let playbackDifference = Math.abs(currentTimestamp - start_time);
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
    scheduleSongTransition(current_song) {
        let timer = new Timeout();
        this.current_song.timer = timer;
        timer.set(current_song['duration_ms']).then(() => {
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