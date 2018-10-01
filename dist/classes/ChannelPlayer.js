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
const ServiceManager_1 = require("../services/ServiceManager");
const SpotifyService_1 = require("../services/SpotifyService");
class ChannelPlayer {
    constructor(channel_id, channel_name) {
        this.currentSong = {
            uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
            startTime: new Date()
        };
        this.songHistory = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
        this.currentDevices = [];
        // -- djQueue will be in the order that djs will take turns in
        this.djQueue = []; // ["User 1", "User 2", "User 3"]
        this.channel_id = channel_id;
        this.channel_name = channel_name;
        this.spotifyApi = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService).spotifyApi;
    }
    syncUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            this.spotifyApi.setAccessToken(user['access_token']);
            let currentTimestamp = new Date(); // Had to cast it to any to make typescript stop complaining.
            let startTime = this.currentSong.startTime; // Had to cast it to any to make typescript stop complaining.
            let playbackDifference = Math.abs(currentTimestamp - startTime);
            let playData = { uris: [this.currentSong.uri], 'position_ms': playbackDifference };
            try {
                yield this.spotifyApi.play(playData);
            }
            catch (e) {
                console.error('unable to sync music =( playData = ');
                console.error(playData);
                console.error(e);
            }
        });
    }
    syncUsers(users) {
        for (let user of users) {
            this.syncUser(user);
        }
    }
    moveTopSongToBottom(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let playlist = yield this.spotifyApi.getPlaylist(user['playlist_id']);
                let playlistLength = playlist.body.tracks.total;
                let res = yield this.spotifyApi.reorderTracksInPlaylist(user['playlist_id'], 0, playlistLength);
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
                let tracks = yield this.spotifyApi.getPlaylistTracks(user.playlist_id);
                return tracks.body.items[0];
            }
            catch (e) {
                console.error("Unable to find users playlist songs");
                console.error(e);
            }
        });
    }
    updateCurrentSong(songUri) {
        this.currentSong = {
            uri: songUri,
            startTime: new Date()
        };
    }
    nextSong(users) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.goToNextDj();
            //TODO: Implement DJ queue
            let nextSong = yield this.getUsersNextSong(users[0]);
            this.updateCurrentSong(nextSong.track['uri']);
            this.syncUsers(users);
        });
    }
    //TODO: add DJ logic
    goToNextDj() {
    }
    addDj(dj) {
        //TODO: find and add a dj to the dj queue
    }
    removeDj(dj) {
        //TODO: find and remove a dj to the dj queue
    }
    moveDjPosition(dj, newPosition) {
        //TODO: find dj reference and move them to new position
    }
    // cycleFirstArrayItem(array) {
    //     let firstItem = array[0];
    //     array = array.shift();
    //     array.push(firstItem);
    //     return array;
    // }
    getCurrentDJ() {
        return this.djQueue[0];
    }
}
exports.ChannelPlayer = ChannelPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL0NoYW5uZWxQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUlBLCtEQUFtRDtBQUVuRCwrREFBMEQ7QUFFMUQsTUFBYSxhQUFhO0lBY3RCLFlBQVksVUFBVSxFQUFFLFlBQVk7UUFWcEMsZ0JBQVcsR0FBVztZQUNsQixHQUFHLEVBQUUsc0NBQXNDO1lBQzNDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN4QixDQUFDO1FBQ0YsZ0JBQVcsR0FBVSxFQUFFLENBQUMsQ0FBQyxxREFBcUQ7UUFDOUUsbUJBQWMsR0FBVSxFQUFFLENBQUM7UUFDM0IsOERBQThEO1FBQzlELFlBQU8sR0FBVSxFQUFFLENBQUMsQ0FBQSxpQ0FBaUM7UUFJakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQywrQkFBYyxDQUFDLENBQUMsVUFBVSxDQUFDO0lBQ3BFLENBQUM7SUFFSyxRQUFRLENBQUMsSUFBSTs7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLGdCQUFnQixHQUFRLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyw2REFBNkQ7WUFDckcsSUFBSSxTQUFTLEdBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2REFBNkQ7WUFDOUcsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksUUFBUSxHQUFHLEVBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENB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