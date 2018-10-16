import {Channel} from "../models/DatabaseConnection";

export class ChannelService {
    async getChannels() {
        return await Channel.find();
    }

    async getChannel(channel, query = 'channel_id') {
        let queryObj = {};
        queryObj[query] = channel[query];
        return await Channel.find(queryObj);
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