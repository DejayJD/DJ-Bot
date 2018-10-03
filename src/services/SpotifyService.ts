import * as SpotifyWebApi from 'spotify-web-api-node'
import * as _ from "lodash";
import {UserService} from "./UserService";

export class SpotifyService {
    spotifyApi : any;
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

    setAccessToken(user) {
        this.spotifyApi.setAccessToken(user['access_token']);
        this.spotifyApi.setRefreshToken(user['refresh_token']);
    }

    async addToUserPlaylist(userId, trackData, context) {
        console.log(this.userService);
        let user = _.find(this.userService.users, (data) => {
            return data['context']['user']['id'] === userId && data['context']['type'] == context;
        });
        this.setAccessToken(user);
        let playlist_id = user['playlist_id'];
        try {
            await this.spotifyApi.addTracksToPlaylist(playlist_id, [trackData['value']]);
        }
        catch (e) {
            console.error("Unable to add track to playlist user=");
            console.error(user);
            console.error(e);
        }
    }
}