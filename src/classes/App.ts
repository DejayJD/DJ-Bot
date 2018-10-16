/*
 *  Created By JD.Francis on 9/26/18
 */

import {ChannelPlayer} from "./ChannelPlayer";
import * as _ from "lodash";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";
import {SpotifyService} from "../services/SpotifyService";
import {Observable} from "rxjs/index";
import {ChannelService} from "../services/ChannelService";


export class App {

    channelLimit: number = 100;
    channels: ChannelPlayer[] = [];
    spotifyApi: any;
    userService: UserService;
    spotifyService: SpotifyService;
    channelService: ChannelService;
    outgoingMessages: Observable<any>;
    outgoingMessageEmitter;

    users: string[]; //Keeps a list of user uuids

    constructor() {
        this.userService = Service.getService(UserService);
        this.spotifyService = Service.getService(SpotifyService);
        this.channelService = Service.getService(ChannelService);
        this.spotifyApi = this.spotifyService.spotifyApi;
        this.outgoingMessages = Observable.create(e => this.outgoingMessageEmitter = e);
        this.outgoingMessages.subscribe(this.outgoingMessageEmitter);
        this.getChannels();
    }

    async getChannels() {
        let dbChannels = await this.channelService.getChannels();
        this.channels = _.map(dbChannels, (channel) => {
            let newChannel = new ChannelPlayer(channel);
            this.subscribeToChannelMessages(newChannel);
            return newChannel;
        });
    }

    async channelExists(channel_id) {
        return _.find(this.channels, (channel) => {
            return channel['id'] == channel_id;
        });
    }

    getUserChannel(user) {
        let channel = _.find(this.channels, {channel_id: user['channel']['id']});
        if (_.isNil(channel)) {
            if (!_.isNil(user['channel'])) {
                channel = this.getOrCreateChannel(user.channel, [user]);
                return channel;
            }
            return;
        }
        return channel;
    }


    async skipToNextSong(user) {
        let channel = this.getUserChannel(user);
        if (channel.dj_queue.length === 0) {
            return "no-dj";
        }
        channel.clearCurrentSong();
        // user = await this.userService.getUser(user, 'context');
        channel.nextSong();
    }

    subscribeToChannelMessages(channel) {
        channel.outgoingMessages.subscribe((data) => {
            this.outgoingMessageEmitter.next(data);
        });
    }

    async getOrCreateChannel(channel, initialUsers = []) {
        channel['channel_id'] = channel['id'];
        let existingChannel = await this.channelService.getChannel(channel);
        if (_.isNil(existingChannel)) {
            let channel_listeners = _.map(initialUsers, 'user_uuid');
            let newChannel = new ChannelPlayer({
                    channel_id: channel['id'],
                    channel_name: channel['name'],
                    channel_listeners: channel_listeners
                }
            );
            this.channels.push(newChannel);
            this.subscribeToChannelMessages(newChannel);
            this.channelService.createChannel(newChannel); // write to db
            return newChannel;
        }
        else {
            return existingChannel;
        }
    }

    createUser(userData) {
        this.userService.createUser(userData);
    }

    async addDj(user) {
        user = await this.userService.getUser(user, 'context');
        let channel = this.getUserChannel(user);
        return channel.addDj(user);
    }

    async removeDj(user) {
        let channel = this.getUserChannel(user);
        user = await this.userService.getUser(user, 'context');
        return channel.removeDj(user);
    }

    async addToUserPlaylist(user, trackData) {
        await this.spotifyService.addToUserPlaylist(user, trackData)
    }

    async loginUser(userData) {
        //add channel
        let user = await this.userService.loginUser(userData);
        if (!_.isNil(user.channel)) {
            await this.getOrCreateChannel(user.channel, [user]);
        }
        return user;
    }

    async searchSongs(user, searchString) {
        user = await this.userService.getUser(user, 'context');
        try {
            let data = await this.spotifyService.spotifyApi(user, 'searchTracks', searchString);
            return data.body;
        }
        catch (e) {
            console.error(e);
            console.error("Unable to search for songs. access_token = " + user['access_token']);
        }
    }
}