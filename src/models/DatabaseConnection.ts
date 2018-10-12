import * as mongoose from "mongoose";
const Schema = mongoose.Schema;
import {ChannelModel} from "./ChannelModel";
import {UserModel} from "./UserModel";

var db = mongoose.connect(process.env.MONGO_DB_URI, {useNewUrlParser: true});

const User = mongoose.model('user', UserModel);
const Channel = mongoose.model('channel', ChannelModel);
// const track = mongoose.model('track', Track);

export {db, User, Channel};