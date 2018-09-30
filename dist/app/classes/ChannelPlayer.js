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
const SpotifyService_1 = require("../../spotify/services/SpotifyService");
const ServiceManager_1 = require("../services/ServiceManager");
class ChannelPlayer {
    constructor(channel_id, channel_name) {
        this.currentSong = {
            uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
            startTime: new Date()
        };
        this.songHistory = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
        this.currentDevices = [];
        this.users = []; //-- list of users - users with active = true will receive sync updates
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
            let playlist = yield this.spotifyApi.getPlaylist(user['playlist_id']);
            console.log(playlist);
            console.log(playlist['total']);
        });
    }
    getUsersNextSong(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tracks = yield this.spotifyApi.getPlaylistTracks(user.playlist_id);
                this.moveTopSongToBottom(user);
                return tracks.body.items[0];
            }
            catch (e) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY2xhc3Nlcy9DaGFubmVsUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFJQSwwRUFBcUU7QUFDckUsK0RBQW1EO0FBR25ELE1BQWEsYUFBYTtJQWV0QixZQUFZLFVBQVUsRUFBRSxZQUFZO1FBWHBDLGdCQUFXLEdBQVc7WUFDbEIsR0FBRyxFQUFFLHNDQUFzQztZQUMzQyxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUU7U0FDeEIsQ0FBQztRQUNGLGdCQUFXLEdBQVUsRUFBRSxDQUFDLENBQUMscURBQXFEO1FBQzlFLG1CQUFjLEdBQVUsRUFBRSxDQUFDO1FBQzNCLFVBQUssR0FBVyxFQUFFLENBQUMsQ0FBQyx1RUFBdUU7UUFDM0YsOERBQThEO1FBQzlELFlBQU8sR0FBVSxFQUFFLENBQUMsQ0FBQSxpQ0FBaUM7UUFJakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQywrQkFBYyxDQUFDLENBQUMsVUFBVSxDQUFDO0lBQ3BFLENBQUM7SUFFSyxRQUFRLENBQUMsSUFBSTs7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLGdCQUFnQixHQUFRLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyw2REFBNkQ7WUFDckcsSUFBSSxTQUFTLEdBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2REFBNkQ7WUFDOUcsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksUUFBUSxHQUFHLEVB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