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
const Timeout = require("await-timeout");
class ChannelPlayer {
    constructor(channel_id, channel_name, bot) {
        this.currentSong = {
            uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
            startTime: new Date()
        };
        this.songHistory = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
        this.currentDevices = [];
        // -- djQueue will be in the order that djs will take turns in
        this.djQueue = []; // ["User 1", "User 2", "User 3"]
        this.bot = bot;
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
    scheduleSongTransition(currentSong, users) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Timeout.set(currentSong['duration_ms']);
            console.log("song is finished. Going to next song!");
            this.nextSong(users);
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
            this.moveTopSongToBottom(users[0]);
            this.bot.sendWebhook({
                text: 'Now playing ' + nextSong.track['name'],
                channel: this.channel_name,
            }, function (err, res) {
                if (err) {
                    // ...
                }
            });
            this.updateCurrentSong(nextSong.track['uri']);
            this.scheduleSongTransition(nextSong.track, users);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL0NoYW5uZWxQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUlBLCtEQUFtRDtBQUVuRCwrREFBMEQ7QUFDMUQseUNBQXlDO0FBRXpDLE1BQWEsYUFBYTtJQWV0QixZQUFZLFVBQVUsRUFBRSxZQUFZLEVBQUUsR0FBRztRQVh6QyxnQkFBVyxHQUFXO1lBQ2xCLEdBQUcsRUFBRSxzQ0FBc0M7WUFDM0MsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3hCLENBQUM7UUFDRixnQkFBVyxHQUFVLEVBQUUsQ0FBQyxDQUFDLHFEQUFxRDtRQUM5RSxtQkFBYyxHQUFVLEVBQUUsQ0FBQztRQUMzQiw4REFBOEQ7UUFDOUQsWUFBTyxHQUFVLEVBQUUsQ0FBQyxDQUFBLGlDQUFpQztRQUtqRCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztJQUNwRSxDQUFDO0lBRUssUUFBUSxDQUFDLElBQUk7O1lBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxnQkFBZ0IsR0FBUSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsNkRBQTZEO1lBQ3JHLElBQUksU0FBUyxHQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsNkRBQTZEO1lBQzlHLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUNoRSxJQUFJ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