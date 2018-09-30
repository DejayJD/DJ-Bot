/*
 *  Created By JD.Francis on 9/26/18
 */

import {ChannelPlayer} from "./ChannelPlayer";
import * as _ from "lodash";
import {User} from "./User";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";
import {SpotifyService} from "../../spotify/services/SpotifyService";

export class App {

    channelLimit: number = 100;
    channels: ChannelPlayer[] = [];
    users: User[] = [];
    playlistQueueName = 'DJ-Bot~Queue';
    spotifyApi: any;
    userService : UserService;

    constructor() {
        this.spotifyApi = Service.getService(SpotifyService).spotifyApi;
        this.userService = Service.getService(UserService);
    }

    channelExists(channel_id) {
        return _.find(this.channels, (channel) => {
            return channel['id'] == channel_id;
        });
    }

    getUserChannel(user) {
        let channel = _.find(this.channels, {channel_id: user['channel']['id']});
        if (_.isNil(channel)) {
            console.error(`Unable to find user channel!\nuser:${JSON.stringify(user)}`);
            return;
        }
        return channel;
    }

    skipToNextSong(user) {
        let channel = this.getUserChannel(user);
        channel.nextSong(this.users);
    }

    createChannel(channel, initialUsers: User[] = []) {
        if (!this.channelExists(channel.id)) {
            let newChannel = new ChannelPlayer(channel['id'], channel['name']);
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

    async getDjBotPlaylist(user) {
        try {
            this.setAccessToken(user);
            this.spotifyApi.setAccessToken(user['access_token']);
            let spotifyUser = await this.spotifyApi.getMe();
            let userId = spotifyUser['id'];
            let userPlaylists = await this.spotifyApi.getUserPlaylists(userId);
            let djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                return playlist.name == this.playlistQueueName;
            });
            user.playlist_id = djBotPlaylist.id;
        }
        catch (e) {
            console.error(e);
        }
    }

    setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        let user = _.find(this.users, {user_uuid: user_uuid});
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

    userExists(user): boolean {
        //TODO: set this up
        return false;
    }

    createUser(user) {
        let newUser = new User(user);
        this.users.push(newUser);
        return newUser;
    }

    getTopSongOffPlaylist(playlistId) {

    }

    async addToUserPlaylist(userId, trackData, context = 'slack') {
        let user = _.find(this.users, (data) => {
            return data['context']['user']['id'] === userId && data['context']['type'] == context;
        });
        this.setAccessToken(user);
        let playlist_id = user['playlist_id'];
        try {
            await this.spotifyApi.addTracksToPlaylist(playlist_id, [trackData['value']]);
        }
        catch (e) {
            console.error(e);
        }
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

    async searchSongs(searchString) {
        let data = await this.spotifyApi.searchTracks(searchString);
        return data.body;
    }
}