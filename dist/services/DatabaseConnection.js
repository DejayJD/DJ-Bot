"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var db = mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true });
exports.db = db;
const DbUser = mongoose.model('user', {
    user_uuid: String,
    username: String,
    context: Schema.Types.Mixed,
    access_token: String,
    refresh_token: String,
    playlist_id: Schema.Types.Mixed,
    device_id: Schema.Types.Mixed,
    channel: Schema.Types.Mixed,
    active: Boolean,
    isDj: Boolean,
});
exports.DbUser = DbUser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0RhdGFiYXNlQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUdyQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBRS9CLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBQyxlQUFlLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztBQWlCckUsZ0JBQUU7QUFmVixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtJQUM5QixTQUFTLEVBQUUsTUFBTTtJQUNqQixRQUFRLEVBQUUsTUFBTTtJQUNoQixPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO0lBQzNCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLFdBQVcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7SUFDL0IsU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSztJQUM3QixPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO0lBQzNCLE1BQU0sRUFBRSxPQUFPO0lBQ2YsSUFBSSxFQUFFLE9BQU87Q0FDaEIsQ0FBQyxDQUNMO0FBR1csd0JBQU0ifQ==