import * as mongoose from "mongoose";
import {ChannelModel} from "./ChannelModel";
import {UserModel} from "./UserModel";

const Schema = mongoose.Schema;


var db;
connectToDB();
function connectToDB() {
    db = mongoose.connect(process.env.MONGO_DB_URI, {useNewUrlParser: true})
        .then(() => {
            console.log("MongoDB Connected!")
        })
        .catch((e) => {
            console.error("Unable to connect to mongo :( Trying again in 3s");
            setTimeout(()=>{
                connectToDB();
            }, 3000);
        });
}


const User = mongoose.model('user', UserModel);
const Channel = mongoose.model('channel', ChannelModel);
// const track = mongoose.model('track', Track);

export {db, User, Channel};