/*
 *  Created By JD.Francis on 9/26/18
 */

import {ChannelPlayer} from "./ChannelPlayer";
import * as _ from "lodash";
import {randToken} from 'rand-token';
import {uuid} from 'uuid';
import {User} from "./User";

export class App {

    channelLimit: number = 100;
    channels: ChannelPlayer[] = [];
    users: User[] = [];
    spotifyApi: any;

    constructor() {
    }

    channelExists(channel_id) {
        return _.find(this.channels, (channel) => {
            return channel['id'] == channel_id;
        });
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

    setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        let user = _.find(this.users, {user_uuid: user_uuid});
        if (_.isNil(user)) {
            console.error("Unable to set credentials for user with token: " + user_uuid);
            return;
        }
        user['access_token'] = access_token;
        user['refresh_token'] = refresh_token;
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

    async syncUser(user_uuid) {
        let user = _.find(this.users, {user_uuid: user_uuid});
        this.spotifyApi.setAccessToken(user['access_token']);
        this.spotifyApi.setRefreshToken(user['refresh_token']);
        let userChannel = _.find(this.channels, {channel_id: user['channel']['id']});
        if (_.isNil(userChannel)) {
            console.error(`Unable to find user channel!\nuser:${JSON.stringify(user)}`);
            return;
        }
        let currentSong = userChannel['currentSong'];
        let currentTimestamp: any = new Date(); // Had to cast it to any to make typescript stop complaining.
        let playbackDifference = Math.abs(currentTimestamp - currentSong.startTime);
        await this.spotifyApi.play({uris: [currentSong.uri], 'position_ms': playbackDifference});
    }

    userExists(user): boolean {
        //TODO: set this up
        return false;
    }

    createUser(user) {
        let newUser = new User(user);
        this.users.push(user);
        return user;
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
}