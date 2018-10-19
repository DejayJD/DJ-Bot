/**
 * Slack bot integration
 */
import * as _ from "lodash";
import {UserService} from "../services/UserService";
import {Service} from "../services/ServiceManager";
import {SlackMessages} from "../classes/SlackMessages";
import {App} from "../classes/App";


function init(app: App) {
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

    controller.hears('hello', 'direct_message', function (bot, message) {
        bot.reply(message, 'Hello!');
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
        "/dj-help": getHelpMessage,
        "/dj-suggestion": comingSoon,
        "/listening": getChannelListeners,
        "/logout": removeUser
    };

    const buttonCommands = {
        "spotify_login": getSpotifyLoginLink,
        "add_song_to_queue": addSongToQueue,
        "add_reaction": addReaction
    };

    const outgoingMessages = {
        "nowPlaying": displayNowPlaying
    };


    /*
        SLASH COMMANDS
     */
    controller.on('slash_command', async function (bot, message) {
        try {
            let userLoggedIn = await userService.userIsLoggedIn(createSlackObject(message), 'slack');
            let callback = userLoggedIn ? slashCommands[message.command] : requestLogin;
            callback(bot, message);
        }
        catch (e) {
            bot.replyPrivate(message, "Whoops, something went wrong with that command!");
            console.error('Unable to run slash command ' + message.command);
        }
    });

    async function sync(bot, message) {
        let user = userService.getSlackUser(createSlackObject(message));
        let channel = await app.getChannel(message);
        let result = await channel.syncUser(user);
        if (result === 'no-song') {
            bot.replyPrivate(message, "There are currently no songs playing. \nType /dj to get some tunes going!");
        }
        else if (result === 'syncing') {
            bot.replyPrivate(message, "Syncing you up...");
        }
        else {
            bot.replyPrivate(message, 'Whoops, something went wrong.');
        }
    }

    function getHelpMessage(bot, message) {
        bot.replyPrivate(message, SlackMessages.HelpMessage());
    }

    async function removeUser(bot, message) {
        let response = await app.removeUser(createSlackObject(message), message);
        bot.replyPrivate(message, "You have been logged out. Re-login to use DJ-Bot again");
    }

    function comingSoon(bot, message) {
        bot.replyPrivate(message, "That command is still in development and coming soon...");
    }

    async function stopUserListening(bot, message) {
        let result = await app.removeListener(createSlackObject(message), message);
        if (result === 'listener-doesnt-exist') {
            bot.replyPrivate(message, "You are not currently listening to music in this channel.");
        }
        else if (result === 'removed-listener') {
            bot.replyPrivate(message, "You are no longer listening to music in this channel");
        }
        else {
            bot.bot.replyPrivate(message, 'Whoops, something went wrong.');
        }
    }

    async function getChannelListeners(bot, message) {
        let channel = await app.getChannel(message);
        let listeners = _.map(await channel.getChannelListeners(), (listener) => {
            return SlackMessages.linkUsername(listener['username']);
        });
        if (listeners.length > 0) {
            bot.replyPrivate(message, "Listening right now: " + _.join(listeners, ', '));
        }
        else {
            bot.replyPrivate(message, "Nobody is currently synced to the channel");
        }
    }

    async function getPlaying(bot, message) {
        let channel = await app.getChannel(message);
        let result = channel.getCurrentSong();
        if (result === 'no-song-playing') {
            bot.replyPrivate(message, "There are currently no songs playing. \nType /dj to get some tunes going!");
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
        let channel = await app.getChannel(message);
        let result = await channel.getCurrentDjs();
        if (Array.isArray(result)) {
            if (result.length === 0) {
                bot.replyPrivate(message, 'There are currently no users in the DJ Queue. \nType /dj to become a DJ!');
            }
            else {
                let djNames = _.join(_.map(result, (dj) => {
                    return SlackMessages.linkUsername(dj.username);
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
            bot.replyPrivate(message, 'There are currently no users in the DJ Queue. \nType /dj to become a DJ!');
        }
        else {
            bot.reply(message, user.context.user.name + ' requested to skip to next song');
        }
    }

    async function addDj(bot, message) {
        let user = createSlackObject(message);
        let result = await app.addDj(user);
        if (result === 'added') {
            // await app.getUserChannel(user).syncUser(user);
            bot.reply(message, user.context.user.name + " has become a DJ");
        }
        else if (result === 'empty-playlist') {
            bot.replyPrivate(message, "You don't have any songs in your playlist. \nType /song to add some songs first!");
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
            if (searchResults.tracks.items.length === 0) {
                bot.replyPrivate(message, 'No results found :(');
            }
            else {
                let slicedResults = searchResults.tracks.items.slice(0, 5);
                slicedResults = _.map(slicedResults, (track) => {
                    return SlackMessages.parseTrack(track);
                });
                let attachments = _.map(slicedResults, (track) => {
                    return SlackMessages.AddTrackButton(track)
                });
                bot.replyPrivate(message, {'attachments': attachments});
            }
        }
        catch (e) {
            console.error(e);
            bot.replyPrivate(message, "Oops something went wrong");
        }
    }


    /*
        INTERACTIVE COMPONENTS
     */
    controller.on('interactive_message_callback', function (bot, message) {
        try {
            let callback = buttonCommands[message['callback_id']];
            callback(bot, message);
        }
        catch (e) {
            console.error('Unable to call interactive message with callback_id =' + message['callback_id']);
            bot.replyPrivate(message, "Oops something went wrong");
        }
    });

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

    async function addReaction(bot, message) {
        let reaction = message['actions'][0].value;
        let newMessage = message.original_message;
        let user = message.raw_message.user.id;
        let reactionMessage = SlackMessages.ReactionMessage(user, reaction, newMessage.attachments[1]);

        if (newMessage.attachments.length > 1) {
            newMessage.attachments[1] = reactionMessage;
        }
        else {
            newMessage.attachments.push(reactionMessage);
        }
        try {
            bot.replyInteractive(message, newMessage)
            // await bot.api.reactions.add(reaction);
        }
        catch (e) {
            console.error({message: 'Unable to add reaction line ', ...reaction});
            console.error(e);
        }
    }

    /*
       OUTGOING MESSAGES
    */
    app.outgoingMessages.subscribe(async (data) => {
        try {
            let callback = outgoingMessages[data['type']];
            callback(webhookBot, data);
        }
        catch (e) {
            console.error('Unable to send outgoing message of type' + data['type']);
            console.error(e);
        }
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

    /*
        HELPER FUNCTIONS
     */

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