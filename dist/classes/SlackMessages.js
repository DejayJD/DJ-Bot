"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class SlackMessages {
    static NowPlayingMessage(track, user) {
        return {
            "text": `Now Playing *${track.name}* requested by <@${user.context.user.name}>`,
            "attachments": [{
                    "fallback": "Now Playing " + track.name,
                    "color": this.spotifyColor,
                    "author_name": track.artists,
                    "title": track.name,
                    "title_link": track.uri,
                    "thumb_url": track.artwork
                }]
        };
    }
    static linkUsername(username) {
        return '<@' + username + '>';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xhY2tNZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL1NsYWNrTWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBNEI7QUFFNUIsTUFBYSxhQUFhO0lBR3RCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSTtRQUNoQyxPQUFPO1lBQ0gsTUFBTSxFQUFFLGdCQUFnQixLQUFLLENBQUMsSUFBSSxvQkFBb0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHO1lBQy9FLGFBQWEsRUFBRSxDQUFDO29CQUNaLFVBQVUsRUFBRSxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUk7b0JBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPO29CQUM1QixPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUk7b0JBQ25CLFlBQVksRUFBRSxLQUFLLENBQUMsR0FBRztvQkFDdkIsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO2lCQUM3QixDQUFDO1NBQ0wsQ0FBQTtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVE7UUFDeEIsT0FBTyxJQUFJLEdBQUUsUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUNoQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLO1FBQ25CLE9BQU87WUFDSCxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDZCxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDaEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7WUFDbEMsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQztZQUNuRCxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7U0FDZixDQUFBO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSztRQUN2QixPQUFPO1lBQ0gsVUFBVSxFQUFFLG9CQUFvQjtZQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDMUIsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQzVCLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNuQixZQUFZLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDdkIsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQzFCLGFBQWEsRUFBRSxtQkFBbUI7WUFDbEMsU0FBUyxFQUFFO2dCQUNQO29CQUNJLE1BQU0sRUFBRSxtQkFBbUI7b0JBQzNCLE1BQU0sRUFBRSxjQUFjO29CQUN0QixPQUFPLEVBQUUsU0FBUztvQkFDbEIsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLE9BQU8sRUFBRSxLQUFLLENBQUMsR0FBRztpQkFDckI7YUFDSjtTQUNKLENBQUE7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLGtCQUFrQjtRQUNyQixPQUFPO1lBQ0gsTUFBTSxFQUFFLHNDQUFzQztZQUM5QyxhQUFhLEVBQUU7Z0JBQ1g7b0JBQ0ksVUFBVSxFQUFFLHdGQUF3RjtvQkFDcEcsYUFBYSxFQUFFLGVBQWU7b0JBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsaUJBQWlCLEVBQUUsU0FBUztvQkFDNUIsU0FBUyxFQUFFO3dCQUNQOzRCQUNJLE1BQU0sRUFBRSxNQUFNOzRCQUNkLE1BQU0sRUFBRSxPQUFPOzRCQUNmLE1BQU0sRUFBRSxRQUFROzRCQUNoQixPQUFPLEVBQUUsT0FBTzt5QkFDbkI7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUE7SUFDTCxDQUFDOztBQXZFTSwwQkFBWSxHQUFHLFNBQVMsQ0FBQztBQURwQyxzQ0F5RUMifQ==