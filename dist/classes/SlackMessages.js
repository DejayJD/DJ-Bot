"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SlackMessages {
    static NowPlayingMessage(track) {
        return {
            "fallback": "Now Playing " + track.name,
            "color": this.spotifyColor,
            "author_name": track.artists,
            "title": track.name,
            "title_link": track.uri,
            "thumb_url": track.artwork
        };
    }
    static AddTrackButton(track) {
        return {
            "fallback": "err dev didnt know what to put here",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xhY2tNZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL1NsYWNrTWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFhLGFBQWE7SUFHdEIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUs7UUFDMUIsT0FBTztZQUNILFVBQVUsRUFBRSxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUk7WUFDdkMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO1lBQzFCLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTztZQUM1QixPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDbkIsWUFBWSxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ3ZCLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTztTQUM3QixDQUFBO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSztRQUN2QixPQUFPO1lBQ0gsVUFBVSxFQUFFLHFDQUFxQztZQUNqRCxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDMUIsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQzVCLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNuQixZQUFZLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDdkIsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQzFCLGFBQWEsRUFBRSxtQkFBbUI7WUFDbEMsU0FBUyxFQUFFO2dCQUNQO29CQUNJLE1BQU0sRUFBRSxtQkFBbUI7b0JBQzNCLE1BQU0sRUFBRSxjQUFjO29CQUN0QixPQUFPLEVBQUUsU0FBUztvQkFDbEIsTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLE9BQU8sRUFBRSxLQUFLLENBQUMsR0FBRztpQkFDckI7YUFDSjtTQUNKLENBQUE7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLGtCQUFrQjtRQUNyQixPQUFPO1lBQ0gsTUFBTSxFQUFFLHNDQUFzQztZQUM5QyxhQUFhLEVBQUU7Z0JBQ1g7b0JBQ0ksVUFBVSxFQUFFLHdGQUF3RjtvQkFDcEcsYUFBYSxFQUFFLGVBQWU7b0JBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDMUIsaUJBQWlCLEVBQUUsU0FBUztvQkFDNUIsU0FBUyxFQUFFO3dCQUNQOzRCQUNJLE1BQU0sRUFBRSxNQUFNOzRCQUNkLE1BQU0sRUFBRSxPQUFPOzRCQUNmLE1BQU0sRUFBRSxRQUFROzRCQUNoQixPQUFPLEVBQUUsT0FBTzt5QkFDbkI7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUE7SUFDTCxDQUFDOztBQXRETSwwQkFBWSxHQUFHLFNBQVMsQ0FBQztBQURwQyxzQ0F3REMifQ==