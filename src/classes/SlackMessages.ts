import * as _ from "lodash";

export class SlackMessages {
    static spotifyColor = "#1DB954";

    static NowPlayingMessage(track, user) {
        return {
            "text": `Now Playing *${track.name}* queued by <@${user.context.user.name}>`,
            "attachments": [{
                "fallback": "Now Playing " + track.name,
                "color": this.spotifyColor,
                "author_name": track.artists,
                "title": track.name,
                "title_link": track.uri,
                "thumb_url": track.artwork
            }]
        }
    }

    static linkUsername(username) {
        return '<@'+ username + '>';
    }

    static parseTrack(track) {
        return {
            uri: track.uri,
            name: track.name,
            artwork: track.album.images[0].url,
            artists: _.join(_.map(track.artists, 'name'), ', '),
            id: track.id
        }
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
        }
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
        }
    }
}
