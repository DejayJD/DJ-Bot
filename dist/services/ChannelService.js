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
    getChannel(channelData, query = 'channel_id') {
        return __awaiter(this, void 0, void 0, function* () {
            let queryObj = {};
            queryObj[query] = channelData[query];
            let channels = yield DatabaseConnection_1.Channel.find(queryObj);
            return channels[0];
        });
    }
    queryChannels(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DatabaseConnection_1.Channel.find(query);
        });
    }
    //Returns something like the following:
    //{ "listeners": {$elemMatch: {"user_uuid" : "cc072f60-d172-11e8-beb8-793e61f6e39a"}}}
    getChannelDataIncludes(userData, type, queryBy = 'user_uuid') {
        return { [type]: { $elemMatch: { [queryBy]: userData[queryBy] } } };
    }
    getUserCurrentActiveChannel(userData, queryBy = 'user_uuid') {
        return __awaiter(this, void 0, void 0, function* () {
            //Queries to find a channel where the user exists in the listeners or exists in the dj_queue
            let queryObj = { $or: [this.getChannelDataIncludes(userData, 'listeners', queryBy),
                    this.getChannelDataIncludes(userData, 'dj_queue', queryBy)] };
            return yield this.queryChannels(queryObj);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvQ2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFFQUFxRDtBQUVyRCxNQUFhLGNBQWM7SUFDakIsV0FBVzs7WUFDYixPQUFPLE1BQU0sNEJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0tBQUE7SUFFSyxVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssR0FBRyxZQUFZOztZQUM5QyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxJQUFJLFFBQVEsR0FBRyxNQUFNLDRCQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxLQUFLOztZQUNyQixPQUFPLE1BQU0sNEJBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRUQsdUNBQXVDO0lBQ3ZDLHNGQUFzRjtJQUN0RixzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sR0FBRyxXQUFXO1FBQ3hELE9BQU8sRUFBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFFLEVBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFBQyxFQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVLLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxPQUFPLEdBQUcsV0FBVzs7WUFDN0QsNEZBQTRGO1lBQzVGLElBQUksUUFBUSxHQUFHLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDO29CQUMzRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUM7WUFDbkYsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUssYUFBYSxDQUFDLE9BQU87O1lBQ3ZCLElBQUksWUFBWSxHQUFHO2dCQUNmLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtnQkFDOUIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2dCQUNsQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7Z0JBQ2xDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQjthQUMvQyxDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hDLElBQUksVUFBVSxHQUFHLElBQUksNEJBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUNyRSxJQUFJO2dCQUNBLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN4QixPQUFPLFVBQVUsQ0FBQzthQUNyQjtZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQzthQUM5QztRQUNMLENBQUM7S0FBQTtJQUVLLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxPQUFPOztZQUNwQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFDLFlBQVksRUFBRyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxPQUFPLEVBQUUsUUFBUTs7WUFDakMsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxPQUFPLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBQyxRQUFRLEVBQUcsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDO0tBQUE7SUFFSyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCOztZQUNuRCxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDO0tBQUE7SUFFSyxhQUFhLENBQUMsT0FBTyxFQUFFLFNBQVM7O1lBQ2xDLDRCQUFPLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBQyxFQUNuQztnQkFDSSxJQUFJLEVBQUUsU0FBUzthQUNsQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQztLQUFBO0NBQ0o7QUF0RUQsd0NBc0VDIn0=