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
            return yield DatabaseConnection_1.Channel.find(queryObj);
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
            console.log("updating id = " + channel['_id'] + "newValues = " + JSON.stringify((newValues)));
            DatabaseConnection_1.Channel.updateOne({ _id: channel['_id'] }, {
                $set: newValues
            }).exec().then().catch();
        });
    }
}
exports.ChannelService = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvQ2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFFQUFxRDtBQUVyRCxNQUFhLGNBQWM7SUFDakIsV0FBVzs7WUFDYixPQUFPLE1BQU0sNEJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0tBQUE7SUFFSyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssR0FBRyxZQUFZOztZQUMxQyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxPQUFPLE1BQU0sNEJBQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUFBO0lBRUssYUFBYSxDQUFDLE9BQU87O1lBQ3ZCLElBQUksWUFBWSxHQUFHO2dCQUNmLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtnQkFDOUIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2dCQUNsQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7Z0JBQ2xDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQjthQUMvQyxDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hDLElBQUksVUFBVSxHQUFHLElBQUksNEJBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUNyRSxJQUFJO2dCQUNBLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN4QixPQUFPLFVBQVUsQ0FBQzthQUNyQjtZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQzthQUM5QztRQUNMLENBQUM7S0FBQTtJQUVLLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxPQUFPOztZQUNwQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFDLFlBQVksRUFBRyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxPQUFPLEVBQUUsUUFBUTs7WUFDakMsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxPQUFPLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBQyxRQUFRLEVBQUcsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDO0tBQUE7SUFFSyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCOztZQUNuRCxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDO0tBQUE7SUFFSyxhQUFhLENBQUMsT0FBTyxFQUFFLFNBQVM7O1lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUUsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9GLDRCQUFPLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBQyxFQUNuQztnQkFDSSxJQUFJLEVBQUUsU0FBUzthQUNsQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQztLQUFBO0NBQ0o7QUFyREQsd0NBcURDIn0=