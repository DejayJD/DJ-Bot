import * as mongoose from "mongoose";
import {Track} from "../models/Track";

const Schema = mongoose.Schema;

var db = mongoose.connect(process.env.MONGO_DB_URI, {useNewUrlParser: true});

const user = mongoose.model('user', {
        user_uuid: String, // Internal app token for tracking users
        username: String, //Will be originating from the app context (Slack, Discord, whatevs)
        context: Schema.Types.Mixed, //App context (slack, discord, hipchat)
        user_access_token: String, // Spotify access token
        user_refresh_token: String, // Spotify refresh token
        playlist_id: Schema.Types.Mixed, // id of their playlist queue
        device_id: Schema.Types.Mixed, // spotify device id
        channel: Schema.Types.Mixed, // channel that user is a part of
        active: Boolean, // if the user is active/inactive and should receive song sync updates
        isDj: Boolean,
    })
;
// const track = mongoose.model('track', Track);

export {db, user};