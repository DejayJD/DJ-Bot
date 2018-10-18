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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xhY2tNZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL1NsYWNrTWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBNEI7QUFFNUIsTUFBYSxhQUFhO0lBR3RCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSTtRQUNoQyxPQUFPO1lBQ0gsTUFBTSxFQUFFLGdCQUFnQixLQUFLLENBQUMsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHO1lBQzVFLGFBQWEsRUFBRSxDQUFDO29CQUNaLFVBQVUsRUFBRSxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUk7b0JBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPO29CQUM1QixPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUk7b0JBQ25CLFlBQVksRUFBRSxLQUFLLENBQUMsR0FBRztvQkFDdkIsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO29CQUMxQixhQUFhLEVBQUUsY0FBYztvQkFDN0IsU0FBUyxFQUFFO3dCQUNQOzRCQUNJLE1BQU0sRUFBRSxLQUFLOzRCQUNiLE1BQU0sRUFBRSxLQUFLOzRCQUNiLE9BQU8sRUFBRSxRQUFROzRCQUNqQixNQUFNLEVBQUUsUUFBUTs0QkFDaEIsT0FBTyxFQUFFLFlBQVk7eUJBQ3hCO3dCQUNEOzRCQUNJLE1BQU0sRUFBRSxNQUFNOzRCQUNkLE1BQU0sRUFBRSxZQUFZOzRCQUNwQixPQUFPLEVBQUUsU0FBUzs0QkFDbEIsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLE9BQU8sRUFBRSxVQUFVO3lCQUN0QjtxQkFDSjtpQkFDSixDQUFDO1NBQ0wsQ0FBQTtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsZUFBZSxHQUFHLElBQUk7UUFDN0Qs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