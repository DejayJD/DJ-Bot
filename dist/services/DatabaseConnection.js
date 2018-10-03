"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var db = mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true });
exports.db = db;
const user = mongoose.model('user', {
    user_uuid: String,
    username: String,
    context: Schema.Types.Mixed,
    user_access_token: String,
    user_refresh_token: String,
    playlist_id: Schema.Types.Mixed,
    device_id: Schema.Types.Mixed,
    channel: Schema.Types.Mixed,
    active: Boolean,
    isDj: Boolean,
});
exports.user = user;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VDb25uZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0RhdGFiYXNlQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUdyQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBRS9CLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBQyxlQUFlLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztBQWlCckUsZ0JBQUU7QUFmVixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtJQUM1QixTQUFTLEVBQUUsTUFBTTtJQUNqQixRQUFRLEVBQUUsTUFBTTtJQUNoQixPQUFPLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO0lBQzNCLGlCQUFpQixFQUFFLE1BQU07SUFDekIsa0JBQWtCLEVBQUUsTUFBTTtJQUMxQixXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO0lBQy9CLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7SUFDN0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSztJQUMzQixNQUFNLEVBQUUsT0FBTztJQUNmLElBQUksRUFBRSxPQUFPO0NBQ2hCLENBQUMsQ0FDTDtBQUdXLG9CQUFJIn0=