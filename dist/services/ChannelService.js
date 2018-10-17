"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseConnection_1 = require("../models/DatabaseConnection");
class ChannelService {
    getChannels() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DatabaseConnection_1.Channel.find();
        });
    }
    getChannel(channel, query = 'channel_id') {
        return __awaiter(this, void 0, void 0, function* () {
            let queryObj = {};
            queryObj[query] = channel[query];
            let channels = yield DatabaseConnection_1.Channel.find(queryObj);
            return channels[0];
        });
    }
    queryChannels(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let channels = yield DatabaseConnection_1.Channel.find(query);
            return channels;
        });
    }
    createChannel(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            let channelModel = {
                channel_id: channel.channel_id,
                channel_name: channel.channel_name,
                current_song: channel.current_song,
                dj_queue: channel.dj_queue,
                channel_listeners: channel.channel_listeners
            };
            console.log("Creating channel");
            let newChannel = new DatabaseConnection_1.Channel(channelModel); //adds the user to the DB
            try {
                yield newChannel.save();
                return newChannel;
            }
            catch (e) {
                console.error(e);
                console.error("Unable to save user to db");
            }
        });
    }
    updateCurrentSong(channel, newSong) {
        return __awaiter(this, void 0, void 0, function* () {
            channel = yield this.getChannel(channel);
            return yield this.updateChannel(channel, { current_song: newSong });
        });
    }
    updateDjQueue(channel, newQueue) {
        return __awaiter(this, void 0, void 0, function* () {
            channel = yield this.getChannel(channel);
            return yield this.updateChannel(channel, { dj_queue: newQueue });
        });
    }
    updateChannelListeners(channel, channel_listeners) {
        return __awaiter(this, void 0, void 0, function* () {
            channel = yield this.getChannel(channel);
            return yield this.updateChannel(channel, { channel_listeners: channel_listeners });
        });
    }
    updateChannel(channel, newValues) {
        return __awaiter(this, void 0, void 0, function* () {
            DatabaseConnection_1.Channel.updateOne({ _id: channel['_id'] }, {
                $set: newValues
            }).exec().then().catch();
        });
    }
}
exports.ChannelService = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvQ2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFFQUFxRDtBQUVyRCxNQUFhLGNBQWM7SUFDakIsV0FBVzs7WUFDYixPQUFPLE1BQU0sNEJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0tBQUE7SUFFSyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssR0FBRyxZQUFZOztZQUMxQyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxJQUFJLFFBQVEsR0FBRyxNQUFNLDRCQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxLQUFLOztZQUNyQixJQUFJLFFBQVEsR0FBRyxNQUFNLDRCQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxPQUFPOztZQUN2QixJQUFJLFlBQVksR0FBRztnQkFDZixVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7Z0JBQzlCLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtnQkFDbEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2dCQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7Z0JBQzFCLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxpQkFBaUI7YUFDL0MsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNoQyxJQUFJLFVBQVUsR0FBRyxJQUFJLDRCQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyx5QkFBeUI7WUFDckUsSUFBSTtnQkFDQSxNQUFNLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxVQUFVLENBQUM7YUFDckI7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7YUFDOUM7UUFDTCxDQUFDO0tBQUE7SUFFSyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTzs7WUFDcEMsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxPQUFPLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBQyxZQUFZLEVBQUcsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBQUE7SUFFSyxhQUFhLENBQUMsT0FBTyxFQUFFLFFBQVE7O1lBQ2pDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUMsUUFBUSxFQUFHLFFBQVEsRUFBQyxDQUFDLENBQUM7UUFDcEUsQ0FBQztLQUFBO0lBRUssc0JBQXNCLENBQUMsT0FBTyxFQUFFLGlCQUFpQjs7WUFDbkQsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxPQUFPLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztLQUFBO0lBRUssYUFBYSxDQUFDLE9BQU8sRUFBRSxTQUFTOztZQUNsQyw0QkFBTyxDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUMsRUFDbkM7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7YUFDbEIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pDLENBQUM7S0FBQTtDQUNKO0FBMURELHdDQTBEQyJ9