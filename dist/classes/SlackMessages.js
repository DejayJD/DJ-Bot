"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class SlackMessages {
    static NowPlayingMessage(track, user) {
        return {
            "text": `Now Playing *${track.name}* queued by <@${user.context.user.name}>`,
            "attachments": [{
                    "fallback": "Now Playing " + track.name,
                    "color": this.spotifyColor,
                    "author_name": track.artists,
                    "title": track.name,
                    "title_link": track.uri,
                    "thumb_url": track.artwork,
                    "callback_id": "add_reaction",
                    "actions": [
                        {
                            "name": "boo",
                            "text": "Boo",
                            "style": "danger",
                            "type": "button",
                            "value": 'thumbsdown'
                        },
                        {
                            "name": "nice",
                            "text": "Nice Play!",
                            "style": "primary",
                            "type": "button",
                            "value": 'thumbsup'
                        },
                    ]
                }]
        };
    }
    static HelpMessage() {
        return {
            "text": `Available Commands:
                /sync           : Sync up your Spotify with DJ Bot
                /stop           : Stop sync-ing your Spotify with DJ Bot
                /song           : Search for a song to add your queue
                /skip           : Skip to the next song in the queue
                /dj             : Become a DJ and play some tunes!
                /stepdown       : Stop being a DJ
                /djs            : See a list of who are currently DJs
                /listening      : See who is currently listening
                /playing        : See what song is currently playing
                /dj-bot-feedback: Let the developers know any feedback or ideas you have
                /dj-help        : See this message 
                
            `
        };
    }
    static ReactionMessage(username, reaction, existingMessage = null) {
        let messageText = this.linkUsername(username) + ' - ' + this.reaction(reaction);
        if (!_.isNil(existingMessage)) {
            if (existingMessage.text.match(messageText)) { //User's reaction is already present
                return existingMessage;
            }
            existingMessage.text += ', ' + messageText;
            return existingMessage;
        }
        return {
            text: messageText,
            color: this.spotifyColor
        };
    }
    static linkUsername(username) {
        return '<@' + username + '>';
    }
    static reaction(reactionType) {
        return ":" + reactionType + ":";
    }
    static parseTrack(track) {
        return {
            uri: track.uri,
            name: track.name,
            artwork: track.album.images[0].url,
            artists: _.join(_.map(track.artists, 'name'), ', '),
            id: track.id
        };
    }
    static AddTrackButton(track) {
        return {
            "fallback": "Song results found",
            "color": this.spotifyColor,
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
        };
    }
    static SpotifyLoginButton() {
        return {
            "text": "Login with spotify to enable DJ-Bot!",
            "attachments": [
                {
                    "fallback": "Unfortunately, you will not be able to listen to music without hooking up your Spotify",
                    "callback_id": "spotify_login",
                    "color": this.spotifyColor,
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
SlackMessages.spotifyColor = "#1DB954";
exports.SlackMessages = SlackMessages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xhY2tNZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL1NsYWNrTWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBNEI7QUFFNUIsTUFBYSxhQUFhO0lBR3RCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSTtRQUNoQyxPQUFPO1lBQ0gsTUFBTSxFQUFFLGdCQUFnQixLQUFLLENBQUMsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHO1lBQzVFLGFBQWEsRUFBRSxDQUFDO29CQUNaLFVBQVUsRUFBRSxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUk7b0JBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPO29CQUM1QixPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUk7b0JBQ25CLFlBQVksRUFBRSxLQUFLLENBQUMsR0FBRztvQkFDdkIsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO29CQUMxQixhQUFhLEVBQUUsY0FBYztvQkFDN0IsU0FBUyxFQUFFO3dCQUNQOzRCQUNJLE1BQU0sRUFBRSxLQUFLOzRCQUNiLE1BQU0sRUFBRSxLQUFLOzRCQUNiLE9BQU8sRUFBRSxRQUFROzRCQUNqQixNQUFNLEVBQUUsUUFBUTs0QkFDaEIsT0FBTyxFQUFFLFlBQVk7eUJBQ3hCO3dCQUNEOzRCQUNJLE1BQU0sRUFBRSxNQUFNOzRCQUNkLE1BQU0sRUFBRSxZQUFZOzRCQUNwQixPQUFPLEVBQUUsU0FBUzs0QkFDbEIsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLE9BQU8sRUFBRSxVQUFVO3lCQUN0QjtxQkFDSjtpQkFDSixDQUFDO1NBQ0wsQ0FBQTtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVztRQUNkLE9BQU87WUFDSCxNQUFNLEVBQUM7Ozs7Ozs7Ozs7Ozs7YUFhTjtTQUNK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