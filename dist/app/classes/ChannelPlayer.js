"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChannelPlayer {
    constructor(channel_id, channel_name) {
        this.currentSong = {
            uri: 'spotify:track:2fTjkEmR1t7J4WICztg136',
            startTime: new Date()
        };
        this.songHistory = []; // ["uri1", "uri2", "uri3"] -- List of previous songs
        this.currentDevices = [];
        this.users = []; //-- list of users - users with active = true will receive sync updates
        // -- djQueue will be in the order that djs will take turns in
        this.djQueue = []; // ["User 1", "User 2", "User 3"]
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
exports.ChannelPlayer = ChannelPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY2xhc3Nlcy9DaGFubmVsUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsTUFBYSxhQUFhO0lBY3RCLFlBQVksVUFBVSxFQUFFLFlBQVk7UUFWcEMsZ0JBQVcsR0FBVztZQUNsQixHQUFHLEVBQUUsc0NBQXNDO1lBQzNDLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtTQUN4QixDQUFDO1FBQ0YsZ0JBQVcsR0FBVSxFQUFFLENBQUMsQ0FBQyxxREFBcUQ7UUFDOUUsbUJBQWMsR0FBVSxFQUFFLENBQUM7UUFDM0IsVUFBSyxHQUFXLEVBQUUsQ0FBQyxDQUFDLHVFQUF1RTtRQUMzRiw4REFBOEQ7UUFDOUQsWUFBTyxHQUFVLEVBQUUsQ0FBQyxDQUFBLGlDQUFpQztRQUdqRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUNyQyxDQUFDO0lBRUQsU0FBUztRQUNMLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQsU0FBUztJQUVULENBQUM7SUFFRCxhQUFhO1FBQ1QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsVUFBVTtRQUNOLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELEtBQUssQ0FBQyxFQUFFO1FBQ0oseUNBQXlDO0lBQzdDLENBQUM7SUFFRCxRQUFRLENBQUMsRUFBRTtRQUNQLDRDQUE0QztJQUNoRCxDQUFDO0lBRUQsY0FBYyxDQUFDLEVBQUUsRUFBRSxXQUFXO1FBQzFCLHVEQUF1RDtJQUMzRCxDQUFDO0lBRUQsMkZBQTJGO0lBQzNGLGdCQUFnQixDQUFDLElBQUk7UUFDakIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxLQUFLO1FBQ3JCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELFlBQVk7UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQztDQUNKO0FBL0RELHNDQStEQyJ9