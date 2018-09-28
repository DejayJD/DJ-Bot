"use strict";
/**
 * A Bot for Slack!
 */
Object.defineProperty(exports, "__esModule", { value: true });
function init(app) {
    function onInstallation(bot, installer) {
        if (installer) {
            bot.startPrivateConversation({ user: installer }, function (err, convo) {
                if (err) {
                    console.log(err);
                }
                else {
                    convo.say('I am a bots that has just joined your team');
                    convo.say('You must now /invite me to a channel so that I can be of use!');
                }
            });
        }
    }
    /**
     * Configure the persistence options
     */
    var config = {};
    if (process.env.MONGOLAB_URI) {
        var BotkitStorage = require('botkit-storage-mongo');
        config = {
            storage: BotkitStorage({ mongoUri: process.env.MONGOLAB_URI }),
        };
    }
    else {
        config = {
            json_file_store: ((process.env.TOKEN) ? './db_slack_bot_ci/' : './db_slack_bot_a/'),
        };
    }
    /**
     * Are being run as an app or a custom integration? The initialization will differ, depending
     */
    if (process.env.TOKEN || process.env.SLACK_TOKEN) {
        //Treat this as a custom integration
        var customIntegration = require('./lib/custom_integrations');
        var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
        var controller = customIntegration.configure(token, config, onInstallation);
    }
    else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
        //Treat this as an app
        let app = require('../../../lib/apps');
        var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
    }
    else {
        console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
        process.exit(1);
    }
    /**
     * A demonstration for how to handle websocket events. In this case, just log when we have and have not
     * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
     * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
     * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
     *
     * TODO: fixed b0rked reconnect behavior
     */
    // Handle events related to the websocket connection to Slack
    controller.on('rtm_open', function (bot) {
        console.log('** The RTM api just connected!');
    });
    controller.on('rtm_close', function (bot) {
        console.log('** The RTM api just closed');
        // you may want to attempt to re-open
    });
    /**
     * Core bots logic goes here!
     */
    // BEGIN EDITING HERE!
    controller.on('bot_channel_join', function (bot, message) {
        bot.reply(message, "Lets get some tunes going!\nNeed some help getting some bangers going? Try /help");
    });
    const slashCommands = {
        "/sync": sync
    };
    controller.on('slash_command', function (bot, message) {
        try {
            let callback = slashCommands[message.command];
            callback(bot, message);
        }
        catch (e) {
            bot.replyPrivate(message, "Whoops, something went wrong!");
            console.error(e);
        }
    });
    controller.hears('hello', 'direct_message', function (bot, message) {
        bot.reply(message, 'Hello!');
    });
    let loggedInUsers = [];
    function sync(bot, message) {
        if (app.userIsLoggedIn(message['user_id'])) {
            let currentUser = app.getUserByUserId(message['user_id']);
            app.syncUser(currentUser['user_token']);
            bot.replyPrivate(message, "Syncing...");
        }
        else {
            bot.replyPrivate(message, generateSpotifyLoginButton());
        }
    }
    function loginInteractive(bot, message, user) {
        user = app.loginUser(user);
        let loginMsg = `Login to Spotify to enable DJ-Bot! http://localhost:3001/login?user_token=${user['user_token']}`;
        bot.replyInteractive(message, loginMsg);
    }
    controller.on('interactive_message_callback', function (bot, message) {
        let newUser = {
            user: message['raw_message']['user'],
            channel: message['raw_message']['channel'],
            team: message['raw_message']['team'],
            context: 'slack'
        };
        loginInteractive(bot, message, newUser);
    });
    function generateSpotifyLoginButton() {
        return {
            "text": "Login with spotify to enable DJ-Bot!",
            "attachments": [
                {
                    "fallback": "Unfortunately, you will not be able to listen to music without hooking up your Spotify",
                    "callback_id": "spotify_login",
                    "color": "#1DB954",
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
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ib3RzL3NsYWNrL2luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQVVILFNBQVMsSUFBSSxDQUFDLEdBQUc7SUFDYixTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsU0FBUztRQUNsQyxJQUFJLFNBQVMsRUFBRTtZQUNYLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRSxLQUFLO2dCQUNoRSxJQUFJLEdBQUcsRUFBRTtvQkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDSCxLQUFLLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7b0JBQ3hELEtBQUssQ0FBQyxHQUFHLENBQUMsK0RBQStELENBQUMsQ0FBQztpQkFDOUU7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUdEOztPQUVHO0lBRUgsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7UUFDMUIsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDcEQsTUFBTSxHQUFHO1lBQ0wsT0FBTyxFQUFFLGFBQWEsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBQyxDQUFDO1NBQy9ELENBQUM7S0FDTDtTQUFNO1FBQ0gsTUFBTSxHQUFHO1lBQ0wsZUFBZSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUM7U0FDdEYsQ0FBQztLQUNMO0lBRUQ7O09BRUc7SUFFSCxJQUFJLE9BQU8sQ0FBQyxH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