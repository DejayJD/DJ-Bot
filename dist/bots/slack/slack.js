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
const ServiceManager_1 = require("../../app/services/ServiceManager");
const UserService_1 = require("../../app/services/UserService");
const spotifyColor = "#1DB954";
function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    let controller = require('../../../lib/bot_setup.js');
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
            let callback = slashCommands[message.command];
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
        if (userService.userIsLoggedIn(message['user_id'])) {
            let currentUser = app.getUserByUserId(message['user_id']);
            app.syncUser(currentUser['user_uuid']);
            bot.replyPrivate(message, "Syncing...");
        }
        else {
            bot.replyPrivate(message, generateSpotifyLoginButton());
        }
    }
    function getSlackUser(message) {
        let user, channel, team;
        try {
            user = message['raw_message']['user'];
            channel = message['raw_message']['channel'];
            team = message['raw_message']['team'];
        }
        catch (e) { }
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
    function skipToNext(bot, message) {
        let user = getSlackUser(message);
        app.skipToNextSong(user);
        bot.reply(message, 'Going to next song');
    }
    function getSpotifyLoginLink(bot, message) {
        let user = getSlackUser(message);
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
                    "style": "success",
                    "type": "button",
                    "value": track.uri
                }
            ]
        };
    }
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYm90cy9zbGFjay9zbGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBNEI7QUFDNUIsc0VBQTBEO0FBQzFELGdFQUEyRDtBQUMzRCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUM7QUFFL0IsU0FBUyxJQUFJLENBQUMsR0FBRztJQUNiLG1HQUFtRztJQUNuRyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUN0RCxJQUFJLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFFbEQsVUFBVSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ3BELDhDQUE4QztRQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxrRkFBa0YsQ0FBQyxDQUFBO0lBQzFHLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxhQUFhLEdBQUc7UUFDbEIsT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsV0FBVztRQUNwQixPQUFPLEVBQUUsVUFBVTtLQUN0QixDQUFDO0lBRUYsTUFBTSxjQUFjLEdBQUc7UUFDbkIsZUFBZSxFQUFDLG1CQUFtQjtRQUNuQyxtQkFBbUIsRUFBRSxjQUFjO0tBQ3RDLENBQUM7SUFFRixVQUFVLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ2pELElBQUk7WUFDQSxJQUFJLFFBQVEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDMUI7UUFDRCxPQUFPLENBQUMsRUFBRTtZQUNOLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGlEQUFpRCxDQUFD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