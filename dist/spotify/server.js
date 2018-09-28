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
    // TODO: Clean these up
    let currentSong = {
        currentUri: null,
        startTime: null
    };
    const searchString = 'Funk Dat sagat';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3Nwb3RpZnkvc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7OztHQUlHO0FBQ0gsOENBQTZDO0FBQzdDLG1DQUFrQztBQUNsQywyQ0FBMEM7QUFDMUMsc0RBQXFEO0FBQ3JELDRCQUE0QjtBQUM1QixtQ0FBa0M7QUFFbEMsWUFBWTtBQUNaLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFFbEIsU0FBUyxJQUFJLENBQUUsT0FBTztJQUN0QiwyQkFBMkI7SUFDdkIsTUFBTSxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUM7UUFDcEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCO1FBQ3ZDLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQjtRQUMvQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7S0FDNUMsQ0FBQyxDQUFDO0lBRUgscURBQXFEO0lBQ3JELE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckMsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUNwQyxJQUFJLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQztJQUVwQyxTQUFTLG9CQUFvQixDQUFDLE1BQU07UUFDaEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxRQUFRLEdBQUcsZ0VBQWdFLENBQUM7UUFFaEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QixJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUN4RTtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFBQSxDQUFDO0lBSUYsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNoQyxJQUFJLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFFbEQsMENBQTBDO1FBQzFDLElBQUksTUFBTSxHQUFHO1lBQ1QsbUJBQW1CO1lBQ25CLG1CQUFtQjtZQUNuQixpQkFBaUI7WUFDakIsMEJBQTBCO1lBQzFCLFdBQVc7WUFDWCw0QkFBNEI7U0FDL0IsQ0FBQztRQUNGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEdBQUcsQ0FBQyxRQUFRLENBQUMseUNBQXlDO1lBQ2xELFdBQVcsQ0FBQyxTQUFTLENBQUM7Z0JBQ2xCLGFBQWEsRUFBRSxNQUFNO2dCQUNyQixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7Z0JBQ3hDLEtBQUssRUFBRSxLQUFLO2dCQUNaLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtnQkFDMUMsS0FBSyxFQUFFLEtBQUs7YUFDZixDQUFDLENBQUMsQ0FBQztJQUdaLENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNuQyxzREFBc0Q7UUFDdEQsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO1FBRWxDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztRQUNwQyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDN0QsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDbEQsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUMsVUFBVSxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUM7UUFFakUscUNBQXFDO1FBRXJDLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssV0FBVyxFQUFFO1lBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUN0RCxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUk7Z0JBQ2IsV0FBVyxDQUFDLFNBQVMsQ0FBQztvQkFDbEIsS0FBSyxFQUFFLGdCQUFnQjtpQkFDMUIsQ0FBQyxDQUFDLENBQUM7U0FDWDthQUFNLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDMUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJO2dCQUNiLFdBQVcsQ0FBQyxTQUFTLENBQUM7b0JBQ2xCLEtBQUssRUFBRSwyQkFBMkIsR0FBRyxTQUFTO2lCQUNqRCxDQUFDLENBQUMsQ0FBQztTQUNYO1FBQUM7WUFDRSxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFCLElBQUksV0FBVyxHQUFHO2dCQUNkLEdBQUcsRUFBRSx3Q0FBd0M7Z0JBQzdDLElBQUksRUFBRTtvQkFDRixJQUFJLEVBQUUsSUFBSTtvQkFDVixZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7b0JBQzFDLFVBQVUsRUFBRSxvQkFBb0I7aUJBQ25DO2dCQUNELE9BQU8sRUFBRTtvQkFDTCxlQUFlLEVBQUUsUUFBUSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdkk7Z0JBQ0QsSUFBSSxFQUFFLElBQUk7YUFDYixDQUFDO1lBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUk7Z0JBQ3JELElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxHQUFHLEVBQUU7b0JBRXZDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7b0JBQ3JDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7b0JBRXZDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUMxRSxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUM1QixrQkFBa0I7b0JBQ2xCLDRDQUE0QztvQkFDNUMsNERBQTREO29CQUM1RCxpQkFBaUI7b0JBQ2pCLEtBQUs7b0JBQ0wsRUFBRTtvQkFDRix3REFBd0Q7b0JBQ3hELDBEQUEwRDtvQkFDMUQseUJBQXlCO29CQUN6QixNQUFNO29CQUVOLDJFQUEyRTtvQkFDM0Usa0RBQWtEO29CQUNsRCw4QkFBOEI7b0JBQzlCLHNDQUFzQztvQkFDdEMsdUNBQXVDO29CQUN2QyxXQUFXO29CQUNYLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO2lCQUNuQztxQkFBTTtvQkFDSCxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUk7d0JBQ2IsV0FBVyxDQUFDLFNBQVMsQ0FBQzs0QkFDbEIsS0FBSyxFQUFFLGVBQWU7eUJBQ3pCLENBQUMsQ0FBQyxDQUFDO2lCQUNYO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBTUgsdUJBQXVCO0lBQ3ZCLElBQUksV0FBVyxHQUFHO1FBQ2QsVUFBVSxFQUFFLElBQUk7UUFDaEIsU0FBUyxFQUFFLElBQUk7S0FDbEIsQ0FBQztJQUNGLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDO0lBQ3RDLFNBQWUsTUFBTSxDQUFDLFlBQVk7O1lBQzlCLElBQUk7Z0JBQ0EsSUFBSSxJQUFJLEdBQUcsTUFBTSxVQUFVLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN2RCw4Q0FBOEM7Z0JBQzlDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQzthQUNwQjtZQUNELE9BQU8sQ0FBQyxFQUFFO2FBRVQ7UUFDTCxDQUFDO0tBQUE7SUFDRCxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFnQixHQUFHLEVBQUUsR0FBRzs7WUFDckMsSUFBSTtnQkFDQSxNQUFNLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQzthQUNqQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1lBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEMsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQWdCLEdBQUcsRUFBRSxHQUFHOztZQUNyQyxJQUFJO2dCQUNBLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNuQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1FBQ0wsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQWdCLEdBQUcsRUFBRSxHQUFHOztZQUN6QyxJQUFJO2dCQUNBLElBQUksYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLFVBQVUsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDekIsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDO2dCQUNyQyxXQUFXLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztnQkFDN0IsV0FBVyxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNuQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNCO1FBQ0wsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUVILEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFVBQWdCLEdBQUcsRUFBRSxHQUFHOztZQUN0QyxJQUFJO2dCQUNBLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQzVCO1lBQ0QsT0FBTyxDQUFDLEVBQUU7Z0JBQ04sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDM0I7WUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFnQixHQUFHLEVBQUUsR0FBRzs7WUFDakQsSUFBSTtnQkFDQSxJQUFJLGFBQWEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxVQUFVLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN4QixrQ0FBa0M7YUFDckM7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDTixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQjtZQUNELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FBQSxDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFnQixHQUFHLEVBQUUsR0FBRzs7WUFDdkMsSUFBSTtnQkFDQSxJQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLGFBQWEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxVQUFVLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0QsT0FBTyxDQUFDLEVBQUU7Z0JBQ04sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDM0I7UUFDTCxDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUN2QyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLENBQUM7QUFDRCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyJ9