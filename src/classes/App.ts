/*
 *  Created By JD.Francis on 9/26/18
 */

import {ChannelPlayer} from "./ChannelPlayer";
import * as _ from "lodash";
import {User} from "./User";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";
import {SpotifyService} from "../services/SpotifyService";

export class App {

    channelLimit: number = 100;
    channels: ChannelPlayer[] = [];
    spotifyApi: any;
    userService: UserService;
    spotifyService: SpotifyService;

    constructor() {
        this.userService = Service.getService(UserService);
        this.spotifyService = Service.getService(SpotifyService, this.userService);
        this.spotifyApi = this.spotifyService.spotifyApi;
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
        channel.nextSong([user]);
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

    createUser(userData) {
        this.userService.createUser(userData);
    }

    async addToUserPlaylist(userId, trackData, context = 'slack') {
        await this.spotifyService.addToUserPlaylist(userId, trackData, context)
    }

    loginUser(userData) {
        //add channel
        let user = this.userService.loginUser(userData);
        if (!_.isNil(user.channel)) {
            this.createChannel(user.channel, [user]);
        }
        return user;
    }

    async searchSongs(searchString) {
        let data = await this.spotifyApi.searchTracks(searchString);
        return data.body;
    }
}