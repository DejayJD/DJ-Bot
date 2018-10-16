/**
 * Slack bot integration
 */
import * as _ from "lodash";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";
import {SlackMessages} from "../classes/SlackMessages";


function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    const controller = require('../../lib/bot_setup.js');
    const userService = Service.getService(UserService);
    const webhookBot = controller.spawn({
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
        "/dj": addDj,
        "/stepdown": stepDownDj,
        "/stop": stopUserListening,
        "/djs": getDjList,
        "/playing": getPlaying,
        "/dj-help": comingSoon,
        "/dj-suggestion":comingSoon,
        "/listening":getChannelListeners
    };

    const buttonCommands = {
        "spotify_login": getSpotifyLoginLink,
        "add_song_to_queue": addSongToQueue
    };

    const outgoingMessages = {
        "nowPlaying": displayNowPlaying
    };

    app.outgoingMessages.subscribe(async (data) => {
        try {
            let callback = outgoingMessages[data['type']];
            callback(webhookBot, data);
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
        bot.sendWebhook(
            {
                ...SlackMessages.NowPlayingMessage(SlackMessages.parseTrack(data.data), data.user),
                channel: data.channel,
            },
            function (err, res) {
            }
        );
    }

    async function sync(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        let result = await app.getUserChannel(user).syncUser(user);
        if (result === 'no-song') {
            bot.replyPrivate(message, "There are currently no songs playing. Type /dj to get some tunes going!");
        }
        else if (result === 'syncing') {
            bot.replyPrivate(message, "Syncing you up...");
        }
        else {
            bot.replyPrivate(message, 'Whoops, something went wrong.');
        }
    }

    function comingSoon(bot, message) {
        bot.replyPrivate(message, "That command is still in development and coming soon...");
    }

    async function stopUserListening(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        let result = await app.getUserChannel(user).removeListener(user);
        if (result === 'listener-doesnt-exist') {
            bot.replyPrivate(message, "You are not currently sync-ing up music.");
        }
        else if (result === 'removed-listener') {
            bot.replyPrivate(message, "You are no longer sync-ing music");
        }
        else {
            bot.replyPrivate(message, 'Whoops, something went wrong.');
        }
    }

    async function getChannelListeners(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        console.log(message);
        let channel = await app.getUserChannel(user);
        console.log(channel);
    }

    async function getPlaying(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        let channel = await app.getUserChannel(user);
        let result = channel.getCurrentSong();
        if (result === 'no-song-playing') {
            bot.replyPrivate(message, "There are currently no songs playing. Type /dj to get some tunes going!");
        }
        else if (typeof result === 'object') {
            if (!_.isNil(result.track.track_data)) {
                bot.replyPrivate(message, SlackMessages.NowPlayingMessage(SlackMessages.parseTrack(result.track.track_data), result.user))
            }
            else {
                bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        }
        else {
            bot.replyPrivate(message, 'Whoops, something went wrong.');
        }

    }

    async function getDjList(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        let channel = await app.getUserChannel(user);
        let result = await channel.getCurrentDjs();
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
    }

    function requestLogin(bot, message) {
        bot.replyPrivate(message, SlackMessages.SpotifyLoginButton());
    }

    async function skipToNext(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        let response = await app.skipToNextSong(user);
        if (response === 'no-dj') {
            bot.replyPrivate(message, 'There are currently no users in the DJ Queue. Type /dj to become a DJ!');
        }
        else {
            bot.reply(message, user.context.user.name + ' requested to skip to next song');
        }
    }

    async function getSpotifyLoginLink(bot, message) {
        let user = createSlackObject(message);
        user = await app.loginUser(user);
        let loginMsg = `Login to Spotify to enable DJ-Bot! ${process.env.SPOTIFY_LOGIN}?user_uuid=${user['user_uuid']}`;
        bot.replyInteractive(message, loginMsg);
    }

    function addSongToQueue(bot, message) {
        let user = createSlackObject(message);
        let trackData = message['actions'][0];
        app.addToUserPlaylist(user, trackData);
        bot.replyInteractive(message, 'Song added!')
    }

    async function addDj(bot, message) {
        let user = createSlackObject(message);
        let result = await app.addDj(user);
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
    }

    async function stepDownDj(bot, message) {
        let user = createSlackObject(message);
        let result = await app.removeDj(user);
        if (result === 'removed') {
            bot.reply(message, user.context.user.name + " has stopped being a DJ");
        }
        else if (result === 'doesnt-exist') {
            bot.replyPrivate(message, "You are not currently a DJ");
        }
        else {
            bot.replyPrivate(message, 'Whoops, something went wrong while removing you as a dj');
        }
    }

    async function searchSongs(bot, message) {
        try {
            let user = createSlackObject(message);
            let searchResults = await app.searchSongs(user, message.text);
            let slicedResults = searchResults.tracks.items.slice(0, 5);
            slicedResults = _.map(slicedResults, (track) => {
                return SlackMessages.parseTrack(track);
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