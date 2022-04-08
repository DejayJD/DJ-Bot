"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class SlackMessages {
    static getSongListMessage(tracks, actions = [], text = null) {
        let parsedTracks = _.map(tracks, (track) => {
            return this.parseTrack(track);
        });
        let songList = _.map(parsedTracks, (track) => {
            let trackView = this.getSongView(track);
            trackView['actions'] = this.getMessageActions(actions, track);
            return trackView;
        });
        return { text: text, "attachments": songList };
    }
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
                    "actions": this.getMessageActions(['bad-reaction', 'nice-reaction'])
                }]
        };
    }
    static HelpMessage() {
        return {
            "text": `
Available Commands:
/sync: Sync up your Spotify with DJ Bot
/stop: Stop sync-ing your Spotify with DJ Bot
/song: Search for a song to add your queue
/skip: Skip to the next song in the queue
/dj: Become a DJ and play some tunes!
/stepdown: Stop being a DJ
/djs: See a list of who are currently DJs
/listening: See who is currently listening
/playing: See what song is currently playing
/dj-bot-feedback: Let the developers know any feedback or ideas you have
/dj-help: See this message
/logout: Disconnect your Spotify from DJ-Bot`
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
    static getSongView(track) {
        return {
            "fallback": "Song results found",
            "color": this.spotifyColor,
            "author_name": track.artists,
            "title": track.name,
            "title_link": track.uri,
            "thumb_url": track.artwork,
            "callback_id": "add_song_to_queue"
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
                    "actions": this.getMessageActions(['login'])
                }
            ]
        };
    }
    static getBotReplyMessage(messageType, data) {
        const botResponse = {
            "song-list": {
                message: this.getSongListMessage(data, ['move-song-top'], 'Your upcoming songs:'),
                type: "private"
            },
            "added-dj": {
                message: `${this.linkUsername(data.username)} has become a DJ`,
                type: "public"
            },
            "empty-playlist": {
                message: "You don't have any songs in your playlist. Type /song to add some songs first!",
                type: "private"
            },
            "already-dj": {
                message: "You are already a DJ",
                type: "private"
            },
            "switch-channels": {
                message: {
                    text: "Warning! You are currently active in another channel, are you sure you want to switch channels?",
                    "attachments": [
                        {
                            "fallback": "Are you sure you want to switch channels?",
                            "callback_id": "switch_channels",
                            "color": this.spotifyColor,
                            "attachment_type": "default",
                            "actions": this.getMessageActions(["switch-channels"], data)
                        }
                    ]
                },
                type: "private"
            }
        };
        let response = botResponse[messageType];
        if (_.isNil(response)) {
            response = this.errorMessage;
        }
        return response;
    }
    static botReply(bot, message, messageType, data = {}) {
        let botResponse = this.getBotReplyMessage(messageType, data);
        //switched to an api instead of a bot reply so that the bot doesnt have to be in the room
        if (botResponse.type === 'public') {
            bot.api.chat.postMessage(Object.assign({}, botResponse.message, { channel: '#' + message.channel_name, as_user: true }), function (err, res) {
                // console.log(err);
            });
        }
        else if (botResponse.type === 'private') {
            bot.replyPrivate(message, botResponse.message);
        }
    }
    static ActionButton(text, name, style, value = null) {
        return {
            "name": name,
            "text": text,
            "style": style,
            "type": "button",
            "value": value
        };
    }
    /*
        Action types
            "add-song",
            "move-song-top",
            "bad-reaction",
            "good-reaction",
     */
    static getMessageActions(types, data = {}) {
        const actions = {
            "add-song": this.ActionButton('Add to queue', 'add_song_to_queue', 'primary', data.uri),
            "move-song-top": this.ActionButton('Move to top of queue', 'move_song_in_queue', 'primary', data.uri),
            "bad-reaction": this.ActionButton('Boo', 'boo', 'danger', 'thumbsdown'),
            "nice-reaction": this.ActionButton('Nice Play!', 'nice', 'primary', 'thumbsup'),
            "login": this.ActionButton("Login", 'login', null, 'login'),
            "switch-channels": this.ActionButton("Yes, switch channels", "switch_channels", null, data.action)
        };
        let finalActions = [];
        if (!Array.isArray(types)) {
            types = [types];
        }
        for (let actionType of types) {
            let action = actions[actionType];
            if (_.isNil(action)) {
                console.error('Unable to find message action of type = ', actionType);
            }
            else {
                finalActions.push(action);
            }
        }
        return finalActions;
    }
}
SlackMessages.spotifyColor = "#1DB954";
SlackMessages.errorMessage = 'Whoops, something went wrong with that command!';
exports.SlackMessages = SlackMessages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xhY2tNZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL1NsYWNrTWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0QkFBNEI7QUFFNUIsTUFBYSxhQUFhO0lBR3RCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsSUFBSTtRQUN2RCxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDekMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5RCxPQUFPLFNBQVMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUMsQ0FBQTtJQUMvQyxDQUFDO0lBR0QsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJO1FBQ2hDLE9BQU87WUFDSCxNQUFNLEVBQUUsZ0JBQWdCLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUc7WUFDNUUsYUFBYSxFQUFFLENBQUM7b0JBQ1osVUFBVSxFQUFFLGNBQWMsR0FBRyxLQUFLLENBQUMsSUFBSTtvQkFDdkMsT0FBTyxFQUFF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