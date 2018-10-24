import {Channel} from "../models/DatabaseConnection";

export class ChannelService {
    async getChannels() {
        return await Channel.find();
    }

    async getChannel(channelData, query = 'channel_id') {
        let queryObj = {};
        queryObj[query] = channelData[query];
        let channels = await Channel.find(queryObj);
        return channels[0];
    }

    async queryChannels(query) {
        return await Channel.find(query);
    }

    //Returns something like the following:
    //{ "listeners": {$elemMatch: {"user_uuid" : "cc072f60-d172-11e8-beb8-793e61f6e39a"}}}
    getChannelDataIncludes(userData, type, queryBy = 'user_uuid') {
        return {[type]: {$elemMatch: {[queryBy]: userData[queryBy]}}};
    }

    async getUserCurrentActiveChannel(userData, queryBy = 'user_uuid') {
        //Queries to find a channel where the user exists in the listeners or exists in the dj_queue
        let queryObj = {$or: [this.getChannelDataIncludes(userData, 'listeners', queryBy),
                              this.getChannelDataIncludes(userData, 'dj_queue', queryBy)]};
        return await this.queryChannels(queryObj);
    }

    async createChannel(channel) {
        let channelModel = {
            channel_id: channel.channel_id,
            channel_name: channel.channel_name,
            current_song: channel.current_song,
            dj_queue: channel.dj_queue,
            channel_listeners: channel.channel_listeners
        };
        console.log("Creating channel");
        let newChannel = new Channel(channelModel); //adds the user to the DB
        try {
            await newChannel.save();
            return newChannel;
        }
        catch (e) {
            console.error(e);
            console.error("Unable to save user to db");
        }
    }

    async updateCurrentSong(channel, newSong) {
        channel = await this.getChannel(channel);
        return await this.updateChannel(channel, {current_song : newSong});
    }

    async updateDjQueue(channel, newQueue) {
        channel = await this.getChannel(channel);
        return await this.updateChannel(channel, {dj_queue : newQueue});
    }

    async updateChannelListeners(channel, channel_listeners) {
        channel = await this.getChannel(channel);
        return await this.updateChannel(channel, {channel_listeners: channel_listeners});
    }

    async updateChannel(channel, newValues) {
        Channel.updateOne({_id: channel['_id']},
            {
                $set: newValues
            }).exec().then().catch();
    }
}