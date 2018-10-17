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
            let result = yield channel.syncUser(user);
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
                bot.replyPrivate(message, "You are not currently listening to music in this channel.");
            }
            else if (result === 'removed-listener') {
                bot.replyPrivate(message, "You are no longer listening to music in this channel");
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        });
    }
    function getChannelListeners(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield app.getChannel(message);
            let listeners = _.map(yield channel.getChannelListeners(), (listener) => {
                return SlackMessages_1.SlackMessages.linkUsername(listener);
            });
            if (listeners.length > 0) {
                bot.replyPrivate(message, "Listening right now: " + _.join(listeners, ', '));
            }
            else {
                bot.replyPrivate(message, "Nobody is currently synced to the channel");
            }
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
                        return SlackMessages_1.SlackMessages.linkUsername(dj.username);
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
            else if (result === 'empty-playlist') {
                bot.replyPrivate(message, "You don't have any songs in your playlist. Type /song to add some songs first!");
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
                if (searchResults.tracks.items.length === 0) {
                    bot.replyPrivate(message, 'No results found :(');
                }
                else {
                    let slicedResults = searchResults.tracks.items.slice(0, 5);
                    slicedResults = _.map(slicedResults, (track) => {
                        return SlackMessages_1.SlackMessages.parseTrack(track);
                    });
                    let attachments = _.map(slicedResults, (track) => {
                        return SlackMessages_1.SlackMessages.AddTrackButton(track);
                    });
                    bot.replyPrivate(message, { 'attachments': attachments });
                }
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