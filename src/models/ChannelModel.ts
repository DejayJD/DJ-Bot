/*
 *  Created By JD.Francis on 9/27/18
 */
import * as mongoose from "mongoose";

const Schema = mongoose.Schema;


export const ChannelModel = {
    channel_id: String,
    channel_name: String,
    current_song: {
        uri: String,
        start_time: Date,
        duration_ms: Number
    },
    dj_queue: Schema.Types.Mixed,
    channel_listeners: Schema.Types.Mixed,
    incoming_webhook: String
};