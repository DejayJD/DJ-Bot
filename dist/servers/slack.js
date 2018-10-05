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
const spotifyColor = "#1DB954";
function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    let controller = require('../../lib/bot_setup.js');
    let userService = ServiceManager_1.Service.getService(UserService_1.UserService);
    let bot = controller.spawn({
        incoming_webhook: {
            url: process.env.SLACK_WEBHOOK
        }
    });
    app.bot = bot;
    controller.on('bot_channel_join', function (bot, message) {
        //TODO: Create channel if not already existing
        bot.reply(message, "Lets get some tunes going!\nNeed some help getting some bangers going? Try /help");
    });
    const slashCommands = {
        "/sync": sync,
        "/song": searchSongs,
        "/skip": skipToNext,
        "/dj": addDj
    };
    const buttonCommands = {
        "spotify_login": getSpotifyLoginLink,
        "add_song_to_queue": addSongToQueue
    };
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
    function sync(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        app.getUserChannel.syncUser(user);
        bot.replyPrivate("Syncing you up...");
    }
    function requestLogin(bot, message) {
        bot.replyPrivate(message, generateSpotifyLoginButton());
    }
    function skipToNext(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = userService.getSlackUser(createSlackObject(message));
            let errMessage = yield app.skipToNextSong(user);
            if (!_.isNil(errMessage)) {
                bot.reply(message, errMessage);
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
            let loginMsg = `Login to Spotify to enable DJ-Bot! http://localhost:3001/login?user_uuid=${user['user_uuid']}`;
            bot.replyInteractive(message, loginMsg);
        });
    }
    function addSongToQueue(bot, message) {
        let userId = message['user'];
        let trackData = message['actions'][0];
        app.addToUserPlaylist(userId, trackData);
        bot.replyInteractive(message, 'Song added!');
    }
    function addDj(bot, message) {
        let user = createSlackObject(message);
        app.addDj(user);
        bot.reply(message, user.context.user.name + " has become a DJ");
    }
    function searchSongs(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = createSlackObject(message);
                let searchResults = yield app.searchSongs(user, message.text);
                let slicedResults = searchResults.tracks.items.slice(0, 5);
                slicedResults = _.map(slicedResults, (track) => {
                    return {
                        uri: track.uri,
                        name: track.name,
                        artwork: track.album.images[0].url,
                        artists: _.join(_.map(track.artists, 'name'), ', '),
                        id: track.id
                    };
                });
                let attachments = _.map(slicedResults, (track) => {
                    return generateAddTrackButton(track);
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
    function generateSpotifyLoginButton() {
        return {
            "text": "Login with spotify to enable DJ-Bot!",
            "attachments": [
                {
                    "fallback": "Unfortunately, you will not be able to listen to music without hooking up your Spotify",
                    "callback_id": "spotify_login",
                    "color": spotifyColor,
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "game",
                            "text": "Login",
                            "type": "button",
                            "value": "login"
                        }
                    ]
                }
            ]
        };
    }
    function generateAddTrackButton(track) {
        return {
            "fallback": "err dev didnt know what to put here",
            "color": spotifyColor,
            "author_name": track.artists,
            "title": track.name,
            "title_link": track.uri,
            "thumb_url": track.artwork,
            "callback_id": "add_song_to_queue",
            "actions": [
                {
                    "name": "add_song_to_queue",
                    "text": "Add to queue",
                    "style": "primary",
                    "type": "button",
                    "value": track.uri
                }
            ]
        };
    }
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVycy9zbGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUVuRCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUM7QUFFL0IsU0FBUyxJQUFJLENBQUMsR0FBRztJQUNiLG1HQUFtRztJQUNuRyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNuRCxJQUFJLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFDbEQsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUN2QixnQkFBZ0IsRUFBRTtZQUNkLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWE7U0FDakM7S0FDSixDQUFDLENBQUM7SUFDSCxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUVkLFVBQVUsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxHQUFHLEVBQUUsT0FBTztRQUNwRCw4Q0FBOEM7UUFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsa0ZBQWtGLENBQUMsQ0FBQTtJQUMxRyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sYUFBYSxHQUFHO1FBQ2xCLE9BQU8sRUFBRSxJQUFJO1FBQ2IsT0FBTyxFQUFFLFdBQVc7UUFDcEIsT0FBTyxFQUFFLFVBQVU7UUFDbkIsS0FBSyxFQUFFLEtBQUs7S0FDZixDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUc7UUFDbkIsZUFBZSxFQUFFLG1CQUFtQjtRQUNwQyxtQkFBbUIsRUFBRSxjQUFjO0tBQ3RDLENBQUM7SUFFRixVQUFVLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFnQixHQUFHLEVBQUUsT0FBTzs7WUFDdkQsSUFB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