/**
 * Slack bot integration
 */
import * as _ from "lodash";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";

const spotifyColor = "#1DB954";

function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    let controller = require('../../lib/bot_setup.js');
    let userService = Service.getService(UserService);

    controller.on('bot_channel_join', function (bot, message) {
        //TODO: Create channel if not already existing
        bot.reply(message, "Lets get some tunes going!\nNeed some help getting some bangers going? Try /help")
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

    async function searchSongs(bot, message) {
        try {
            let searchResults = await app.searchSongs(message.text);
            let slicedResults = searchResults.tracks.items.slice(0, 5);
            slicedResults = _.map(slicedResults, (track) => {
                return {
                    uri: track.uri,
                    name: track.name,
                    artwork: track.album.images[0].url,
                    artists: _.join(_.map(track.artists, 'name'), ', '),
                    id: track.id
                }
            });
            let attachments = _.map(slicedResults, (track) => {
                return generateAddTrackButton(track)
            });
            bot.replyPrivate(message, {'attachments': attachments});
        }
        catch (e) {
            console.error(e);
            bot.replyPrivate(message, "Oops something went wrong");
        }
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
        } catch (e) {
        }
        if (user == null) {
            user = {
                id: message['raw_message']['user_id'],
                name: message['raw_message']['user_name']
            }
        }
        if (channel == null) {
            channel = {
                id: message['raw_message']['channel_id'],
                name: message['raw_message']['channel_name']
            }
        }
        if (team == null) {
            team = {
                id: message['raw_message']['team_id'],
                name: message['raw_message']['team_name']
            }
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
        }
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
        }
    }
}

module.exports = init;