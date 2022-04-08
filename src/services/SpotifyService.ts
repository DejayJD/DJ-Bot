import * as SpotifyWebApi from '../../spotify-web-api-node';
import * as _ from "lodash";
import {UserService} from "./UserService";
import {User} from "../models/DatabaseConnection";

export class SpotifyService {
    spotifyApiObj: any;
    userService: any;

    constructor(userService: UserService) {
        this.userService = userService;
        this.spotifyApiObj = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT
        });
    }

    async spotifyApi(user, method, ...params) {
        this.spotifyApiObj.setAccessToken(user['access_token']);
        try {
            let data = await this.spotifyApiObj[method](...params);
            return data;
        }
        catch (e) {
            // If the error is caused by a 401, its probably cause token expired.
            // This tries refreshing and then attempting again
            // If that also fails it errors out completely
            if (e.statusCode === 401 && user['refresh_token'] != null) {
                this.spotifyApiObj.setRefreshToken(user['refresh_token']);
                try {
                    let newToken = (await this.spotifyApiObj.refreshAccessToken()).body.access_token;
                    this.userService.updateUser(user, {access_token:newToken});
                    this.spotifyApiObj.setAccessToken(newToken);
                    let data = await this.spotifyApiObj[method](...params);
                    return data;
                }
                catch (e2) {
                    console.error(e2);
                    console.error('Unable to refresh token and call method again. Userdata = ');
                    console.error(user);
                }
            }
            if (e.statusCode === 403) {
                return 'not-premium';
            }
            if (e.statusCode === 404) {
                return 'spotify-issue';
            }
            console.error(e);
        }
    }

    setAccessToken(user) {
        this.spotifyApiObj.setAccessToken(user['access_token']);
        this.spotifyApiObj.setRefreshToken(user['refresh_token']);
    }

    async addToUserPlaylist(user, trackData) {
        user = await this.userService.getUser(user, 'context');
        let playlist_id = user['playlist_id'];
        try {
            await this.spotifyApi(user, 'addTracksToPlaylist', playlist_id, [trackData['value']], {position: 0})
        }
        catch (e) {
            console.error("Unable to add track to playlist user=");
            console.error(user);
            console.error(e);
        }
    }
}