import * as _ from "lodash";
import {Service} from "./ServiceManager";
import {SpotifyService} from "./SpotifyService";
import {DbUser} from "./DatabaseConnection";
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
        this.users = await DbUser.find();
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
            let spotifyUser = await this.spotifyService.spotifyApi(user, 'getMe');
            let userId = spotifyUser['id'];

            let userPlaylists = await this.spotifyService.spotifyApi(user, 'getUserPlaylists', userId);
            // let userPlaylists = await this.spotifyApiObj.getUserPlaylists(userId);
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
        user['listening'] = true;
        return user;
    }

    createSpotifyPlaylist(user) {
        //TODO: create playlist for a new user
    }

}