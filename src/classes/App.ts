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
import {db} from "../models/DatabaseConnection";


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

    async getUserChannel(user) : Promise<ChannelPlayer> {
        let channel = this.channelService.getUserCurrentActiveChannel(user);
        if (_.isNil(channel)) {
            if (!_.isNil(user['channel'])) {
                channel = this.getOrCreateChannel(user.channel, [user]);
                return channel;
            }
            return;
        }
        return channel;
    }

    async getChannel(channelData) : Promise<ChannelPlayer> {
        let dbChannel = await this.channelService.getChannel(channelData);
        let playerChannel;
        if (!_.isNil(dbChannel)) {
            playerChannel = _.find(this.channels, (channel)=>{
                return channel.channel_id == dbChannel.channel_id
            });
        }
        // If the channel isnt found inside the app, thats because the server crashed or something and the channel is gone,
        // Recreate it here
        if (_.isNil(playerChannel)) {
            playerChannel = new ChannelPlayer(dbChannel);
            this.channels.push(playerChannel);
        }
        return playerChannel;
    }



    async skipToNextSong(user) {
        user = this.userService.getUserByContext(user);
        let channel = await this.getOrCreateChannel(user);
        if (channel.dj_queue.length === 0) {
            return "no-dj";
        }
        channel.clearCurrentSong();
        // user = await this.userService.getUserByContext(user);
        channel.nextSong();
    }

    subscribeToChannelMessages(channel) {
        channel.outgoingMessages.subscribe((data) => {
            this.outgoingMessageEmitter.next(data);
        });
    }

    async getOrCreateChannel(channel, initialUsers = []) : Promise<ChannelPlayer> {
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
            let newChannel = new ChannelPlayer(existingChannel);
            this.channels.push(newChannel);
            return newChannel;
        }
    }

    createUser(userData) {
        this.userService.createUser(userData);
    }

    async addDj(user) {
        //The channel that the command came from
        let channel = await this.getOrCreateChannel({channel_id:user.channel.id});
        user = await this.userService.getUserByContext(user);
        //The channel that the user is currently active in
        let currentUserChannel = await this.getUserChannel(user);
        if (!_.isNil(channel) && !_.isNil(currentUserChannel)) {
            if (currentUserChannel.channel_id !== channel.channel_id && !_.isNil(currentUserChannel.channel_id) && !_.isNil(channel.channel_id)){
                return 'switch-channels';
            }
        }
        return await channel.addDj(user);
    }

    async switchUserChannel(user, channel) {

    }

    async syncUser(user, message) {
        let channel = await this.getChannel(message);
        return await channel.syncUser(user);
    }

    async removeUser(user, message) {
        await this.removeDj(user);
        await this.removeListener(user, message);
        user = await this.userService.getUserByContext(user);
        await this.userService.updateUser(user, {
           playlist_id: null,
           access_token:null,
           refresh_token:null
        });
    }

    async removeListener(user, message) {
        let channel = await this.getChannel(message);
        user = await this.userService.getUserByContext(user);
        return channel.removeListener(user);
    }

    async removeDj(user) {
        user = this.userService.getUserByContext(user);
        let channel = await this.getUserChannel(user);
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
        user = await this.userService.getUserByContext(user);
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