import {User} from "../models/User";
import * as _ from "lodash";
import {Service} from "./ServiceManager";
import {SpotifyService} from "./SpotifyService";
import {db, user} from "./DatabaseConnection";

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
        this.users = await user.find();
        console.log(this.users);
    }

    async createUser(userData) {
        let newUser = new User(userData);
        let dbUser = new user(newUser); //adds the user to the DB
        try {
            await dbUser.save();
            console.log("created new user in db");
        }
        catch(e) {
            console.error(e);
            console.error("Unable to save user to db");
        }
        this.users.push(newUser);
        return newUser;
    }

    async getUser(userData, identifier = 'user_uuid') {
        let dbUser = await user.find({identifier:userData[identifier]});
        if (!_.isNil(dbUser)) {
            if (dbUser.length > 0) {
                console.log("Found existing user!");
                console.log(dbUser);
                //TODO: refresh spotify token
                return dbUser;
            }
        }
    }

    async setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        let user = this.getUser({user_uuid: user_uuid});
        if (_.isNil(user)) {
            console.error("Unable to set credentials for user with token: " + user_uuid);
            return;
        }
        user['access_token'] = access_token;
        user['refresh_token'] = refresh_token;
        user = await this.getUserPlaylistId(user);

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
            user.playlist_id = djBotPlaylist.id;
            return user;
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

    userIsLoggedIn(userData, context = 'slack') {
        if (context == 'slack') {
            //Find user by slack id and check their access token
            return !_.isNil(_.find(this.users, (user) => {
                return user.context.user.id === userData.context.user.id && !_.isNil(user['access_token']);
            }));
        }
    }

    async loginUser(user) {
        let existingUser = await this.getUser(user);
        if (_.isNil(existingUser)) {
            user = await this.createUser(user);
        }
        else {
            user = existingUser;
        }
        user['active'] = true;
        console.log(user);
        return user;
    }

    createSpotifyPlaylist(user) {
        //TODO:
    }

}