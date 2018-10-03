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
        this.spotifyService = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService);
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
            let newChannel = new ChannelPlayer_1.ChannelPlayer(channel['id'], channel['name'], this.bot);
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
        return __awaiter(this, void 0, void 0, function* () {
            //add channel
            let user = yield this.userService.loginUser(userData);
            if (!_.isNil(user.channel)) {
                this.createChannel(user.channel, [user]);
            }
            return user;
        });
    }
    searchSongs(searchString) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.spotifyApi.searchTracks(searchString);
            return data.body;
        });
    }
}
exports.App = App;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsYXNzZXMvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7OztBQUVILG1EQUE4QztBQUM5Qyw0QkFBNEI7QUFFNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCwrREFBMEQ7QUFHMUQsTUFBYSxHQUFHO0lBU1o7UUFQQSxpQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixhQUFRLEdBQW9CLEVBQUUsQ0FBQztRQU8zQixJQUFJLENBQUMsV0FBVyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLHlCQUFXLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO0lBQ3JELENBQUM7SUFFRCxhQUFhLENBQUMsVUFBVTtRQUNwQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3JDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxjQUFjLENBQUMsSUFBSTtRQUNmLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1RSxPQUFPO1NBQ1Y7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsY0FBYyxDQUFDLElBQUk7UUFDZixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxhQUFhLENBQUMsT0FBTyxFQUFFLGVBQXVCLEVBQUU7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2pDLElBQUksVUFBVSxHQUFHLElBQUksNkJBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3RSxVQUFVLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUN4QixVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEM7YUFDSTtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUMxQztJQUNMLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBUTtRQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFSyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sR0FBRyxPQUFPOztZQUN4RCxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUMzRSxDQUFDO0tBQUE7SUFFSyxTQUFTLENBQUMsUUFBUTs7WUFDcEIsYUFBYTtZQUNiLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUFBO0lBRUssV0FBVyxDQUFDLFlBQVk7O1lBQzFCLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDNUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLENBQUM7S0FBQTtDQUNKO0FBcEVELGtCQW9FQyJ9