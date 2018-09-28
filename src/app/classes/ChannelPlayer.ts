/*
 *  Created By JD.Francis on 9/26/18
 */
import {User} from "./User";
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

    constructor(channel_id, channel_name) {
        this.channel_id = channel_id;
        this.channel_name = channel_name;
    }

    broadcast() {
        this.syncUsers();
    }

    syncUsers() {

    }

    selectNewSong() {
        this.goToNextDj();
        let nextSong = this.getUsersNextSong(this.getCurrentDJ());
    }

    goToNextDj() {
        this.cycleFirstArrayItem(this.djQueue);
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

    // Moves current song to the back of the queue, gets the first one in the queue after that.
    getUsersNextSong(user) {
        return this.cycleFirstArrayItem(user.queue);
    }

    cycleFirstArrayItem(array) {
        let firstItem = array[0];
        array = array.shift();
        array.push(firstItem);
        return array;
    }

    getCurrentDJ() {
        return this.djQueue[0];
    }
}
