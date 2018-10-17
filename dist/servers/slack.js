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
/**
 * Slack bot integration
 */
const _ = require("lodash");
const UserService_1 = require("../services/UserService");
const ServiceManager_1 = require("../services/ServiceManager");
const SlackMessages_1 = require("../classes/SlackMessages");
function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    const controller = require('../../lib/bot_setup.js');
    const userService = ServiceManager_1.Service.getService(UserService_1.UserService);
    const webhookBot = controller.spawn({
        incoming_webhook: {
            url: process.env.SLACK_WEBHOOK
        }
    });
    controller.on('bot_channel_join', function (bot, message) {
        //TODO: Create channel if not already existing
        bot.reply(message, "Lets get some tunes going!\nNeed some help getting some bangers going? Try /help");
    });
    const slashCommands = {
        "/sync": sync,
        "/song": searchSongs,
        "/skip": skipToNext,
        "/dj": addDj,
        "/stepdown": stepDownDj,
        "/stop": stopUserListening,
        "/djs": getDjList,
        "/playing": getPlaying,
        "/dj-help": comingSoon,
        "/dj-suggestion": comingSoon,
        "/listening": getChannelListeners
    };
    const buttonCommands = {
        "spotify_login": getSpotifyLoginLink,
        "add_song_to_queue": addSongToQueue
    };
    const outgoingMessages = {
        "nowPlaying": displayNowPlaying
    };
    app.outgoingMessages.subscribe((data) => __awaiter(this, void 0, void 0, function* () {
        try {
            let callback = outgoingMessages[data['type']];
            callback(webhookBot, data);
        }
        catch (e) {
            console.error('Unable to send outgoing message!');
            console.error(e);
        }
    }));
    controller.on('slash_command', function (bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let userLoggedIn = yield userService.userIsLoggedIn(createSlackObject(message), 'slack');
                let callback = userLoggedIn ? slashCommands[message.command] : requestLogin;
                callback(bot, message);
            }
            catch (e) {
                bot.replyPrivate(message, "Whoops, something went wrong with that command!");
                console.error(e);
            }
        });
    });
    controller.hears('hello', 'direct_message', function (bot, message) {
        bot.reply(message, 'Hello!');
    });
    function displayNowPlaying(bot, data) {
        bot.sendWebhook(Object.assign({}, SlackMessages_1.SlackMessages.NowPlayingMessage(SlackMessages_1.SlackMessages.parseTrack(data.data), data.user), { channel: data.channel }), function (err, res) {
        });
    }
    function sync(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = userService.getSlackUser(createSlackObject(message));
            let channel = yield app.getChannel(message);
            let result = channel.syncUser(user);
            if (result === 'no-song') {
                bot.replyPrivate(message, "There are currently no songs playing. Type /dj to get some tunes going!");
            }
            else if (result === 'syncing') {
                bot.replyPrivate(message, "Syncing you up...");
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        });
    }
    function comingSoon(bot, message) {
        bot.replyPrivate(message, "That command is still in development and coming soon...");
    }
    function stopUserListening(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield app.getChannel(message);
            let user = yield userService.getUser(createSlackObject(message), 'context');
            let result = channel.removeListener(user);
            if (result === 'listener-doesnt-exist') {
                bot.replyPrivate(message, "You are not currently sync-ing up music to this channel.");
            }
            else if (result === 'removed-listener') {
                bot.replyPrivate(message, "You are no longer sync-ing music to this channel");
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        });
    }
    function getChannelListeners(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield app.getChannel(message);
            bot.replyPrivate(message, "Listening right now: " + _.join(channel.channel_listeners, ', '));
        });
    }
    function getPlaying(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield app.getChannel(message);
            let result = channel.getCurrentSong();
            if (result === 'no-song-playing') {
                bot.replyPrivate(message, "There are currently no songs playing. Type /dj to get some tunes going!");
            }
            else if (typeof result === 'object') {
                if (!_.isNil(result.track.track_data)) {
                    bot.replyPrivate(message, SlackMessages_1.SlackMessages.NowPlayingMessage(SlackMessages_1.SlackMessages.parseTrack(result.track.track_data), result.user));
                }
                else {
                    bot.replyPrivate(message, 'Whoops, something went wrong.');
                }
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        });
    }
    function getDjList(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield app.getChannel(message);
            let result = yield channel.getCurrentDjs();
            if (Array.isArray(result)) {
                if (result.length === 0) {
                    bot.replyPrivate(message, 'There are currently no users in the DJ Queue. Type /dj to become a DJ!');
                }
                else {
                    let djNames = _.join(_.map(result, (dj) => {
                        return dj.context.user.name;
                    }), ' :arrow_right: ');
                    bot.replyPrivate(message, 'Current DJ order: :musical_note: ' + djNames);
                }
            }
            else if (result === 'removed-listener') {
                bot.replyPrivate(message, "You are no longer sync-ing music");
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        });
    }
    function requestLogin(bot, message) {
        bot.replyPrivate(message, SlackMessages_1.SlackMessages.SpotifyLoginButton());
    }
    function skipToNext(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = userService.getSlackUser(createSlackObject(message));
            let response = yield app.skipToNextSong(user);
            if (response === 'no-dj') {
                bot.replyPrivate(message, 'There are currently no users in the DJ Queue. Type /dj to become a DJ!');
            }
            else {
                bot.reply(message, user.context.user.name + ' requested to skip to next song');
            }
        });
    }
    function getSpotifyLoginLink(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = createSlackObject(message);
            user = yield app.loginUser(user);
            let loginMsg = `Login to Spotify to enable DJ-Bot! ${process.env.SPOTIFY_LOGIN}?user_uuid=${user['user_uuid']}`;
            bot.replyInteractive(message, loginMsg);
        });
    }
    function addSongToQueue(bot, message) {
        let user = createSlackObject(message);
        let trackData = message['actions'][0];
        app.addToUserPlaylist(user, trackData);
        bot.replyInteractive(message, 'Song added!');
    }
    function addDj(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = createSlackObject(message);
            let result = yield app.addDj(user);
            if (result === 'added') {
                // await app.getUserChannel(user).syncUser(user);
                bot.reply(message, user.context.user.name + " has become a DJ");
            }
            else if (result === 'already-added') {
                bot.replyPrivate(message, "You are already a DJ");
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong with adding you as a dj');
            }
        });
    }
    function stepDownDj(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = createSlackObject(message);
            let result = yield app.removeDj(user);
            if (result === 'removed') {
                bot.reply(message, user.context.user.name + " has stopped being a DJ");
            }
            else if (result === 'doesnt-exist') {
                bot.replyPrivate(message, "You are not currently a DJ");
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong while removing you as a dj');
            }
        });
    }
    function searchSongs(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = createSlackObject(message);
                let searchResults = yield app.searchSongs(user, message.text);
                let slicedResults = searchResults.tracks.items.slice(0, 5);
                slicedResults = _.map(slicedResults, (track) => {
                    return SlackMessages_1.SlackMessages.parseTrack(track);
                });
                let attachments = _.map(slicedResults, (track) => {
                    return SlackMessages_1.SlackMessages.AddTrackButton(track);
                });
                bot.replyPrivate(message, { 'attachments': attachments });
            }
            catch (e) {
                console.error(e);
                bot.replyPrivate(message, "Oops something went wrong");
            }
        });
    }
    controller.on('interactive_message_callback', function (bot, message) {
        let callback = buttonCommands[message['callback_id']];
        callback(bot, message);
    });
    function createSlackObject(message) {
        let user, channel, team;
        try {
            user = message['raw_message']['user'];
            channel = message['raw_message']['channel'];
            team = message['raw_message']['team'];
        }
        catch (e) {
        }
        if (user == null) {
            user = {
                id: message['raw_message']['user_id'],
                name: message['raw_message']['user_name']
            };
        }
        if (channel == null) {
            channel = {
                id: message['raw_message']['channel_id'],
                name: message['raw_message']['channel_name']
            };
        }
        if (team == null) {
            team = {
                id: message['raw_message']['team_id'],
                domain: message['raw_message']['team_domain']
            };
        }
        return {
            channel: channel,
            context: {
                type: 'slack',
                user: user,
                team: team,
            }
        };
    }
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVycy9zbGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCw0REFBdUQ7QUFJdkQsU0FBUyxJQUFJLENBQUMsR0FBUztJQUNuQixtR0FBbUc7SUFDbkcsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDckQsTUFBTSxXQUFXLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDaEMsZ0JBQWdCLEVBQUU7WUFDZCxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhO1NBQ2pDO0tBQ0osQ0FBQyxDQUFDO0lBR0gsVUFBVSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ3BELDhDQUE4QztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxrRkFBa0YsQ0FBQyxDQUFBO0lBQzFHLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxhQUFhLEdBQUc7UUFDbEIsT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsV0FBVztRQUNwQixPQUFPLEVBQUUsVUFBVTtRQUNuQixLQUFLLEVBQUUsS0FBSztRQUNaLFdBQVcsRUFBRSxVQUFVO1FBQ3ZCLE9BQU8sRUFBRSxpQkFBaUI7UUFDMUIsTUFBTSxFQUFFLFNBQVM7UUFDakIsVUFBVSxFQUFFLFVBQVU7UUFDdEIsVUFBVSxFQUFFLFVBQVU7UUFDdEIsZ0JBQWdCLEVBQUMsVUFBVTtRQUMzQixZQUFZLEVBQUMsbUJBQW1CO0tBQ25DLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRztRQUNuQixlQUFlLEVBQUUsbUJBQW1C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