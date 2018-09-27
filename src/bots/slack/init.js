/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

const _ = require('lodash');

function init(app) {
    function onInstallation(bot, installer) {
        if (installer) {
            bot.startPrivateConversation({user: installer}, function (err, convo) {
                if (err) {
                    console.log(err);
                } else {
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
            storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
        };
    } else {
        config = {
            json_file_store: ((process.env.TOKEN) ? './db_slack_bot_ci/' : './db_slack_bot_a/'), //use a different name if an app or CI
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
    } else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
        //Treat this as an app
        let app = require('./lib/apps');
        var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
    } else {
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
        bot.reply(message, "Lets get some tunes going!\nNeed some help getting some bangers going? Try /help")
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
        }
    }
}

module.exports = init;