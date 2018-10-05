import {User} from "../models/User";
import * as _ from "lodash";
import {Service} from "./ServiceManager";
import {SpotifyService} from "./SpotifyService";
import {DbUser} from "./DatabaseConnection";

export class UserService {
    maxUsers;
    users = [];
    spotifyApi: any;
    spotifyService: SpotifyService;
    playlistQueueName = 'DJ-Bot~Queue';

    constructor() {
        this.spotifyService = Service.getService(SpotifyService, this);
        this.getUsers();
        this.spotifyApi = this.spotifyService.spotifyApi;
    }

    async getUsers() {
        this.users = await DbUser.find();
    }

    async createUser(userData) {
        let newUser = new User(userData);
        let dbUser = new DbUser(newUser); //adds the user to the DB
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
        let dbUser = await DbUser.find(userQuery);
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
        let playlist_id = await this.getUserPlaylistId(user);
        try {
            await this.updateUser(user, {
                access_token: access_token,
                refresh_token: refresh_token,
                playlist_id: playlist_id
            });
        }
        catch (e) {
            console.error("unable to save user");
            console.error(e);
        }
    }

    async updateUser(user, newValues) {
        DbUser.updateOne({_id: user['_id']},
            {
                $set: newValues
            }).exec().then().catch();
    }

    async getUserPlaylistId(user) {
        try {
            this.spotifyApi.setAccessToken(user['access_token']);
            let spotifyUser = await this.spotifyApi.getMe();
            let userId = spotifyUser['id'];
            let userPlaylists = await this.spotifyApi.getUserPlaylists(userId);
            let djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                return playlist.name == this.playlistQueueName;
            });
            if (_.isNil(djBotPlaylist)) {
                //TODO: Create a playlist when an existing one is not found
                this.createSpotifyPlaylist(user);
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
        return !_.isNil(existingUser);
    }

    async loginUser(user) {
        let existingUser = await this.getUser(user, 'context');
        if (_.isNil(existingUser)) {
            user = await this.createUser(user);
        }
        else {
            user = existingUser;
        }
        user['active'] = true;
        return user;
    }

    createSpotifyPlaylist(user) {
        //TODO:
    }

}