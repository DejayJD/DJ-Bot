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
const _ = require("lodash");
class ChannelPlayer {
    constructor(channel_id, channel_name, bot) {
        this.currentSong = {
            uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
            startTime: new Date(),
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
                console.error('unable to sync music. playData = ');
                console.error(playData);
                console.error('access_token = ' + user['access_token']);
                console.error(e);
            }
        });
    }
    scheduleSongTransition(currentSong, users) {
        return __awaiter(this, void 0, void 0, function* () {
            let timer = new Timeout();
            this.currentSong.timer = timer;
            timer.set(currentSong['duration_ms']).then(() => {
                this.nextSong(users);
            });
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
                this.spotifyApi.setAccessToken(user['access_token']);
                let tracks = yield this.spotifyApi.getPlaylistTracks(user.playlist_id);
                return tracks.body.items[0];
            }
            catch (e) {
                console.error("Unable to find users playlist songs");
                console.error(e);
            }
        });
    }
    updateCurrentSong(track) {
        this.currentSong = {
            uri: track['uri'],
            startTime: new Date(),
            duration_ms: track['duration_ms']
        };
    }
    clearCurrentSong() {
        if (!_.isNil(this.currentSong.timer)) {
            this.currentSong.timer.clear();
        }
    }
    nextSong(users) {
        return __awaiter(this, void 0, void 0, function* () {
            let nextDj = yield this.goToNextDj();
            //TODO: Implement DJ queue
            let nextSong = yield this.getUsersNextSong(nextDj);
            if (_.isNil(nextSong)) {
                console.error("unable to find users nextSong! user = " + JSON.stringify(nextDj));
            }
            this.moveTopSongToBottom(nextDj);
            this.bot.sendWebhook({
                text: 'Now playing ' + nextSong.track['name'],
                channel: this.channel_name,
            }, function (err, res) { });
            this.updateCurrentSong(nextSong.track);
            //TODO: figure out listeners logic
            this.scheduleSongTransition(nextSong.track, users);
            this.syncUsers(users);
        });
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
exports.ChannelPlayer = ChannelPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL0NoYW5uZWxQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUlBLCtEQUFtRDtBQUVuRCwrREFBMEQ7QUFDMUQseUNBQXlDO0FBQ3pDLDRCQUE0QjtBQUU1QixNQUFhLGFBQWE7SUFjdEIsWUFBWSxVQUFVLEVBQUUsWUFBWSxFQUFFLEdBQUc7UUFYekMsZ0JBQVcsR0FBVztZQUNsQixHQUFHLEVBQUUsc0NBQXNDO1lBQzNDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN4QixDQUFDO1FBQ0YsZ0JBQVcsR0FBVSxFQUFFLENBQUMsQ0FBQyxxREFBcUQ7UUFDOUUsbUJBQWMsR0FBVSxFQUFFLENBQUM7UUFDM0IsOERBQThEO1FBQzlELFlBQU8sR0FBVSxFQUFFLENBQUMsQ0FBQSxpQ0FBaUM7UUFLakQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLENBQUMsQ0FBQyxVQUFVLENBQUM7SUFDcEUsQ0FBQztJQUVLLFFBQVEsQ0FBQyxJQUFJOztZQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksZ0JBQWdCLEdBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLDZEQUE2RDtZQUNyRyxJQUFJLFNBQVMsR0FBUSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLDZEQUE2RDtZQUM5RyxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFDaEUsSUFBSSxRQUFRLEdBQUcsRUFBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBQyxDQUFDO1lBQ2pGLElBQUk7Z0JBQ0EsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN4QztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztnQkFDbkQsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDeEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQjtRQUNMLENBQUM7S0FBQTtJQUVLLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxLQUFLOztZQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFFLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFUCxDQUFDO0tBQUE7SUFFRCxTQUFTLENBQUMsS0FBSztRQUNYLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7SUFDTCxDQUFDO0lBRUssbUJBQW1CLENBQUMsSUFBSTs7WUFDMUIsSUFBSTtnQkFDQSxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLGNBQWMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2hELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2FBQ25HO1lBQ0QsT0FBTyxDQUFDLEVBQUM7Z0JBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BCO1FBQ0wsQ0FBQztLQUFBO0lBRUssZ0JBQWdCLENBQUMsSUFBSTs7WUFDdkIsSUFBSTtnQkFDQSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDckQsSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdkUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztnQkFDckQsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQjtRQUNMLENBQUM7S0FBQTtJQUVELGlCQUFpQixDQUFDLEtBQUs7UUFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRztZQUNmLEdBQUcsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtZQUNyQixXQUFXLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQztTQUNwQyxDQUFBO0lBQ0wsQ0FBQztJQUVELGdCQUFnQjtRQUNaLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBRUssUUFBUSxDQUFDLEtBQUs7O1lBQ2hCLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JDLDBCQUEwQjtZQUMxQixJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0NBQXdDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3BGO1lBQ0QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUNqQixJQUFJLEVBQUUsY0FBYyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUM3QyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDN0IsRUFBQyxVQUFTLEdBQUcsRUFBQyxHQUFHLElBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV2QyxrQ0FBa0M7WUFDbEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixDQUFDO0tBQUE7SUFFRCxvQkFBb0I7SUFDcEIsVUFBVTtRQUNOLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxLQUFLLENBQUMsRUFBRTtRQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxRQUFRLENBQUMsRUFBRTtRQUNQLDRDQUE0QztJQUNoRCxDQUFDO0lBRUQsY0FBYyxDQUFDLEVBQUUsRUFBRSxXQUFXO1FBQzFCLHVEQUF1RDtJQUMzRCxDQUFDO0lBR0QsbUJBQW1CLENBQUMsS0FBSztRQUNyQixJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDekI7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsWUFBWTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUE3SUQsc0NBNklDIn0=