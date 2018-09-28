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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ib3RzL3NsYWNrL2luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSDs7O0dBR0c7QUFFSCxTQUFTLElBQUksQ0FBQyxHQUFHO0lBQ2Isa0RBQWtEO0lBQ2xELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBRXRELFVBQVUsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxHQUFHLEVBQUUsT0FBTztRQUNwRCxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxrRkFBa0YsQ0FBQyxDQUFBO0lBQzFHLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxhQUFhLEdBQUc7UUFDbEIsT0FBTyxFQUFFLElBQUk7S0FDaEIsQ0FBQztJQUNGLFVBQVUsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87UUFDakQsSUFBSTtZQUNBLElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUMxQjtRQUNELE9BQU8sQ0FBQyxFQUFFO1lBQ04sR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsK0JBQStCLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFHSCxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQzlELEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBR0gsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBRXZCLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPO1FBQ3RCLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRTtZQUN4QyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzFELEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDdkMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDM0M7YUFDSTtZQUNELEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLDBCQUEwQixFQUFFLENBQUMsQ0FBQztTQUMzRDtJQUNMLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSTtRQUN4QyxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLFFBQVEsR0FBRyw0RUFBNEUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDL0csR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsVUFBVSxDQUFDLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO1FBQ2hFLElBQUksT0FBTyxHQUFHO1lBQ1YsT0FBTyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDMUMsT0FBTyxFQUFFO2dCQUNMLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUVwQyxJQUFJLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQzthQUN2QztTQUNKLENBQUM7UUFDRixnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUywwQkFBMEI7UUFDL0IsT0FBTztZQUNILE1BQU0sRUFBRSxzQ0FBc0M7WUFDOUMsYUFBYSxFQUFFO2dCQUNYO29CQUNJLFVBQVUsRUFBRSx3RkFBd0Y7b0JBQ3BHLGFBQWEsRUFBRSxlQUFlO29CQUM5QixPQUFPLEVBQUUsU0FBUztvQkFDbEIsaUJBQWlCLEVBQUUsU0FBUztvQkFDNUIsU0FBUyxFQUFFO3dCQUNQOzRCQUNJLE1BQU0sRUFBRSxNQUFNOzRCQUNkLE1BQU0sRUFBRSxPQUFPOzRCQUNmLE1BQU0sRUFBRSxRQUFROzRCQUNoQixPQUFPLEVBQUUsT0FBTzt5QkFDbkI7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUE7SUFDTCxDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDIn0=