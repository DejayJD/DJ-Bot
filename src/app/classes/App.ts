/*
 *  Created By JD.Francis on 9/26/18
 */

import {ChannelPlayer} from "./ChannelPlayer";
import * as _ from "lodash";
import {randToken} from 'rand-token';

export class App {

    channelLimit:number;
    channels : ChannelPlayer[] = [];
    users : ChannelPlayer[] = [];
    spotifyApi:any;
    constructor(channelLimit = 100) {
        this.channelLimit = channelLimit;
        this.channels = [];
        this.users = [];
    }

    channelExists(channelId) {
        return _.find(this.channels, (channel) => {
            return channel['id'] == channelId;
        })
    }

    createChannel(channel, initialUsers = []) {
        if (!this.channelExists(channel.id)) {
            let newChannel = new ChannelPlayer(channel['id'], channel['name']);
            newChannel.users.push(...initialUsers)
            newChannel.users = [];
            this.channels.push(newChannel);
        }
        else {
            console.log("Channel already exists!");
        }
    }

    setUserSpotifyCredentials(user_token, access_token, refresh_token) {
        let user = _.find(this.users, {user_token:user_token});
        if (_.isNil(user)) {
            console.error("Unable to set credentials for user with token: " + user_token);
            return;
        }
        user['access_token'] = access_token;
        user['refresh_token'] = refresh_token;
    }

    getUserByUserId(id) {
        return _.find(this.users, (user)=>{
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

    async syncUser(user_token) {
        let user = _.find(this.users, {user_token:user_token});
        this.spotifyApi.setAccessToken(user['access_token']);
        this.spotifyApi.setRefreshToken(user['refresh_token']);
        let userChannel = _.find(this.channels, {channelId:user['channel']['id']});
        if (_.isNil(userChannel)) {
            console.error(`Unable to find user channel!\nuser:${JSON.stringify(user)}`);
            return;
        }
        let currentSong = userChannel['currentSong'];
        let playbackDifference = Math.abs(new Date() - currentSong.startTime);
        await this.spotifyApi.play({uris: [currentSong.uri], 'position_ms': playbackDifference});
    }

    loginUser(user) {
        //add channel
        if (!_.isNil(user.channel)) {
            this.createChannel(user.channel, [user]);
        }
        user['user_token'] = randToken.generate(16);
        user['device_id'] = null;
        user['active'] = true;
        user['user_access_token'] = null;
        user['user_refresh_token'] = null;
        this.users.push(user);
        return user;
    }
}