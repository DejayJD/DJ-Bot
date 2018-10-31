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
const ChannelService_1 = require("../services/ChannelService");
function init(app) {
    //I abstracted all the setup code out of this file, so that I can leave all the business logic here
    const controller = require('../../lib/bot_setup.js');
    const userService = ServiceManager_1.Service.getService(UserService_1.UserService);
    const channelService = ServiceManager_1.Service.getService(ChannelService_1.ChannelService);
    const webhookBot = controller.spawn({
        incoming_webhook: {
            url: process.env.SLACK_WEBHOOK
        }
    });
    controller.on('bot_channel_join', function (bot, message) {
        //TODO: Create channel if not already existing
        bot.reply(message, "Lets get some tunes going! Need some help using DJ-BOt? Try /dj-help");
    });
    controller.hears('hello', 'direct_message', function (bot, message) {
        bot.reply(message, 'Hello!');
    });
    const slashCommands = [
        { command: "/sync", callback: sync, channelConflict: true, loginRequired: true },
        { command: "/song", callback: searchSongs, channelConflict: true, loginRequired: true },
        { command: "/skip", callback: skipToNext, channelConflict: true, loginRequired: true },
        { command: "/dj", callback: addDj, channelConflict: true, loginRequired: true },
        { command: "/stepdown", callback: stepDownDj, loginRequired: true },
        { command: "/stop", callback: stopUserListening, loginRequired: true },
        { command: "/djs", callback: getDjList },
        { command: "/playing", callback: getPlaying },
        { command: "/dj-help", callback: getHelpMessage },
        { command: "/dj-suggestion", callback: comingSoon },
        { command: "/listening", callback: getChannelListeners },
        { command: "/logout", callback: removeUser, loginRequired: true }
    ];
    const buttonCommands = {
        "spotify_login": getSpotifyLoginLink,
        "add_song_to_queue": addSongToQueue,
        "add_reaction": addReaction,
        "switch_channels": switchChannels
    };
    const outgoingMessages = {
        "nowPlaying": displayNowPlaying
    };
    /*
        RTM Sockets - (User presence)
     */
    /*
        SLASH COMMANDS
     */
    controller.on('slash_command', function (bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (_.isNil(webhookBot.config.token)) {
                    webhookBot.config.token = bot.config.token;
                }
                let user = createSlackObject(message);
                let userLoggedIn = yield userService.userIsLoggedIn(user);
                let channelConflict = yield app.getUserChannelConflict(user);
                let slashCommand = _.find(slashCommands, (slash) => {
                    return slash.command == message.command;
                });
                let callback;
                if (!userLoggedIn && slashCommand.loginRequired) {
                    callback = requestLogin;
                }
                else if (channelConflict && slashCommand.channelConflict) {
                    SlackMessages_1.SlackMessages.botReply(bot, message, 'switch-channels', { action: slashCommand.callback.name });
                }
                else {
                    callback = slashCommand.callback;
                }
                callback(bot, message);
            }
            catch (e) {
                bot.replyPrivate(message, "Whoops, something went wrong with that command!");
                console.error('Unable to run slash command ' + message.command);
            }
        });
    });
    function sync(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = userService.getSlackUser(createSlackObject(message));
            let result = yield app.syncUser(user, message);
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
    function getHelpMessage(bot, message) {
        bot.replyPrivate(message, SlackMessages_1.SlackMessages.HelpMessage());
    }
    function removeUser(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield app.removeUser(createSlackObject(message), message);
            bot.replyPrivate(message, "You have been logged out. Re-login to use DJ-Bot again");
        });
    }
    function comingSoon(bot, message) {
        bot.replyPrivate(message, "That command is still in development and coming soon...");
    }
    function stopUserListening(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield app.removeListener(createSlackObject(message), message);
            if (result === 'listener-doesnt-exist') {
                bot.replyPrivate(message, "You are not currently listening to music in this channel.");
            }
            else if (result === 'removed-listener') {
                bot.replyPrivate(message, "You are no longer listening to music in this channel");
            }
            else {
                bot.bot.replyPrivate(message, 'Whoops, something went wrong.');
            }
        });
    }
    function getChannelListeners(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield app.getChannel(message);
            let listeners = _.map(yield channel.getChannelListeners(), (listener) => {
                if (!_.isNil(listener)) {
                    return SlackMessages_1.SlackMessages.linkUsername(listener['username']);
                }
            });
            if (listeners.length > 0) {
                bot.replyPrivate(message, "Listening right now: " + _.join(listeners, ', '));
            }
            else {
                bot.replyPrivate(message, "Nobody is currently synced to the channel");
            }
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
                        return SlackMessages_1.SlackMessages.linkUsername(dj.username);
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
    function addDj(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = createSlackObject(message);
            let result = yield app.addDj(user);
            SlackMessages_1.SlackMessages.botReply(bot, message, result, {
                username: user.context.user.name,
                action: "addDj"
            });
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
                if (searchResults.tracks.items.length === 0) {
                    bot.replyPrivate(message, 'No results found :(');
                }
                else {
                    let slicedResults = searchResults.tracks.items.slice(0, 5);
                    slicedResults = _.map(slicedResults, (track) => {
                        return SlackMessages_1.SlackMessages.parseTrack(track);
                    });
                    let attachments = _.map(slicedResults, (track) => {
                        return SlackMessages_1.SlackMessages.AddTrackButton(track);
                    });
                    bot.replyPrivate(message, { 'attachments': attachments });
                }
            }
            catch (e) {
                console.error(e);
                bot.replyPrivate(message, "Oops something went wrong");
            }
        });
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
    function addReaction(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let reaction = message['actions'][0].value;
            let newMessage = message.original_message;
            let user = message.raw_message.user.id;
            let reactionMessage = SlackMessages_1.SlackMessages.ReactionMessage(user, reaction, newMessage.attachments[1]);
            if (newMessage.attachments.length > 1) {
                newMessage.attachments[1] = reactionMessage;
            }
            else {
                newMessage.attachments.push(reactionMessage);
            }
            try {
                bot.replyInteractive(message, newMessage);
                // await bot.api.reactions.add(reaction);
            }
            catch (e) {
                console.error(Object.assign({ message: 'Unable to add reaction line ' }, reaction));
                console.error(e);
            }
        });
    }
    function switchChannels(bot, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let originalAction = message['actions'][0].value;
            yield app.switchUserChannel(createSlackObject(message), { channel_id: message.channel });
            let callback = eval(originalAction);
            try {
                yield callback(bot, message);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    /*
       OUTGOING MESSAGES
    */
    app.outgoingMessages.subscribe((data) => __awaiter(this, void 0, void 0, function* () {
        try {
            let callback = outgoingMessages[data['type']];
            callback(webhookBot, data);
        }
        catch (e) {
            console.error('Unable to send outgoing message of type' + data['type']);
            console.error(e);
        }
    }));
    function displayNowPlaying(bot, data) {
        return __awaiter(this, void 0, void 0, function* () {
            bot.api.chat.postMessage(Object.assign({}, SlackMessages_1.SlackMessages.NowPlayingMessage(SlackMessages_1.SlackMessages.parseTrack(data.data), data.user), { channel: '#' + data.channel, as_user: true }), function (err, res) {
                // console.log(err);
            });
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVycy9zbGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBNEI7QUFDNUIseURBQW9EO0FBQ3BELCtEQUFtRDtBQUNuRCw0REFBdUQ7QUFFdkQsK0RBQTBEO0FBRzFELFNBQVMsSUFBSSxDQUFDLEdBQVE7SUFDbEIsbUdBQW1HO0lBQ25HLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3JELE1BQU0sV0FBVyxHQUFpQix3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFDbEUsTUFBTSxjQUFjLEdBQW9CLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLENBQUMsQ0FBQztJQUMzRSxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQ2hDLGdCQUFnQixFQUFFO1lBQ2QsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYTtTQUNqQztLQUNKLENBQUMsQ0FBQztJQUVILFVBQVUsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxHQUFHLEVBQUUsT0FBTztRQUNwRCw4Q0FBOEM7UUFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsc0VBQXNFLENBQUMsQ0FBQTtJQUM5RixDQUFDLENBQUMsQ0FBQztJQUVILFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87UUFDOUQsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLGFBQWEsR0FBRztRQUNsQixFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGFBQWEs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