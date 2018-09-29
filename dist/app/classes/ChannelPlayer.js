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
    }
    syncUser(spotifyApi, user) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("syncing user");
            spotifyApi.setAccessToken(user['access_token']);
            let currentTimestamp = new Date(); // Had to cast it to any to make typescript stop complaining.
            let startTime = this.currentSong.startTime; // Had to cast it to any to make typescript stop complaining.
            let playbackDifference = Math.abs(currentTimestamp - startTime);
            let playData = { uris: [this.currentSong.uri], 'position_ms': playbackDifference };
            try {
                yield spotifyApi.play(playData);
            }
            catch (e) {
                console.error('unable to sync music =( playData = ');
                console.error(playData);
                console.error(e);
            }
        });
    }
    syncUsers(users, spotifyApi) {
        for (let user of users) {
            this.syncUser(spotifyApi, user);
        }
    }
    getUsersNextSong(user, spotifyApi) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tracks = yield spotifyApi.getPlaylistTracks(user.playlist_id);
                //TODO: Cycle through user's playlist after this
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
    nextSong(users, spotifyApi) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("skipping to next");
            // this.goToNextDj();
            let nextSong = yield this.getUsersNextSong(users[0], spotifyApi);
            console.log(nextSong);
            this.updateCurrentSong(nextSong.track['uri']);
            this.syncUsers(users, spotifyApi);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY2xhc3Nlcy9DaGFubmVsUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFNQSxNQUFhLGFBQWE7SUFjdEIsWUFBWSxVQUFVLEVBQUUsWUFBWTtRQVZwQyxnQkFBVyxHQUFXO1lBQ2xCLEdBQUcsRUFBRSxzQ0FBc0M7WUFDM0MsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3hCLENBQUM7UUFDRixnQkFBVyxHQUFVLEVBQUUsQ0FBQyxDQUFDLHFEQUFxRDtRQUM5RSxtQkFBYyxHQUFVLEVBQUUsQ0FBQztRQUMzQixVQUFLLEdBQVcsRUFBRSxDQUFDLENBQUMsdUVBQXVFO1FBQzNGLDhEQUE4RDtRQUM5RCxZQUFPLEdBQVUsRUFBRSxDQUFDLENBQUEsaUNBQWlDO1FBR2pELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0lBQ3JDLENBQUM7SUFFSyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUk7O1lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDNUIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLGdCQUFnQixHQUFRLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyw2REFBNkQ7WUFDckcsSUFBSSxTQUFTLEdBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2REFBNkQ7WUFDOUcsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksUUFBUSxHQUFHLEVBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztZQUNqRixJQUFJO2dCQUNBLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNuQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztnQkFDckQsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQjtRQUNMLENBQUM7S0FBQTtJQUVELFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBVTtRQUN2QixLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtZQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNuQztJQUNMLENBQUM7SUFFSyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsVUFBVTs7WUFDbkMsSUFBSTtnQkFDQSxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2xFLGdEQUFnRDtnQkFDaEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEI7UUFDTCxDQUFDO0tBQUE7SUFFRCxpQkFBaUIsQ0FBQyxPQUFPO1FBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUc7WUFDZixHQUFHLEVBQUUsT0FBTztZQUNaLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN4QixDQUFBO0lBQ0wsQ0FBQztJQUVLLFFBQVEsQ0FBQyxLQUFLLEVBQUUsVUFBVTs7WUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hDLHFCQUFxQjtZQUNyQixJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7S0FBQTtJQUVELG9CQUFvQjtJQUNwQixVQUFVO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FBQyxFQUFFO1FBQ0oseUNBQXlDO0lBQzdDLENBQUM7SUFFRCxRQUFRLENBQUMsRUFBRTtRQUNQLDRDQUE0QztJQUNoRCxDQUFDO0lBRUQsY0FBYyxDQUFDLEVBQUUsRUFBRSxXQUFXO1FBQzFCLHVEQUF1RDtJQUMzRCxDQUFDO0lBR0QsK0JBQStCO0lBQy9CLGdDQUFnQztJQUNoQyw2QkFBNkI7SUFDN0IsNkJBQTZCO0lBQzdCLG9CQUFvQjtJQUNwQixJQUFJO0lBRUosWUFBWTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUFoR0Qsc0NBZ0dDIn0=