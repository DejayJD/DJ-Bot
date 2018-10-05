import * as SpotifyWebApi from 'spotify-web-api-node'
import * as _ from "lodash";
import {UserService} from "./UserService";
import {DbUser} from "./DatabaseConnection";

export class SpotifyService {
    spotifyApi: any;
    userService: any;

    constructor(userService: UserService) {
        this.userService = userService;
        console.log(this.userService);
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT
        });
    }

    async callSpotifyApi(user, method, ...params) {
        this.spotifyApi.setAccessToken(user['access_token']);
        try {
            let data = await this.spotifyApi[method](...params);
            return data;
        }
        catch (e) {
            // If the error is caused by a 401, its probably cause token expired.
            // This tries refreshing and then attempting again
            // If that also fails it errors out completely
            if (e.statusCode === 401 && user['refresh_token'] != null) {
                this.spotifyApi.setRefreshToken(user['refresh_token']);
                try {
                    let newToken = (await this.spotifyApi.refreshAccessToken()).body.access_token;
                    this.userService.updateUser(user, {access_token:newToken});
                    this.spotifyApi.setAccessToken(newToken);
                    let data = await this.spotifyApi[method](...params);
                    return data;
                }
                catch (e2) {
                    console.error(e2);
                    console.error('Unable to refresh token and call method again. Userdata = ');
                    console.error(user);
                }
            }
            console.error(e);
        }
    }

    setAccessToken(user) {
        this.spotifyApi.setAccessToken(user['access_token']);
        this.spotifyApi.setRefreshToken(user['refresh_token']);
    }

    async addToUserPlaylist(userId, trackData, context) {
        let user = _.find(this.userService.users, (data) => {
            return data['context']['user']['id'] === userId && data['context']['type'] == context;
        });
        this.setAccessToken(user);
        let playlist_id = user['playlist_id'];
        try {
            await this.spotifyApi.addTracksToPlaylist(playlist_id, [trackData['value']], {position: 0});
        }
        catch (e) {
            console.error("Unable to add track to playlist user=");
            console.error(user);
            console.error(e);
        }
    }
}