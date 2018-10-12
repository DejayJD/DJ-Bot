"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ChannelModel_1 = require("./ChannelModel");
const UserModel_1 = require("./UserModel");
var db = mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true });
exports.db = db;
const User = mongoose.model('user', UserModel_1.UserModel);
exports.User = User;
const Channel = mongoose.model('channel', ChannelModel_1.ChannelModel);
exports.Channel = Channel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9EYXRhYmFzZUNvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBcUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztBQUMvQixpREFBNEM7QUFDNUMsMkNBQXNDO0FBRXRDLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBQyxlQUFlLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztBQU1yRSxnQkFBRTtBQUpWLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLHFCQUFTLENBQUMsQ0FBQztBQUluQyxvQkFBSTtBQUhoQixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSwyQkFBWSxDQUFDLENBQUM7QUFHdEMsMEJBQU8ifQ==