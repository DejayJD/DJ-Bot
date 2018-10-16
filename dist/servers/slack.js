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
            let result = yield app.getChannel(message).syncUser(user);
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
            let result = yield app.getChannel(message).removeListener(message);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVycy9zbGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCw0REFBdUQ7QUFHdkQsU0FBUyxJQUFJLENBQUMsR0FBRztJQUNiLG1HQUFtRztJQUNuRyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNyRCxNQUFNLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFDcEQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUNoQyxnQkFBZ0IsRUFBRTtZQUNkLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWE7U0FDakM7S0FDSixDQUFDLENBQUM7SUFHSCxVQUFVLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87UUFDcEQsOENBQThDO1FBQzlDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGtGQUFrRixDQUFDLENBQUE7SUFDMUcsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLGFBQWEsR0FBRztRQUNsQixPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLE9BQU8sRUFBRSxVQUFVO1FBQ25CLEtBQUssRUFBRSxLQUFLO1FBQ1osV0FBVyxFQUFFLFVBQVU7UUFDdkIsT0FBTyxFQUFFLGlCQUFpQjtRQUMxQixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsVUFBVTtRQUN0QixVQUFVLEVBQUUsVUFBVTtRQUN0QixnQkFBZ0IsRUFBQyxVQUFVO1FBQzNCLFlBQVksRUFBQyxtQkFBbUI7S0FDbkMsQ0FBQztJQUVGLE1BQU0sY0FBYyxHQUFHO1FBQ25CLGVBQWUsRUFBRSxtQkFBbUI7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