/*
 *  Created By JD.Francis on 9/26/18
 */
class ChannelPlayer {
    constructor(channelId, channelName) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.currentSong = {  // Current song uri + start time
            uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
            startTime: new Date()
        };
        this.songHistory = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
        this.currentDevices = [];
        this.users = []; //-- list of users - users with active = true will receive sync updates
        this.djQueue = [];// ["User 1", "User 2", "User 3"]
        // -- djQueue will be in the order that djs will take turns in
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

    getUsersNextSong() {
        let queue = this.getCurrentDJ().playlist;
        queue = this.cycleFirstArrayItem(queue);
        let newSong = queue[0];
        return newSong;
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

module.exports = ChannelPlayer;