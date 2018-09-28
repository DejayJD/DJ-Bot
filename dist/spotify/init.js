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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zcG90aWZ5L2luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBQ0gsOENBQTZDO0FBQzdDLG1DQUFrQztBQUNsQywyQ0FBMEM7QUFDMUMsc0RBQXFEO0FBQ3JELDRCQUE0QjtBQUM1QixtQ0FBa0M7QUFFbEMsWUFBWTtBQUNaLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFFbEIsU0FBUyxJQUFJLENBQUUsT0FBTztJQUN0QiwyQkFBMkI7SUFDdkIsTUFBTSxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUM7UUFDcEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCO1FBQ3ZDLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQjtRQUMvQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7S0FDNUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyQyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQ3BDLElBQUksUUFBUSxHQUFHLG9CQUFvQixDQUFDO0lBRXBDLFNBQVMsb0JBQW9CLENBQUMsTUFBTTtRQUNoQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLFFBQVEsR0FBRyxnRUFBZ0UsQ0FBQztRQUVoRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdCLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFB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