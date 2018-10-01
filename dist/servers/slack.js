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
    controller.on('bot_channel_join', function (bot, message) {
        //TODO: Create channel if not already existing
        bot.reply(message, "Lets get some tunes going!\nNeed some help getting some bangers going? Try /help");
    });
    const slashCommands = {
        "/sync": sync,
        "/song": searchSongs,
        "/skip": skipToNext
    };
    const buttonCommands = {
        "spotify_login": getSpotifyLoginLink,
        "add_song_to_queue": addSongToQueue
    };
    controller.on('slash_command', function (bot, message) {
        try {
            let userLoggedIn = userService.userIsLoggedIn(createSlackObject(message), 'slack');
            let callback = userLoggedIn ? slashCommands[message.command] : requestLogin;
            callback(bot, message);
        }
        catch (e) {
            bot.replyPrivate(message, "Whoops, something went wrong with that command!");
            console.error(e);
        }
    });
    controller.hears('hello', 'direct_message', function (bot, message) {
        bot.reply(message, 'Hello!');
    });
    function sync(bot, message) {
        //TODO: Test this
        let user = userService.getSlackUser(createSlackObject(message));
        app.getUserChannel.syncUser(user);
        bot.replyPrivate("Syncing you up...");
    }
    function requestLogin(bot, message) {
        bot.replyPrivate(message, generateSpotifyLoginButton());
    }
    function skipToNext(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        app.skipToNextSong(user);
        bot.reply(message, user.context.user.name + ' requested to skip to next song');
    }
    function getSpotifyLoginLink(bot, message) {
        let user = createSlackObject(message);
        user = app.loginUser(user);
        let loginMsg = `Login to Spotify to enable DJ-Bot! http://localhost:3001/login?user_uuid=${user['user_uuid']}`;
        bot.replyInteractive(message, loginMsg);
    }
    function addSongToQueue(bot, message) {
        let userId = message['user'];
        let trackData = message['actions'][0];
        app.addToUserPlaylist(userId, trackData);
    }
    function searchSongs(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchResults = yield app.searchSongs(message.text);
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
                name: message['raw_message']['team_name']
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVycy9zbGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUVuRCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUM7QUFFL0IsU0FBUyxJQUFJLENBQUMsR0FBRztJQUNiLG1HQUFtRztJQUNuRyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNuRCxJQUFJLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFFbEQsVUFBVSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ3BELDhDQUE4QztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxrRkFBa0YsQ0FBQyxDQUFBO0lBQzFHLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxhQUFhLEdBQUc7UUFDbEIsT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsV0FBVztRQUNwQixPQUFPLEVBQUUsVUFBVTtLQUN0QixDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUc7UUFDbkIsZUFBZSxFQUFFLG1CQUFtQjtRQUNwQyxtQkFBbUIsRUFBRSxjQUFjO0tBQ3RDLENBQUM7SUFFRixVQUFVLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ2pELElBQUk7WUFDQSxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25GLElBQUksUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxD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