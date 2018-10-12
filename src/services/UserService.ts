import * as _ from "lodash";
import {Service} from "./ServiceManager";
import {SpotifyService} from "./SpotifyService";
import {User} from "../models/DatabaseConnection";
import * as uuid from 'uuid/v1';

export class UserService {
    users = [];
    spotifyService: SpotifyService;
    playlistQueueName = 'DJ-Bot~Queue';

    constructor() {
        this.spotifyService = Service.getService(SpotifyService, this);
        this.getUsers();
    }

    async getUsers() {
        this.users = await User.find();
    }

    getUserNameByContext(user) {
        if (user.context.type == 'slack') {
            return user.context.user.name;
        }
    }

    async createUser(userData) {
        let newUser = {
            user_uuid: uuid(),
            channel: userData['channel'],
            context: userData['context'],
            username: this.getUserNameByContext(userData)
        };
        let dbUser = new User(newUser); //adds the user to the DB
        try {
            await dbUser.save();
        }
        catch (e) {
            console.error(e);
            console.error("Unable to save user to db");
        }
        this.users.push(newUser);
        return newUser;
    }

    async getUser(userData, identifier = 'user_uuid') {
        let userQuery = {};
        userQuery[identifier] = _.get(userData, identifier);
        let dbUser = await User.find(userQuery);
        if (!_.isNil(dbUser)) {
            if (dbUser.length > 0) {
                return dbUser[0];
            }
        }
    }

    async setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        let user = await this.getUser({user_uuid: user_uuid});
        if (_.isNil(user)) {
            console.error("Unable to set credentials for user with token: " + user_uuid);
            return;
        }
        let newValues = {
            access_token: access_token,
            refresh_token: refresh_token,
        };
        user = _.merge(user, newValues);
        newValues['playlist_id'] = await this.getUserPlaylistId(user);
        try {
            await this.updateUser(user, newValues);
        }
        catch (e) {
            console.error("unable to save user");
            console.error(e);
        }
    }

    async updateUser(user, newValues) {
        User.updateOne({_id: user['_id']},
            {
                $set: newValues
            }).exec().then().catch();
    }

    async getUserPlaylistId(user) {
        try {
            //first get spotify user id.
            //Might be able to get rid of this?
            let spotifyUser = await this.spotifyService.spotifyApi(user, /*you just...*/'getMe');
            let userId = spotifyUser.body['id'];
            //Fetch user playlists. Start with the first 30
            let playlistOptions = {
                limit: 20,
                offset: 0
            };
            let userPlaylists;
            try {
                userPlaylists = await this.spotifyService.spotifyApi(user, 'getUserPlaylists', userId, playlistOptions);
            }
            catch (e) {
                console.error(e);
            }
            let djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                return playlist.name == this.playlistQueueName;
            });
            //Keep going through user playlists until all of them have been checked.
            //Only occurs if user has >30 playlists and searches in increments of 30
            while (userPlaylists.body.items.length == playlistOptions.limit && _.isNil(djBotPlaylist)) {
                playlistOptions.offset += playlistOptions.limit;
                userPlaylists = await this.spotifyService.spotifyApi(user, 'getUserPlaylists', userId, playlistOptions);
                djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                    return playlist.name == this.playlistQueueName;
                });
            }
            //If playlist is still null after all the searching, then need to create it
            if (_.isNil(djBotPlaylist)) {
                djBotPlaylist = (await this.createSpotifyPlaylist(user, userId)).body;
            }

            return djBotPlaylist.id
        }
        catch (e) {
            console.error("Unable to find a DJ-Bot~Queue playlist");
            console.error(e);
        }
    }

    getSlackUser(userData) {
        return _.find(this.users, (user) => {
            return user.context.user.id === userData.context.user.id;
        });
    }

    async userIsLoggedIn(userData) {
        let existingUser = await this.getUser(userData, 'context');
        if (!_.isNil(existingUser)) {
            if (_.isNil(existingUser['playlist_id']) || _.isNil(existingUser['access_token']) || _.isNil(existingUser['refresh_token'])) {
                return false;
            }
            return true;
        }
        return false;
    }

    async loginUser(user) {
        let existingUser = await this.getUser(user, 'context');
        if (_.isNil(existingUser)) {
            user = await this.createUser(user);
        }
        else {
            user = existingUser;
        }
        user['listening'] = true;
        return user;
    }

    async createSpotifyPlaylist(user, userId) {
        let newPlaylistOpts = {
            description: 'This is where you can put your songs to play with DJ-Bot! Just drag them in here and get to DJing!'
        };
        return await this.spotifyService.spotifyApi(user, 'createPlaylist', userId, this.playlistQueueName, newPlaylistOpts);
    }

}