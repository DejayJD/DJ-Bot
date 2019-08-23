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
            if (!_.isNil(channel['channel_id'] && !_.isNil(channel['channel_name']))) {
                let newChannel = new ChannelPlayer(channel);
                this.subscribeToChannelMessages(newChannel);
                return newChannel;
            }
        });
        this.channels = _.compact(this.channels);
    }

    async channelExists(channel_id) {
        return _.find(this.channels, (channel) => {
            return channel['id'] == channel_id;
        });
    }

    async getUserChannel(user): Promise<ChannelPlayer> {
        return _.find(this.channels, (channel) => {
            return channel.channel_listeners.includes(user['user_uuid'])
                || !_.isNil(_.find(channel.dj_queue, (dj)=> {
                    return dj.user_uuid == user.user_uuid;
                }));
        });
    }

    async getChannel(channelData): Promise<ChannelPlayer> {
        let dbChannel = await this.channelService.getChannel(channelData);

        let playerChannel;
        if (!_.isNil(dbChannel)) {
            playerChannel = _.find(this.channels, (channel) => {
                return channel.channel_id == dbChannel.channel_id
            });
        }
        // If the channel isnt found inside the app, thats because the server crashed or something and the channel is gone,
        // Recreate it here
        if (_.isNil(playerChannel)) {
            if (_.isNil(dbChannel)) { //Couldnt find it in the DB either, so just make a new one
                return await this.getOrCreateChannel(channelData);
            }
            else {
                playerChannel = new ChannelPlayer(dbChannel);
                this.channels.push(playerChannel);
            }
        }
        return playerChannel;
    }

    //TODO: Refactor and merge these functions
    async getOrCreateChannel(channel, initialUsers = []): Promise<ChannelPlayer> {
        if (_.isNil(channel['channel_id'])) {
            channel['channel_id'] = channel['id'];
        }
        if (_.isNil(channel['channel_name'])) {
            channel['channel_name'] = channel['name'];
        }
        let existingChannel = await this.channelService.getChannel(channel);
        if (_.isNil(existingChannel)) {
            let newChannel = new ChannelPlayer({
                    channel_id: channel['channel_id'],
                    channel_name: channel['channel_name'],
                    channel_listeners: _.map(initialUsers, 'user_uuid')
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


    async skipToNextSong(user) {
        //TODO: Only allow skips when its current user or vote-skip
        let channel = await this.getChannel({
            channel_id: user.channel.id,
            channel_name: user.channel.name
        });
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

    createUser(userData) {
        this.userService.createUser(userData);
    }

    async addDj(user) {
        //The channel that the command came from
        let channel = await this.getChannel({
            channel_id: user.channel.id,
            channel_name: user.channel.name
        });
        user = await this.userService.getUserByContext(user);
        return await channel.addDj(user);
    }

    async getUserQueue(user) {
        user = await this.userService.getUserByContext(user);
        let tracks = [];
        try {
            tracks = await this.spotifyService.spotifyApi(user, 'getPlaylistTracks', user.playlist_id);
        }
        catch (e) {
            console.error(e);
            return {message:'error'};
        }
        return {message:'song-list', data: tracks};
    }

    async getUserChannelConflict(user) {
        let channel = await this.getChannel({
            channel_id: user.channel.id,
            channel_name: user.channel.name
        });
        user = await this.userService.getUserByContext(user);
        let currentUserChannel = await this.getUserChannel(user);
        if (!_.isNil(channel) && !_.isNil(currentUserChannel)) {
            return currentUserChannel.channel_id !== channel.channel_id
                    && !_.isNil(currentUserChannel.channel_id)
                    && !_.isNil(channel.channel_id);
        }
        return false;
    }

    async switchUserChannel(user, channelData) {
        user = await this.userService.getUserByContext(user);
        let previousChannel = await this.getUserChannel(user);
        previousChannel.removeListener(user);
        return await previousChannel.removeDj(user);
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
            access_token: null,
            refresh_token: null
        });
    }

    async removeListener(user, message) {
        let channel = await this.getChannel(message);
        user = await this.userService.getUserByContext(user);
        return channel.removeListener(user);
    }

    async removeDj(user) {
        user = await this.userService.getUserByContext(user);
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