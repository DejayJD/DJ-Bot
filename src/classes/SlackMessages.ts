import * as _ from "lodash";

export class SlackMessages {
    static spotifyColor = "#1DB954";

    static getSongListMessage(tracks, actions = [], text = null) {
        let parsedTracks = _.map(tracks, (track) => {
            return this.parseTrack(track);
        });
        let songList = _.map(parsedTracks, (track) => {
            let trackView = this.getSongView(track);
            trackView['actions'] = this.getMessageActions(actions, track);
            return trackView;
        });
        return {text:text, "attachments": songList}
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
        }
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
        }
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
        }
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
        }
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
                    "actions": this.getMessageActions(['login'])
                }
            ]
        }
    }


    static errorMessage = 'Whoops, something went wrong with that command!';

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
                            "actions":this.getMessageActions(["switch-channels"], data)

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

    static botReply(bot, message, messageType, data: any = {}) {
        let botResponse = this.getBotReplyMessage(messageType, data);
        //switched to an api instead of a bot reply so that the bot doesnt have to be in the room


        if (botResponse.type === 'public') {
            bot.api.chat.postMessage(
                {
                    ...botResponse.message,
                    channel: '#' + message.channel_name,
                    as_user: true
                },
                function (err, res) {
                    // console.log(err);
                }
            );
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
    static getMessageActions(types, data:any = {}) {
        const actions = {
            "add-song": this.ActionButton('Add to queue', 'add_song_to_queue', 'primary', data.uri),
            "move-song-top": this.ActionButton('Move to top of queue', 'move_song_in_queue', 'primary', data.uri),
            "bad-reaction": this.ActionButton('Boo', 'boo', 'danger', 'thumbsdown'),
            "nice-reaction": this.ActionButton('Nice Play!', 'nice', 'primary', 'thumbsup'),
            "login": this.ActionButton("Login", 'login', null, 'login'),
            "switch-channels":this.ActionButton("Yes, switch channels", "switch_channels", null, data.action)
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
