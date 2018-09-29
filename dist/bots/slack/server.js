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
const spotifyColor = "#1DB954";
function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    let controller = require('../../../lib/bot_setup.js');
    controller.on('bot_channel_join', function (bot, message) {
        //TODO: Create channel in app
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
        if (app.userIsLoggedIn(message['user_id'])) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2JvdHMvc2xhY2svc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7R0FFRztBQUNILDRCQUE0QjtBQUM1QixNQUFNLFlBQVksR0FBRyxTQUFTLENBQUM7QUFFL0IsU0FBUyxJQUFJLENBQUMsR0FBRztJQUNiLG1HQUFtRztJQUNuRyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUV0RCxVQUFVLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87UUFDcEQsNkJBQTZCO1FBQzdCLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGtGQUFrRixDQUFDLENBQUE7SUFDMUcsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLGFBQWEsR0FBRztRQUNsQixPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLE9BQU8sRUFBRSxVQUFVO0tBQ3RCLENBQUM7SUFFRixNQUFNLGNBQWMsR0FBRztRQUNuQixlQUFlLEVBQUMsbUJBQW1CO1FBQ25DLG1CQUFtQixFQUFFLGNBQWM7S0FDdEMsQ0FBQztJQUVGLFVBQVUsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87UUFDakQsSUFBSTtZQUNBLElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMxQjtRQUNELE9BQU8sQ0FBQyxFQUFFO1lBQ04sR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsaURBQWlELENBQUMsQ0FBQztZQUM3RSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQzlELEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU87UUFDdEIsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO1lBQ3hDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN2QyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztTQUMzQzthQUNJO1lBQ0QsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDO1NBQzNEO0lBQ0wsQ0FBQztJQUVELFNBQVMsWUFBWSxDQUFDLE9BQU87UUFDekIsSUFBSSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztRQUN4QixJQUFJO1lBQ0EsSUFBSSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVDLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekM7UUFBQyxPQUFNLENBQUMsRUFBRSxHQUFFO1FBQ2IsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2QsSUFBSSxHQUFHO2dCQUNILEVBQUUsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUNyQyxJQUFJLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFdBQVcsQ0FBQzthQUM1QyxDQUFBO1NBQ0o7UUFDRCxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDakIsT0FBTyxHQUFHO2dCQUNOLEVBQUUsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsWUFBWSxDQUFDO2dCQUN4QyxJQUFJLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQzthQUMvQyxDQUFBO1NBQ0o7UUFDRCxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDZCxJQUFJLEdBQUc7Z0JBQ0gsRUFBRSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQ3JDLElBQUksRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxDQUFDO2FBQzVDLENBQUE7U0FDSjtRQUNELE9BQU87WUFDSCxPQUFPLEVBQUUsT0FBTztZQUNoQixPQUFPLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLElBQUk7Z0JBRVYsSUFBSSxFQUFFLElBQUk7YUFDYjtTQUNKLENBQUM7SUFDTixDQUFDO0lBRUQsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLE9BQU87UUFDNUIsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsU0FBUyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsT0FBTztRQUNyQyxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxRQUFRLEdBQUcsNEVBQTRFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQy9HLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRSxPQUFPO1FBQ2hDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsU0FBZSxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU87O1lBQ25DLElBQUk7Z0JBQ0EsSUFBSSxhQUFhLEdBQUcsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxhQUFhLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0QsYUFBYSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQzNDLE9BQU87d0JBQ0gsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO3dCQUNkLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTt3QkFDaEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7d0JBQ2xDLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUM7d0JBQ25ELEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtxQkFDZixDQUFBO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQzdDLE9BQU8sc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFDO2dCQUNILEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFDLEVBQUMsYUFBYSxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7YUFDekQ7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO2FBQzFEO1FBQ0wsQ0FBQztLQUFBO0lBRUQsVUFBVSxDQUFDLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ2hFLElBQUksUUFBUSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUN0RCxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUywwQkFBMEI7UUFDL0IsT0FBTztZQUNILE1BQU0sRUFBRSxzQ0FBc0M7WUFDOUMsYUFBYSxFQUFFO2dCQUNYO29CQUNJLFVBQVUsRUFBRSx3RkFBd0Y7b0JBQ3BHLGFBQWEsRUFBRSxlQUFlO29CQUM5QixPQUFPLEVBQUUsWUFBWTtvQkFDckIsaUJBQWlCLEVBQUUsU0FBUztvQkFDNUIsU0FBUyxFQUFFO3dCQUNQOzRCQUNJLE1BQU0sRUFBRSxNQUFNOzRCQUNkLE1BQU0sRUFBRSxPQUFPOzRCQUNmLE1BQU0sRUFBRSxRQUFROzRCQUNoQixPQUFPLEVBQUUsT0FBTzt5QkFDbkI7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUE7SUFDTCxDQUFDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxLQUFLO1FBQ2pDLE9BQU87WUFDSCxVQUFVLEVBQUUscUNBQXFDO1lBQ2pELE9BQU8sRUFBRSxZQUFZO1lBQ3JCLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTztZQUM1QixPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDbkIsWUFBWSxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ3ZCLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTztZQUMxQixhQUFhLEVBQUUsbUJBQW1CO1lBQ2xDLFNBQVMsRUFBRTtnQkFDUDtvQkFDSSxNQUFNLEVBQUUsbUJBQW1CO29CQUMzQixNQUFNLEVBQUUsY0FBYztvQkFDdEIsT0FBTyxFQUFFLFNBQVM7b0JBQ2xCLE1BQU0sRUFBRSxRQUFRO29CQUNoQixPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUc7aUJBQ3JCO2FBQ0o7U0FDSixDQUFBO0lBQ0wsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyJ9