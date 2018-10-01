import {User} from "../classes/User";
import * as _ from "lodash";
import {Service} from "./ServiceManager";
import {SpotifyService} from "./SpotifyService";

export class UserService {
    maxUsers;
    users: User[];
    spotifyApi: any;
    spotifyService: SpotifyService;
    playlistQueueName = 'DJ-Bot~Queue';

    constructor() {
        this.users = [];
        this.spotifyService = Service.getService(SpotifyService);
        this.spotifyApi = this.spotifyService.spotifyApi;
    }

    createUser(user) {
        let newUser = new User(user);
        this.users.push(newUser);
        return newUser;
    }

    userExists(user): boolean {
        //TODO: set this up
        return false;
    }

    async setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        let user = _.find(this.users, {user_uuid: user_uuid});
        if (_.isNil(user)) {
            console.error("Unable to set credentials for user with token: " + user_uuid);
            return;
        }
        user['access_token'] = access_token;
        user['refresh_token'] = refresh_token;
        await this.getUserPlaylistId(user);
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

    getUser(userData, identifier = 'user_uuid') {
        return _.find(this.users, (user) => {
            return user[identifier] === userData[identifier];
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

    loginUser(user) {
        user['active'] = true;
        if (!this.userExists(user)) {
            user = this.createUser(user);
        }
        else {
            console.log("user already exists, just inactive");
        }
        return user;
    }

    createSpotifyPlaylist(user) {
        //TODO:
    }

}