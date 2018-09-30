/*
 *  Created By JD.Francis on 9/26/18
 */
import {User} from "./User";
import {SpotifyService} from "../../spotify/services/SpotifyService";
import {Service} from "../services/ServiceManager";
import {Track} from "./Track";

export class ChannelPlayer {

    channel_id: number;
    channel_name: string;
    currentSong?: Track = {  // Current song uri + start time
        uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
        startTime: new Date()
    };
    songHistory: any[] = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
    currentDevices: any[] = [];
    users: User[] = []; //-- list of users - users with active = true will receive sync updates
    // -- djQueue will be in the order that djs will take turns in
    djQueue: any[] = [];// ["User 1", "User 2", "User 3"]
    spotifyApi: any;

    constructor(channel_id, channel_name) {
        this.channel_id = channel_id;
        this.channel_name = channel_name;
        this.spotifyApi = Service.getService(SpotifyService).spotifyApi;
    }

    async syncUser(user) {
        this.spotifyApi.setAccessToken(user['access_token']);
        let currentTimestamp: any = new Date(); // Had to cast it to any to make typescript stop complaining.
        let startTime: any = this.currentSong.startTime; // Had to cast it to any to make typescript stop complaining.
        let playbackDifference = Math.abs(currentTimestamp - startTime);
        let playData = {uris: [this.currentSong.uri], 'position_ms': playbackDifference};
        try {
            await this.spotifyApi.play(playData);
        }
        catch (e) {
            console.error('unable to sync music =( playData = ');
            console.error(playData);
            console.error(e);
        }
    }

    syncUsers(users) {
        for (let user of users) {
            this.syncUser(user);
        }
    }

    async moveTopSongToBottom(user) {
        let playlist = await this.spotifyApi.getPlaylist(user['playlist_id']);
        console.log(playlist);
        console.log(playlist['total']);
    }

    async getUsersNextSong(user) {
        try {
            let tracks = await this.spotifyApi.getPlaylistTracks(user.playlist_id);
            this.moveTopSongToBottom(user);
            return tracks.body.items[0];
        }
        catch (e) {
            console.error(e);
        }
    }

    updateCurrentSong(songUri) {
        this.currentSong = {
            uri: songUri,
            startTime: new Date()
        }
    }

    async nextSong(users) {
        // this.goToNextDj();
        let nextSong = await this.getUsersNextSong(users[0]);
        this.updateCurrentSong(nextSong.track['uri']);
        this.syncUsers(users);
    }

    //TODO: add DJ logic
    goToNextDj() {
    }

    addDj(dj) {
        //TODO: find and add a dj to the dj queue
    }

    removeDj(dj) {
        //TODO: find and remove a dj to the dj queue
    }

    moveDjPosition(dj, newPosition) {
        //TODO: find dj reference and move them to new position
    }


    // cycleFirstArrayItem(array) {
    //     let firstItem = array[0];
    //     array = array.shift();
    //     array.push(firstItem);
    //     return array;
    // }

    getCurrentDJ() {
        return this.djQueue[0];
    }
}
