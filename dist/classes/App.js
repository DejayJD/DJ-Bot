"use strict";
/*
 *  Created By JD.Francis on 9/26/18
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChannelPlayer_1 = require("./ChannelPlayer");
const _ = require("lodash");
const UserService_1 = require("../services/UserService");
const ServiceManager_1 = require("../services/ServiceManager");
const SpotifyService_1 = require("../services/SpotifyService");
class App {
    constructor() {
        this.channelLimit = 100;
        this.channels = [];
        this.userService = ServiceManager_1.Service.getService(UserService_1.UserService);
        this.spotifyService = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService, this.userService);
        this.spotifyApi = this.spotifyService.spotifyApi;
    }
    channelExists(channel_id) {
        return _.find(this.channels, (channel) => {
            return channel['id'] == channel_id;
        });
    }
    getUserChannel(user) {
        let channel = _.find(this.channels, { channel_id: user['channel']['id'] });
        if (_.isNil(channel)) {
            console.error(`Unable to find user channel!\nuser:${JSON.stringify(user)}`);
            return;
        }
        return channel;
    }
    skipToNextSong(user) {
        let channel = this.getUserChannel(user);
        channel.nextSong([user]);
    }
    createChannel(channel, initialUsers = []) {
        if (!this.channelExists(channel.id)) {
            let newChannel = new ChannelPlayer_1.ChannelPlayer(channel['id'], channel['name']);
            newChannel.djQueue = [];
            newChannel.djQueue.push(..._.map(initialUsers, 'user_uuid'));
            this.channels.push(newChannel);
        }
        else {
            console.log("Channel already exists!");
        }
    }
    createUser(userData) {
        this.userService.createUser(userData);
    }
    addToUserPlaylist(userId, trackData, context = 'slack') {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.spotifyService.addToUserPlaylist(userId, trackData, context);
        });
    }
    loginUser(userData) {
        //add channel
        let user = this.userService.loginUser(userData);
        if (!_.isNil(user.channel)) {
            this.createChannel(user.channel, [user]);
        }
        return user;
    }
    searchSongs(searchString) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.spotifyApi.searchTracks(searchString);
            return data.body;
        });
    }
}
exports.App = App;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsYXNzZXMvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7OztBQUVILG1EQUE4QztBQUM5Qyw0QkFBNEI7QUFFNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCwrREFBMEQ7QUFFMUQsTUFBYSxHQUFHO0lBUVo7UUFOQSxpQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixhQUFRLEdBQW9CLEVBQUUsQ0FBQztRQU0zQixJQUFJLENBQUMsV0FBVyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLHlCQUFXLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7SUFDckQsQ0FBQztJQUVELGFBQWEsQ0FBQyxVQUFVO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDckMsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGNBQWMsQ0FBQyxJQUFJO1FBQ2YsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVFLE9BQU87U0FDVjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRCxjQUFjLENBQUMsSUFBSTtRQUNmLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELGFBQWEsQ0FBQyxPQUFPLEVBQUUsZUFBdUIsRUFBRTtRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDakMsSUFBSSxVQUFVLEdBQUcsSUFBSSw2QkFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuRSxVQUFVLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUN4QixVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEM7YUFDSTtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUMxQztJQUNMLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBUTtRQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFSyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sR0FBRyxPQUFPOztZQUN4RCxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUMzRSxDQUFDO0tBQUE7SUFFRCxTQUFTLENBQUMsUUFBUTtRQUNkLGFBQWE7UUFDYixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUM1QztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFSyxXQUFXLENBQUMsWUFBWTs7WUFDMUIsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1RCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsQ0FBQztLQUFBO0NBQ0o7QUFuRUQsa0JBbUVDIn0=