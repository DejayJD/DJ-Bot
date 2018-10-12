"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const ChannelModel_1 = require("./ChannelModel");
const UserModel_1 = require("./UserModel");
const Schema = mongoose.Schema;
var db;
exports.db = db;
connectToDB();
function connectToDB() {
    exports.db = db = mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true })
        .then(() => {
        console.log("MongoDB Connected!");
    })
        .catch((e) => {
        console.error("Unable to connect to mongo :( Trying again in 3s");
        setTimeout(() => {
            connectToDB();
        }, 3000);
    });
}
const User = mongoose.model('user', UserModel_1.UserModel);
exports.User = User;
const Channel = mongoose.model('channel', ChannelModel_1.ChannelModel);
exports.Channel = Channel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9EYXRhYmFzZUNvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBcUM7QUFDckMsaURBQTRDO0FBQzVDLDJDQUFzQztBQUV0QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBRy9CLElBQUksRUFBRSxDQUFDO0FBb0JDLGdCQUFFO0FBbkJWLFdBQVcsRUFBRSxDQUFDO0FBQ2QsU0FBUyxXQUFXO0lBQ2hCLGFBQUEsRUFBRSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBQyxlQUFlLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDbkUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUNyQyxDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztRQUNsRSxVQUFVLENBQUMsR0FBRSxFQUFFO1lBQ1gsV0FBVyxFQUFFLENBQUM7UUFDbEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBR0QsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUscUJBQVMsQ0FBQyxDQUFDO0FBSW5DLG9CQUFJO0FBSGhCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLDJCQUFZLENBQUMsQ0FBQztBQUd0QywwQkFBTyJ9