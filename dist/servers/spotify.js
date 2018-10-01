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
const ServiceManager_1 = require("../services/ServiceManager");
const UserService_1 = require("../services/UserService");
//Web server
const app = express();
app.use(cookieParser());
const port = 3001;
function init(mainApp) {
    let stateKey = 'spotify_auth_state';
    let userService = ServiceManager_1.Service.getService(UserService_1.UserService);
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
        let existingUser = userService.getUser({ user_uuid: user_uuid });
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
                    userService.setUserSpotifyCredentials(user_uuid, access_token, refresh_token);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BvdGlmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXJzL3Nwb3RpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztHQUlHO0FBQ0gsOENBQTZDO0FBQzdDLG1DQUFrQztBQUNsQywyQ0FBMEM7QUFDMUMsNEJBQTRCO0FBQzVCLG1DQUFrQztBQUNsQywrREFBbUQ7QUFDbkQseURBQW9EO0FBRXBELFlBQVk7QUFDWixNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBRWxCLFNBQVMsSUFBSSxDQUFFLE9BQU87SUFDbEIsSUFBSSxRQUFRLEdBQUcsb0JBQW9CLENBQUM7SUFDcEMsSUFBSSxXQUFXLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxDQUFDO0lBRWxELFNBQVMsb0JBQW9CLENBQUMsTUFBTTtRQUNoQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLFFBQVEsR0FBRyxnRUFBZ0UsQ0FBQztRQUVoRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdCLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUFBLENBQUM7SUFJRixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ2hDLElBQUksS0FBSyxHQUFHLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxN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