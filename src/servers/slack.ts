/**
 * Slack bot integration
 */
import * as _ from "lodash";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";
import {SlackMessages} from "../classes/SlackMessages";


function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    let controller = require('../../lib/bot_setup.js');
    let userService = Service.getService(UserService);
    let bot = controller.spawn({
        incoming_webhook: {
            url: process.env.SLACK_WEBHOOK
        }
    });


    controller.on('bot_channel_join', function (bot, message) {
        //TODO: Create channel if not already existing
        bot.reply(message, "Lets get some tunes going!\nNeed some help getting some bangers going? Try /help")
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

    const outgoingMessages = {
        "nowPlaying":displayNowPlaying
    };

    app.outgoingMessages.subscribe(async (data)=>{
        try {
            let callback = outgoingMessages[data['type']];
            callback(bot, data['data']);
        }
        catch (e) {
            console.error('Unable to send outgoing message!');
            console.error(e);
        }
    });

    controller.on('slash_command', async function (bot, message) {
        try {
            let userLoggedIn = await userService.userIsLoggedIn(createSlackObject(message), 'slack');
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


    function displayNowPlaying(bot, data) {
        bot.sendWebhook(SlackMessages.NowPlayingMessage(data), function (err, res) {
        });
    }


    function sync(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        app.getUserChannel.syncUser(user);
        bot.replyPrivate("Syncing you up...");
    }

    function requestLogin(bot, message) {
        bot.replyPrivate(message, SlackMessages.SpotifyLoginButton());
    }

    async function skipToNext(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        let errMessage = await app.skipToNextSong(user);
        if (!_.isNil(errMessage)) {
            bot.reply(message, errMessage);
        }
        else {
            bot.reply(message, user.context.user.name + ' requested to skip to next song');
        }

    }

    async function getSpotifyLoginLink(bot, message) {
        let user = createSlackObject(message);
        user = await app.loginUser(user);
        let loginMsg = `Login to Spotify to enable DJ-Bot! http://localhost:3001/login?user_uuid=${user['user_uuid']}`;
        bot.replyInteractive(message, loginMsg);
    }

    function addSongToQueue(bot, message) {
        let userId = message['user'];
        let trackData = message['actions'][0];
        app.addToUserPlaylist(userId, trackData);
        bot.replyInteractive(message, 'Song added!')
    }

    function addDj(bot, message) {
        let user = createSlackObject(message);
        app.addDj(user);
        bot.reply(message, user.context.user.name + " has become a DJ");
    }

    async function searchSongs(bot, message) {
        try {
            let user = createSlackObject(message);
            let searchResults = await app.searchSongs(user, message.text);
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
                return SlackMessages.AddTrackButton(track)
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
                domain: message['raw_message']['team_domain']
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
}

module.exports = init;