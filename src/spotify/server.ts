/*
 *  Created By JD.Francis on 9/25/18
 *
 *  This file is responsible for setting up a spotify server, auth-ing to it and
 */
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as querystring from 'querystring'
import * as SpotifyWebApi from 'spotify-web-api-node'
import * as _ from "lodash";
import * as request from 'request'

//Web server
const app = express();
app.use(cookieParser());
const port = 3001;

function init (mainApp) {
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
    };



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
        let existingUser = _.find(mainApp.users, {user_uuid:user_uuid});

        // after checking the state parameter

        if (state === null || state !== storedState) {
            console.error("Unable to auth user, state mismatch!");
            res.redirect('/#' +
                querystring.stringify({
                    error: 'state_mismatch'
                }));
        } else if (_.isNil(existingUser)) {
            console.error("Unable to find user, invalid user_uuid!");
            res.redirect('/#' +
                querystring.stringify({
                    error: 'unable to find user_uuid' + user_uuid
                }));
        } {
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
                    res.status(200).send('Successfully logged in!')
                } else {
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