/*
 *  Created By JD.Francis on 9/26/18
 */

import {ChannelPlayer} from "./ChannelPlayer";
import * as _ from "lodash";
import {User} from "../models/User";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";
import {SpotifyService} from "../services/SpotifyService";

export class App {

    channelLimit: number = 100;
    channels: ChannelPlayer[] = [];
    spotifyApi: any;
    userService: UserService;
    spotifyService: SpotifyService;
    bot: any;

    constructor() {
        this.userService = Service.getService(UserService);
        this.spotifyService = Service.getService(SpotifyService);
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
            console.error(`Unable to find user channel with id ${user['channel']['id']}`);
            if (!_.isNil(user['channel'])) {
                console.error("Creating channel now...");
                channel = this.createChannel(user.channel, [user]);
                return channel;
            }
            return;
        }
        return channel;
    }

    async skipToNextSong(user) {
        let channel = this.getUserChannel(user);
        if(channel.djQueue.length === 0) {
            return "There are currently no users in the DJ Queue. Type /dj to become a DJ!";
        }
        channel.clearCurrentSong();
        user = await this.userService.getUser(user, 'context');
        channel.nextSong([user]);
    }

    createChannel(channel, initialUsers: User[] = []) {
        if (!this.channelExists(channel.id)) {
            let newChannel = new ChannelPlayer(channel['id'], channel['name'], this.bot);
            // newChannel.djQueue = [];
            // newChannel.djQueue.push(..._.map(initialUsers, 'user_uuid'));
            this.channels.push(newChannel);
            return newChannel;
        }
        else {
        }
    }

    createUser(userData) {
        this.userService.createUser(userData);
    }

    async addDj(user) {
        let channel = this.getUserChannel(user);
        user = this.userService.getUser(user, 'context');
        channel.addDj(user);
    }

    async addToUserPlaylist(userId, trackData, context = 'slack') {
        await this.spotifyService.addToUserPlaylist(userId, trackData, context)
    }

    async loginUser(userData) {
        //add channel
        let user = await this.userService.loginUser(userData);
        if (!_.isNil(user.channel)) {
            this.createChannel(user.channel, [user]);
        }
        return user;
    }

    async searchSongs(user, searchString) {
        user = await this.userService.getUser(user, 'context');
        try {
            let data = await this.spotifyService.callSpotifyApi(user, 'searchTracks', searchString);
            // let data = await this.spotifyApi.searchTracks(searchString);
            return data.body;
        }
        catch (e) {
            console.error(e);
            console.error("Unable to search for songs. access_token = " + user['access_token']);
        }
    }
}