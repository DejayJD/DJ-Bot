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
const index_1 = require("rxjs/index");
const ChannelService_1 = require("../services/ChannelService");
class App {
    constructor() {
        this.channelLimit = 100;
        this.channels = [];
        this.userService = ServiceManager_1.Service.getService(UserService_1.UserService);
        this.spotifyService = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService);
        this.channelService = ServiceManager_1.Service.getService(ChannelService_1.ChannelService);
        this.spotifyApi = this.spotifyService.spotifyApi;
        this.outgoingMessages = index_1.Observable.create(e => this.outgoingMessageEmitter = e);
        this.outgoingMessages.subscribe(this.outgoingMessageEmitter);
        this.getChannels();
    }
    getChannels() {
        return __awaiter(this, void 0, void 0, function* () {
            let dbChannels = yield this.channelService.getChannels();
            this.channels = _.map(dbChannels, (channel) => {
                let newChannel = new ChannelPlayer_1.ChannelPlayer(channel);
                this.subscribeToChannelMessages(newChannel);
                return newChannel;
            });
        });
    }
    channelExists(channel_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return _.find(this.channels, (channel) => {
                return channel['id'] == channel_id;
            });
        });
    }
    getUserChannel(user) {
        let channel = _.find(this.channels, { channel_id: user['channel']['id'] });
        if (_.isNil(channel)) {
            if (!_.isNil(user['channel'])) {
                channel = this.getOrCreateChannel(user.channel, [user]);
                return channel;
            }
            return;
        }
        return channel;
    }
    getChannel(channelData) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbChannel = yield this.channelService.getChannel(channelData);
            let playerChannel;
            if (!_.isNil(dbChannel)) {
                playerChannel = _.find(this.channels, (channel) => {
                    return channel.channel_id == dbChannel.channel_id;
                });
            }
            // If the channel isnt found inside the app, thats because the server crashed or something and the channel is gone
            if (_.isNil(playerChannel)) {
                playerChannel = new ChannelPlayer_1.ChannelPlayer(dbChannel);
                this.channels.push(playerChannel);
            }
            return playerChannel;
        });
    }
    skipToNextSong(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = this.getUserChannel(user);
            if (channel.dj_queue.length === 0) {
                return "no-dj";
            }
            channel.clearCurrentSong();
            // user = await this.userService.getUser(user, 'context');
            channel.nextSong();
        });
    }
    subscribeToChannelMessages(channel) {
        channel.outgoingMessages.subscribe((data) => {
            this.outgoingMessageEmitter.next(data);
        });
    }
    getOrCreateChannel(channel, initialUsers = []) {
        return __awaiter(this, void 0, void 0, function* () {
            channel['channel_id'] = channel['id'];
            let existingChannel = yield this.channelService.getChannel(channel);
            if (_.isNil(existingChannel)) {
                let channel_listeners = _.map(initialUsers, 'user_uuid');
                let newChannel = new ChannelPlayer_1.ChannelPlayer({
                    channel_id: channel['id'],
                    channel_name: channel['name'],
                    channel_listeners: channel_listeners
                });
                this.channels.push(newChannel);
                this.subscribeToChannelMessages(newChannel);
                this.channelService.createChannel(newChannel); // write to db
                return newChannel;
            }
            else {
                return existingChannel;
            }
        });
    }
    createUser(userData) {
        this.userService.createUser(userData);
    }
    addDj(user) {
        return __awaiter(this, void 0, void 0, function* () {
            //The channel that the command came from
            let channel = yield this.getOrCreateChannel({ channel_id: user.channel.id });
            user = yield this.userService.getUser(user, 'context');
            //The channel that the user is currently active in
            let currentUserChannel = this.getUserChannel(user);
            if (currentUserChannel.channel_id !== channel.channel_id) {
                return 'switch-channels';
            }
            return yield channel.addDj(user);
        });
    }
    switchUserChannel(user, channel) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    syncUser(user, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield this.getChannel(message);
            return yield channel.syncUser(user);
        });
    }
    removeUser(user, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.removeDj(user);
            yield this.removeListener(user, message);
            user = yield this.userService.getUser(user, 'context');
            yield this.userService.updateUser(user, {
                playlist_id: null,
                access_token: null,
                refresh_token: null
            });
        });
    }
    removeListener(user, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield this.getChannel(message);
            user = yield this.userService.getUser(user, 'context');
            return channel.removeListener(user);
            ;
        });
    }
    removeDj(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = this.getUserChannel(user);
            user = yield this.userService.getUser(user, 'context');
            return channel.removeDj(user);
        });
    }
    addToUserPlaylist(user, trackData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.spotifyService.addToUserPlaylist(user, trackData);
        });
    }
    loginUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            //add channel
            let user = yield this.userService.loginUser(userData);
            if (!_.isNil(user.channel)) {
                yield this.getOrCreateChannel(user.channel, [user]);
            }
            return user;
        });
    }
    searchSongs(user, searchString) {
        return __awaiter(this, void 0, void 0, function* () {
            user = yield this.userService.getUser(user, 'context');
            try {
                let data = yield this.spotifyService.spotifyApi(user, 'searchTracks', searchString);
                return data.body;
            }
            catch (e) {
                console.error(e);
                console.error("Unable to search for songs. access_token = " + user['access_token']);
            }
        });
    }
}
exports.App = App;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsYXNzZXMvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7OztBQUVILG1EQUE4QztBQUM5Qyw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCwrREFBMEQ7QUFDMUQsc0NBQXNDO0FBQ3RDLCtEQUEwRDtBQUkxRCxNQUFhLEdBQUc7SUFZWjtRQVhBLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1FBQzNCLGFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBVzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxjQUFjLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxjQUFjLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGtCQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFSyxXQUFXOztZQUNiLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzFDLElBQUksVUFBVSxHQUFHLElBQUksNkJBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLFVBQVUsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxVQUFVOztZQUMxQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNyQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7SUFFRCxjQUFjLENBQUMsSUFBSTtRQUNmLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDeEQsT0FBTyxPQUFPLENBQUM7YUFDbEI7WUFDRCxPQUFPO1NBQ1Y7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUssVUFBVSxDQUFDLFdBQVc7O1lBQ3hCLElBQUksU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEUsSUFBSSxhQUFhLENBQUM7WUFDbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3JCLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUMsRUFBRTtvQkFDN0MsT0FBTyxPQUFPLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUE7Z0JBQ3JELENBQUMsQ0FBQyxDQUFDO2FBQ047WUFDRCxrSEFBa0g7WUFDbEgsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUN4QixhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUNyQztZQUNELE9BQU8sYUFBYSxDQUFDO1FBQ3pCLENBQUM7S0FBQTtJQUlLLGNBQWMsQ0FBQyxJQUFJOztZQUNyQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMvQixPQUFPLE9BQU8sQ0FBQzthQUNsQjtZQUNELE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzNCLDBEQUEwRDtZQUMxRCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkIsQ0FBQztLQUFBO0lBRUQsMEJBQTBCLENBQUMsT0FBTztRQUM5QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDeEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFSyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxHQUFHLEVBQUU7O1lBQy9DLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBSSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUU7Z0JBQzFCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3pELElBQUksVUFBVSxHQUFHLElBQUksNkJBQWEsQ0FBQztvQkFDM0IsVUFBVSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ3pCLFlBQVksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDO29CQUM3QixpQkFBaUIsRUFBRSxpQkFBaUI7aUJBQ3ZDLENBQ0osQ0FBQztnQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGNBQWM7Z0JBQzdELE9BQU8sVUFBVSxDQUFDO2FBQ3JCO2lCQUNJO2dCQUNELE9BQU8sZUFBZSxDQUFDO2FBQzFCO1FBQ0wsQ0FBQztLQUFBO0lBRUQsVUFBVSxDQUFDLFFBQVE7UUFDZixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUssS0FBSyxDQUFDLElBQUk7O1lBQ1osd0NBQXdDO1lBQ3hDLElBQUksT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQztZQUMxRSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdkQsa0RBQWtEO1lBQ2xELElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxJQUFJLGtCQUFrQixDQUFDLFVBQVUsS0FBSyxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUN0RCxPQUFPLGlCQUFpQixDQUFDO2FBQzVCO1lBQ0QsT0FBTyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRUssaUJBQWlCLENBQUMsSUFBSSxFQUFFLE9BQU87O1FBRXJDLENBQUM7S0FBQTtJQUVLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTzs7WUFDeEIsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLE9BQU8sTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLENBQUM7S0FBQTtJQUVLLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTzs7WUFDMUIsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekMsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO2dCQUNyQyxXQUFXLEVBQUUsSUFBSTtnQkFDakIsWUFBWSxFQUFDLElBQUk7Z0JBQ2pCLGFBQWEsRUFBQyxJQUFJO2FBQ3BCLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVLLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTzs7WUFDOUIsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN2RCxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQSxDQUFDO1FBQ3pDLENBQUM7S0FBQTtJQUVLLFFBQVEsQ0FBQyxJQUFJOztZQUNmLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO0tBQUE7SUFFSyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsU0FBUzs7WUFDbkMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUNoRSxDQUFDO0tBQUE7SUFFSyxTQUFTLENBQUMsUUFBUTs7WUFDcEIsYUFBYTtZQUNiLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN4QixNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUN2RDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVLLFdBQVcsQ0FBQyxJQUFJLEVBQUUsWUFBWTs7WUFDaEMsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZELElBQUk7Z0JBQ0EsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUNwRixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDcEI7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2FBQ3ZGO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUFoTEQsa0JBZ0xDIn0=