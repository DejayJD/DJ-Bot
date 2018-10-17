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
        this.current_song = {
            uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
            start_time: new Date()
        }; // Current song uri + start time
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
        let existingDj = _.find(this.dj_queue, (queueDj) => {
            return queueDj['user_uuid'] == dj['user_uuid'];
        });
        if (!_.isNil(existingDj)) {
            return 'already-added';
        }
        else {
            this.dj_queue.push(dj);
            this.channelService.updateDjQueue(this, this.dj_queue);
            // TODO: fix this
            // if (this.current_song == null) {
            //     this.nextSong()
            // }
            return 'added';
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL0NoYW5uZWxQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBQ0gsK0RBQW1EO0FBQ25ELCtEQUEwRDtBQUMxRCx5Q0FBeUM7QUFDekMsNEJBQTRCO0FBQzVCLHNDQUFzQztBQUN0Qyx5REFBb0Q7QUFDcEQsK0RBQTBEO0FBRTFELE1BQWEsYUFBYTtJQW9CdEIsWUFBWSxXQUFXO1FBaEJ2QixpQkFBWSxHQUFRO1lBQ2hCLEdBQUcsRUFBRSxzQ0FBc0M7WUFDM0MsVUFBVSxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3pCLENBQUMsQ0FBRSxnQ0FBZ0M7UUFDcEMsZ0JBQVcsR0FBVSxFQUFFLENBQUMsQ0FBQyxxREFBcUQ7UUFDOUUsbUJBQWMsR0FBVSxFQUFFLENBQUM7UUFDM0IsK0RBQStEO1FBQy9ELGFBQVEsR0FBVSxFQUFFLENBQUMsQ0FBQSxpQ0FBaUM7UUFVbEQsWUFBWTtRQUNaLElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxXQUFXLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTlDLGVBQWU7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsV0FBVyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLHlCQUFXLENB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