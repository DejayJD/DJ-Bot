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
        "/playing": getPlaying
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
            let result = yield app.getUserChannel(user).syncUser(user);
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
    function stopUserListening(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = userService.getSlackUser(createSlackObject(message));
            let result = yield app.getUserChannel(user).removeListener(user);
            if (result === 'listener-doesnt-exist') {
                bot.replyPrivate(message, "You are not currently sync-ing up music.");
            }
            else if (result === 'removed-listener') {
                bot.replyPrivate(message, "You are no longer sync-ing music");
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        });
    }
    function getPlaying(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = userService.getSlackUser(createSlackObject(message));
            let channel = yield app.getUserChannel(user);
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
            let user = userService.getSlackUser(createSlackObject(message));
            let channel = yield app.getUserChannel(user);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVycy9zbGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCw0REFBdUQ7QUFHdkQsU0FBUyxJQUFJLENBQUMsR0FBRztJQUNiLG1HQUFtRztJQUNuRyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNyRCxNQUFNLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFDcEQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUNoQyxnQkFBZ0IsRUFBRTtZQUNkLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWE7U0FDakM7S0FDSixDQUFDLENBQUM7SUFHSCxVQUFVLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87UUFDcEQsOENBQThDO1FBQzlDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGtGQUFrRixDQUFDLENBQUE7SUFDMUcsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLGFBQWEsR0FBRztRQUNsQixPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLE9BQU8sRUFBRSxVQUFVO1FBQ25CLEtBQUssRUFBRSxLQUFLO1FBQ1osV0FBVyxFQUFFLFVBQVU7UUFDdkIsT0FBTyxFQUFFLGlCQUFpQjtRQUMxQixNQUFNLEVBQUUsU0FBUztRQUNqQixVQUFVLEVBQUUsVUFBVTtLQUN6QixDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUc7UUFDbkIsZUFBZSxFQUFFLG1CQUFtQjtRQUNwQyxtQkFBbUIsRUFBRSxjQUFjO0tBQ3RDLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFHO1FBQ3JCLFlBQVks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