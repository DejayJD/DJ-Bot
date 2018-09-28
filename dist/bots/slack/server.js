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
        };
    }
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2JvdHMvc2xhY2svc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0g7OztHQUdHO0FBRUgsU0FBUyxJQUFJLENBQUMsR0FBRztJQUNiLGtEQUFrRDtJQUNsRCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUV0RCxVQUFVLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87UUFDcEQsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsa0ZBQWtGLENBQUMsQ0FBQTtJQUMxRyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sYUFBYSxHQUFHO1FBQ2xCLE9BQU8sRUFBRSxJQUFJO0tBQ2hCLENBQUM7SUFDRixVQUFVLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ2pELElBQUk7WUFDQSxJQUFJLFFBQVEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDMUI7UUFDRCxPQUFPLENBQUMsRUFBRTtZQUNOLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLCtCQUErQixDQUFDLENBQUM7WUFDM0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBR0gsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxHQUFHLEVBQUUsT0FBTztRQUM5RCxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUdILElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUV2QixTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTztRQUN0QixJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7WUFDeEMsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMxRCxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQzNDO2FBQ0k7WUFDRCxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUM7U0FDM0Q7SUFDTCxDQUFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUk7UUFDeEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxRQUFRLEdBQUcsNEVBQTRFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQy9HLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFVBQVUsQ0FBQyxFQUFFLENBQUMsOEJBQThCLEVBQUUsVUFBVSxHQUFHLEVBQUUsT0FBTztRQUNoRSxJQUFJLE9BQU8sR0FBRztZQUNWLE9BQU8sRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzFDLE9BQU8sRUFBRTtnQkFDTCxJQUFJLEVBQUUsT0FBTztnQkFDYixJQUFJLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFFcEMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUM7YUFDdkM7U0FDSixDQUFDO1FBQ0YsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsMEJBQTBCO1FBQy9CLE9BQU87WUFDSCxNQUFNLEVBQUUsc0NBQXNDO1lBQzlDLGFBQWEsRUFBRTtnQkFDWDtvQkFDSSxVQUFVLEVBQUUsd0ZBQXdGO29CQUNwRyxhQUFhLEVBQUUsZUFBZTtvQkFDOUIsT0FBTyxFQUFFLFNBQVM7b0JBQ2xCLGlCQUFpQixFQUFFLFNBQVM7b0JBQzVCLFNBQVMsRUFBRTt3QkFDUDs0QkFDSSxNQUFNLEVBQUUsTUFBTTs0QkFDZCxNQUFNLEVBQUUsT0FBTzs0QkFDZixNQUFNLEVBQUUsUUFBUTs0QkFDaEIsT0FBTyxFQUFFLE9BQU87eUJBQ25CO3FCQUNKO2lCQUNKO2FBQ0o7U0FDSixDQUFBO0lBQ0wsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyJ9