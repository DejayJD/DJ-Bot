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
const User_1 = require("./User");
class App {
    constructor() {
        this.channelLimit = 100;
        this.channels = [];
        this.users = [];
        this.playlistQueueName = 'DJ-Bot~Queue';
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
        channel.nextSong(this.users, this.spotifyApi);
    }
    createChannel(channel, initialUsers = []) {
        if (!this.channelExists(channel.id)) {
            let newChannel = new ChannelPlayer_1.ChannelPlayer(channel['id'], channel['name']);
            newChannel.users = [];
            newChannel.users.push(...initialUsers);
            this.channels.push(newChannel);
        }
        else {
            console.log("Channel already exists!");
        }
    }
    createSpotifyPlaylist(user) {
    }
    getDjBotPlaylist(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.setAccessToken(user);
                this.spotifyApi.setAccessToken(user['access_token']);
                let spotifyUser = yield this.spotifyApi.getMe();
                let userId = spotifyUser['id'];
                let userPlaylists = yield this.spotifyApi.getUserPlaylists(userId);
                let djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                    return playlist.name == this.playlistQueueName;
                });
                user.playlist_id = djBotPlaylist.id;
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        let user = _.find(this.users, { user_uuid: user_uuid });
        if (_.isNil(user)) {
            console.error("Unable to set credentials for user with token: " + user_uuid);
            return;
        }
        user['access_token'] = access_token;
        user['refresh_token'] = refresh_token;
        this.getDjBotPlaylist(user);
    }
    getUserByUserId(id) {
        return _.find(this.users, (user) => {
            return user.user.id === id;
        });
    }
    userIsLoggedIn(id) {
        return !_.isNil(_.find(this.users, (user) => {
            return user.user.id === id && !_.isNil(user['access_token']);
        }));
    }
    setSpotifyApi(spotifyApi) {
        this.spotifyApi = spotifyApi;
    }
    setAccessToken(user) {
        this.spotifyApi.setAccessToken(user['access_token']);
        this.spotifyApi.setRefreshToken(user['refresh_token']);
    }
    userExists(user) {
        //TODO: set this up
        return false;
    }
    createUser(user) {
        let newUser = new User_1.User(user);
        this.users.push(newUser);
        return newUser;
    }
    getTopSongOffPlaylist(playlistId) {
    }
    addToUserPlaylist(userId, trackData, context = 'slack') {
        return __awaiter(this, void 0, void 0, function* () {
            let user = _.find(this.users, (data) => {
                return data['context']['user']['id'] === userId && data['context']['type'] == context;
            });
            this.setAccessToken(user);
            let playlist_id = user['playlist_id'];
            try {
                yield this.spotifyApi.addTracksToPlaylist(playlist_id, [trackData['value']]);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    loginUser(user) {
        //add channel
        user['active'] = true;
        if (!_.isNil(user.channel)) {
            this.createChannel(user.channel, [user]);
        }
        if (!this.userExists(user)) {
            user = this.createUser(user);
        }
        else {
            console.log("user already exists, just inactive");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9jbGFzc2VzL0FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7QUFFSCxtREFBOEM7QUFDOUMsNEJBQTRCO0FBRTVCLGlDQUE0QjtBQUU1QixNQUFhLEdBQUc7SUFRWjtRQU5BLGlCQUFZLEdBQVcsR0FBRyxDQUFDO1FBQzNCLGFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBQy9CLFVBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsc0JBQWlCLEdBQUcsY0FBYyxDQUFDO0lBSW5DLENBQUM7SUFFRCxhQUFhLENBQUMsVUFBVTtRQUNwQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3JDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxjQUFjLENBQUMsSUFBSTtRQUNmLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1RSxPQUFPO1NBQ1Y7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsY0FBYyxDQUFDLElBQUk7UUFDZixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFB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