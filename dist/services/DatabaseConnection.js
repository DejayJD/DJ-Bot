"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ChannelModel_1 = require("../models/ChannelModel");
const UserModel_1 = require("../models/UserModel");
var db = mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true });
exports.db = db;
const User = mongoose.model('user', UserModel_1.UserModel);
exports.User = User;
const Channel = mongoose.model('channel', ChannelModel_1.ChannelModel);
exports.Channel = Channel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0RhdGFiYXNlQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQy9CLHlEQUFvRDtBQUNwRCxtREFBOEM7QUFFOUMsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBTXJFLGdCQUFFO0FBSlYsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUscUJBQVMsQ0FBQyxDQUFDO0FBSW5DLG9CQUFJO0FBSGhCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLDJCQUFZLENBQUMsQ0FBQztBQUd0QywwQkFBTyJ9