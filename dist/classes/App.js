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
        return __awaiter(this, void 0, void 0, function* () {
            let channel = _.find(this.channels, { channel_id: user['channel']['id'] });
            if (_.isNil(channel)) {
                if (!_.isNil(user['channel'])) {
                    channel = this.getOrCreateChannel(user.channel, [user]);
                }
            }
            return channel;
        });
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
            // If the channel isnt found inside the app, thats because the server crashed or something and the channel is gone,
            // Recreate it here
            if (_.isNil(playerChannel)) {
                playerChannel = new ChannelPlayer_1.ChannelPlayer(dbChannel);
                this.channels.push(playerChannel);
            }
            return playerChannel;
        });
    }
    getOrCreateChannel(channel, initialUsers = []) {
        return __awaiter(this, void 0, void 0, function* () {
            channel['channel_id'] = channel['id'];
            let existingChannel = yield this.channelService.getChannel(channel);
            if (_.isNil(existingChannel)) {
                let newChannel = new ChannelPlayer_1.ChannelPlayer({
                    channel_id: channel['id'],
                    channel_name: channel['name'],
                    channel_listeners: _.map(initialUsers, 'user_uuid')
                });
                this.channels.push(newChannel);
                this.subscribeToChannelMessages(newChannel);
                this.channelService.createChannel(newChannel); // write to db
                return newChannel;
            }
            else {
                let newChannel = new ChannelPlayer_1.ChannelPlayer(existingChannel);
                this.channels.push(newChannel);
                return newChannel;
            }
        });
    }
    skipToNextSong(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user = this.userService.getUserByContext(user);
            let channel = yield this.getOrCreateChannel(user);
            if (channel.dj_queue.length === 0) {
                return "no-dj";
            }
            channel.clearCurrentSong();
            // user = await this.userService.getUserByContext(user);
            channel.nextSong();
        });
    }
    subscribeToChannelMessages(channel) {
        channel.outgoingMessages.subscribe((data) => {
            this.outgoingMessageEmitter.next(data);
        });
    }
    createUser(userData) {
        this.userService.createUser(userData);
    }
    addDj(user) {
        return __awaiter(this, void 0, void 0, function* () {
            //The channel that the command came from
            let channel = yield this.getOrCreateChannel({ channel_id: user.channel.id });
            user = yield this.userService.getUserByContext(user);
            //The channel that the user is currently active in
            let currentUserChannel = yield this.getUserChannel(user);
            if (!_.isNil(channel) && !_.isNil(currentUserChannel)) {
                if (currentUserChannel.channel_id !== channel.channel_id && !_.isNil(currentUserChannel.channel_id) && !_.isNil(channel.channel_id)) {
                    return 'switch-channels';
                }
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
            user = yield this.userService.getUserByContext(user);
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
            user = yield this.userService.getUserByContext(user);
            return channel.removeListener(user);
        });
    }
    removeDj(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user = this.userService.getUserByContext(user);
            let channel = yield this.getUserChannel(user);
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
            user = yield this.userService.getUserByContext(user);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsYXNzZXMvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7OztBQUVILG1EQUE4QztBQUM5Qyw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCwrREFBMEQ7QUFDMUQsc0NBQXNDO0FBQ3RDLCtEQUEwRDtBQUkxRCxNQUFhLEdBQUc7SUFZWjtRQVhBLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1FBQzNCLGFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBVzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxjQUFjLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxjQUFjLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGtCQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFSyxXQUFXOztZQUNiLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JB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