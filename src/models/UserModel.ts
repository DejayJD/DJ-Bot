/*
 *  Created By JD.Francis on 9/26/18
 */
import * as mongoose from "mongoose";
const Schema = mongoose.Schema;

export const UserModel = {
    user_uuid: String, // Internal app token for tracking users
    username: String, //Will be originating from the app context (Slack, Discord, whatevs)
    context: Schema.Types.Mixed, //App context (slack, discord, hipchat)
    access_token: String, // Spotify access token
    refresh_token: String, // Spotify refresh token
    playlist_id: Schema.Types.Mixed, // id of their playlist queue
    device_id: Schema.Types.Mixed, // spotify device id
    channel: Schema.Types.Mixed, // channel that user is a part of
    active: Boolean, // if the user is active/inactive and should receive song sync updates
    isDj: Boolean,
};