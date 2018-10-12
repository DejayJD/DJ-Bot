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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvQ2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFFQUFxRDtBQUVyRCxNQUFhLGNBQWM7SUFDakIsV0FBVzs7WUFDYixPQUFPLE1BQU0sNEJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0tBQUE7SUFFSyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssR0FBRyxZQUFZOztZQUMxQyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxPQUFPLE1BQU0sNEJBQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUFBO0lBRUssYUFBYSxDQUFDLE9BQU87O1lBQ3ZCLElBQUksWUFBWSxHQUFHO2dCQUNmLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVTtnQkFDOUIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZO2dCQUNsQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7Z0JBQ2xDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLGlCQUFpQjthQUMvQyxDQUFDO1lBQ0YsSUFBSSxVQUFVLEdBQUcsSUFBSSw0QkFBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMseUJBQXlCO1lBQ3JFLElBQUk7Z0JBQ0EsTUFBTSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3hCLE9BQU8sVUFBVSxDQUFDO2FBQ3JCO1lBQ0QsT0FBTyxDQUFDLEVBQUU7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2FBQzlDO1FBQ0wsQ0FBQztLQUFBO0lBRUssaUJBQWlCLENBQUMsT0FBTyxFQUFFLE9BQU87O1lBQ3BDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUMsWUFBWSxFQUFHLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDdkUsQ0FBQztLQUFBO0lBRUssYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFROztZQUNqQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFDLFFBQVEsRUFBRyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7S0FBQTtJQUVLLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxpQkFBaUI7O1lBQ25ELE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekMsT0FBTyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxPQUFPLEVBQUUsU0FBUzs7WUFDbEMsNEJBQU8sQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFDLEVBQ25DO2dCQUNJLElBQUksRUFBRSxTQUFTO2FBQ2xCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQUE7Q0FDSjtBQW5ERCx3Q0FtREMifQ==