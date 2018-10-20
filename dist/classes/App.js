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
            let playerChannel = _.find(this.channels, (channel) => {
                return channel.channel_id == dbChannel.channel_id;
            });
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
            user = yield this.userService.getUser(user, 'context');
            let currentChannel = this.getUserChannel(user);
            let channel = yield this.getChannel(user.context.channel);
            return yield channel.addDj(user);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsYXNzZXMvQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7OztBQUVILG1EQUE4QztBQUM5Qyw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCwrREFBMEQ7QUFDMUQsc0NBQXNDO0FBQ3RDLCtEQUEwRDtBQUkxRCxNQUFhLEdBQUc7SUFZWjtRQVhBLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1FBQzNCLGFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBVzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxjQUFjLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxjQUFjLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGtCQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFSyxXQUFXOztZQUNiLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JB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