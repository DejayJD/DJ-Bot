"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Created By JD.Francis on 9/25/18
 */
const cookie_parser_1 = require("cookie-parser");
const express = require("express");
const querystring = require("querystring");
const SpotifyWebApi = require("spotify-web-api-node");
const _ = require("lodash");
const request = require("request");
//Web server
const app = express();
app.use(cookie_parser_1.default());
const port = 3001;
function init(mainApp) {
    // credentials are optional
    const newSpotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.SPOTIFY_REDIRECT
    });
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
    // Retrieve an access token.
    const searchString = 'Funk Dat sagat';
    spotifyApi.clientCredentialsGrant().then(function (data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('The access token expires in ' + data.body['expires_in']);
            let token = data.body['access_token'];
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(token);
            // main();
        });
    }, function (err) {
        console.log('Something went wrong when retrieving an access token', err);
    });
    function search(searchString) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = yield spotifyApi.searchTracks(searchString);
                // console.log('Funk Dat results', data.body);
                return data.body;
            }
            catch (e) {
            }
        });
    }
    app.get('/login', function (req, res) {
        let state = generateRandomString(16);
        res.cookie(stateKey, state);
        res.cookie('user_token', req.query['user_token']);
        // your application requests authorization
        let scopes = [
            'user-read-private',
            'user-library-read',
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
        let userToken = req.cookies['user_token'] || null;
        let existingUser = _.find(mainApp.users, { user_token: userToken });
        // after checking the state parameter
        if (state === null || state !== storedState) {
            console.error("Unable to auth user, state mismatch!");
            res.redirect('/#' +
                querystring.stringify({
                    error: 'state_mismatch'
                }));
        }
        else if (_.isNil(existingUser)) {
            console.error("Unable to find user, invalid user_token!");
            res.redirect('/#' +
                querystring.stringify({
                    error: 'unable to find user_token' + userToken
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
                    mainApp.setUserSpotifyCredentials(userToken, access_token, refresh_token);
                    mainApp.syncUser(userToken);
                    // var options = {
                    //     url: 'https://api.spotify.com/v1/me',
                    //     headers: {'Authorization': 'Bearer ' + access_token},
                    //     json: true
                    // };
                    //
                    // // use the access token to access the Spotify Web API
                    // request.get(options, function (error, response, body) {
                    //     console.log(body);
                    // });
                    // // we can also pass the token to the browser to make requests from there
                    // res.redirect('http://localhost' + port + '/#' +
                    //     querystring.stringify({
                    //         access_token: access_token,
                    //         refresh_token: refresh_token
                    //     }));
                    res.status(200).send('Success!');
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
    app.get('/skip', function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield spotifyApi.skipToNext();
            }
            catch (e) {
                res.status(500).send(e);
            }
            res.status(200).send("Skipped");
        });
    });
    app.get('/play', function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield spotifyApi.play();
                res.status(200).send("Playing");
            }
            catch (e) {
                res.status(500).send(e);
            }
        });
    });
    let currentSong = {
        currentUri: null,
        startTime: null
    };
    app.get('/funk-dat', function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchResults = yield search(searchString);
                let firstTrack = searchResults.tracks.items[0];
                let uri = firstTrack.uri;
                yield spotifyApi.play({ uris: [uri] });
                currentSong.currentUri = uri;
                currentSong.startTime = new Date();
                res.status(200).send("FUNK DAT");
            }
            catch (e) {
                res.status(500).send(e);
            }
        });
    });
    app.get('/pause', function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield spotifyApi.pause();
            }
            catch (e) {
                res.status(500).send(e);
            }
            res.status(200).send("FUNK DAT");
        });
    });
    app.get('/current-playback', function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchResults = yield search(searchString);
                let firstTrack = searchResults.tracks.items[0];
                yield spotifyApi.play();
                // spotifyApi.transferMyPlayback()
            }
            catch (e) {
                res.status(500).send(e);
            }
            res.status(200).send("FUNK DAT");
        });
    });
    app.get('/search', function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let searchString = req.query['searchString'];
                let searchResults = yield search(searchString);
                let firstTrack = searchResults.tracks.items[0];
                res.status(200).send(firstTrack);
            }
            catch (e) {
                res.status(500).send(e);
            }
        });
    });
    app.get('/express-test', function (req, res) {
        res.status(200).send("Server is working");
    });
    app.listen(port, () => console.log(`User login server listening on port ${port}!`));
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zcG90aWZ5L2luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBQ0gsaURBQXdDO0FBQ3hDLG1DQUFrQztBQUNsQywyQ0FBMEM7QUFDMUMsc0RBQXFEO0FBQ3JELDRCQUE0QjtBQUM1QixtQ0FBa0M7QUFFbEMsWUFBWTtBQUNaLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsdUJBQVksRUFBRSxDQUFDLENBQUM7QUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBRWxCLFNBQVMsSUFBSSxDQUFFLE9BQU87SUFDdEIsMkJBQTJCO0lBQ3ZCLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDO1FBQ3BDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQjtRQUN2QyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7UUFDL0MsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCO0tBQzVDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckMsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUNwQyxJQUFJLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQztJQUVwQyxTQUFTLG9CQUFvQixDQUFDLE1BQU07UUFDaEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxRQUFRLEdBQUcsZ0VBQWdFLENBQUM7UUFFaEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QixJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVB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