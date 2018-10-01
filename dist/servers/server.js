"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Created By JD.Francis on 9/25/18
 *
 *  This file is responsible for setting up a spotify server, auth-ing to it and
 */
const cookieParser = require("cookie-parser");
const express = require("express");
const querystring = require("querystring");
const _ = require("lodash");
const request = require("request");
//Web server
const app = express();
app.use(cookieParser());
const port = 3001;
function init(mainApp) {
    let stateKey = 'spotify_auth_state';
    function generateRandomString(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    ;
    app.get('/login', function (req, res) {
        let state = generateRandomString(16);
        res.cookie(stateKey, state);
        res.cookie('user_uuid', req.query['user_uuid']);
        // The auth scopes the user is requested to give
        // See : https://developer.spotify.com/documentation/general/guides/scopes/
        let scopes = [
            'user-read-private',
            'user-library-read',
            'playlist-read-private',
            'playlist-modify-private',
            'playlist-modify-public',
            'playlist-read-collaborative',
            'user-read-email',
            'user-read-playback-state',
            'streaming',
            'user-modify-playback-state'
        ];
        let scope = _.join(scopes, ' ');
        res.redirect('https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                client_id: process.env.SPOTIFY_CLIENT_ID,
                scope: scope,
                redirect_uri: process.env.SPOTIFY_REDIRECT,
                state: state
            }));
    });
    app.get('/callback', function (req, res) {
        // your application requests refresh and access tokens
        let code = req.query.code || null;
        let state = req.query.state || null;
        let storedState = req.cookies ? req.cookies[stateKey] : null;
        let user_uuid = req.cookies['user_uuid'] || null;
        let existingUser = _.find(mainApp.users, { user_uuid: user_uuid });
        // after checking the state parameter
        if (state === null || state !== storedState) {
            console.error("Unable to auth user, state mismatch!");
            res.redirect('/#' +
                querystring.stringify({
                    error: 'state_mismatch'
                }));
        }
        else if (_.isNil(existingUser)) {
            console.error("Unable to find user, invalid user_uuid!");
            res.redirect('/#' +
                querystring.stringify({
                    error: 'unable to find user_uuid' + user_uuid
                }));
        }
        {
            res.clearCookie(stateKey);
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: process.env.SPOTIFY_REDIRECT,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
                },
                json: true
            };
            request.post(authOptions, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    let access_token = body.access_token;
                    let refresh_token = body.refresh_token;
                    mainApp.setUserSpotifyCredentials(user_uuid, access_token, refresh_token);
                    // mainApp.syncUser(user_uuid);
                    res.status(200).send('Successfully logged in!');
                }
                else {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'invalid_token'
                        }));
                }
            });
        }
    });
    app.get('/test', function (req, res) {
        res.status(200).send("Server is working");
    });
    // TODO: Clean these up
    // let currentSong = {
    //     currentUri: null,
    //     startTime: null
    // };
    // app.get('/skip', async function (req, res) {
    //     try {
    //         await spotifyApi.skipToNext();
    //     }
    //     catch (e) {
    //         res.status(500).send(e);
    //     }
    //     res.status(200).send("Skipped");
    // });
    // app.get('/play', async function (req, res) {
    //     try {
    //
    //         res.status(200).send("Playing");
    //     }
    //     catch (e) {
    //         res.status(500).send(e);
    //     }
    // });
    // app.get('/funk-dat', async function (req, res) {
    //     try {
    //         // let searchResults = await search(searchString);
    //         let firstTrack = searchResults.tracks.items[0];
    //         let uri = firstTrack.uri;
    //         await spotifyApi.play({uris: [uri]});
    //         currentSong.currentUri = uri;
    //         currentSong.startTime = new Date();
    //         res.status(200).send("FUNK DAT");
    //     }
    //     catch (e) {
    //         res.status(500).send(e);
    //     }
    // });
    // app.get('/pause', async function (req, res) {
    //     try {
    //         await spotifyApi.pause();
    //     }
    //     catch (e) {
    //         res.status(500).send(e);
    //     }
    //     res.status(200).send("FUNK DAT");
    // });
    // app.get('/current-playback', async function (req, res) {
    //     try {
    //         let searchResults = await search(searchString);
    //         let firstTrack = searchResults.tracks.items[0];
    //         await spotifyApi.play();
    //         // spotifyApi.transferMyPlayback()
    //     }
    //     catch (e) {
    //         res.status(500).send(e);
    //     }
    //     res.status(200).send("FUNK DAT");
    // });
    app.listen(port, () => console.log(`User login server listening on port ${port}!`));
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZlcnMvc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7R0FJRztBQUNILDhDQUE2QztBQUM3QyxtQ0FBa0M7QUFDbEMsMkNBQTBDO0FBQzFDLDRCQUE0QjtBQUM1QixtQ0FBa0M7QUFFbEMsWUFBWTtBQUNaLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFFbEIsU0FBUyxJQUFJLENBQUUsT0FBTztJQUNsQixJQUFJLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQztJQUVwQyxTQUFTLG9CQUFvQixDQUFDLE1BQU07UUFDaEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxRQUFRLEdBQUcsZ0VBQWdFLENBQUM7UUFFaEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QixJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUN4RTtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFBQSxDQUFDO0lBSUYsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNoQyxJQUFJLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsS0FBSyxD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