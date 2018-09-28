/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function init(app) {
    //I abstracted all the setup code out of this file
    let controller = require('../../../lib/bot_setup.js');

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
            app.syncUser(currentUser['user_uuid']);
            bot.replyPrivate(message, "Syncing...");
        }
        else {
            bot.replyPrivate(message, generateSpotifyLoginButton());
        }
    }

    function loginInteractive(bot, message, user) {
        user = app.loginUser(user);
        let loginMsg = `Login to Spotify to enable DJ-Bot! http://localhost:3001/login?user_uuid=${user['user_uuid']}`;
        bot.replyInteractive(message, loginMsg);
    }

    controller.on('interactive_message_callback', function (bot, message) {
        let newUser = {
            channel: message['raw_message']['channel'],
            context: {
                type: 'slack',
                user: message['raw_message']['user'],

                team: message['raw_message']['team'],
            }
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