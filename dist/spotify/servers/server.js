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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Nwb3RpZnkvc2VydmVycy9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztHQUlHO0FBQ0gsOENBQTZDO0FBQzdDLG1DQUFrQztBQUNsQywyQ0FBMEM7QUFDMUMsNEJBQTRCO0FBQzVCLG1DQUFrQztBQUVsQyxZQUFZO0FBQ1osTUFBTSxHQUFHLEdBQUcsT0FBTyxFQUFFLENBQUM7QUFDdEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUVsQixTQUFTLElBQUksQ0FBRSxPQUFPO0lBQ2xCLElBQUksUUFBUSxHQUFHLG9CQUFvQixDQUFDO0lBRXBDLFNBQVMsb0JBQW9CLENBQUMsTUFBTTtRQUNoQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLFFBQVEsR0FBRyxnRUFBZ0UsQ0FBQztRQUVoRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdCLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUFBLENBQUM7SUFJRixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ2hDLElBQUksS0FBSyxHQUFHLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcs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