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
const SpotifyWebApi = require("spotify-web-api-node");
const _ = require("lodash");
const request = require("request");
//Web server
const app = express();
app.use(cookieParser());
const port = 3001;
function init(mainApp) {
    // credentials are optional
    const newSpotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT
    });
    //Pass this over to the app to use for our operations
    mainApp.setSpotifyApi(newSpotifyApi);
    let spotifyApi = mainApp.spotifyApi;
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
                    console.log("logged in user with token = " + access_token);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Nwb3RpZnkvc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7R0FJRztBQUNILDhDQUE2QztBQUM3QyxtQ0FBa0M7QUFDbEMsMkNBQTBDO0FBQzFDLHNEQUFxRDtBQUNyRCw0QkFBNEI7QUFDNUIsbUNBQWtDO0FBRWxDLFlBQVk7QUFDWixNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBRWxCLFNBQVMsSUFBSSxDQUFFLE9BQU87SUFDdEIsMkJBQTJCO0lBQ3ZCLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDO1FBQ3BDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQjtRQUN2QyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7UUFDL0MsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCO0tBQzVDLENBQUMsQ0FBQztJQUVILHFEQUFxRDtJQUNyRCxPQUFPLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7SUFDcEMsSUFBSSxRQUFRLEdBQUcsb0JBQW9CLENBQUM7SUFFcEMsU0FBUyxvQkFBb0IsQ0FBQyxNQUFNO1FBQ2hDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksUUFBUSxHQUFHLGdFQUFnRSxDQUFDO1FBRWhGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENB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