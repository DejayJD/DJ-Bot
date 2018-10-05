/*
 *  Created By JD.Francis on 9/25/18
 *
 *  This file is responsible for setting up a spotify server, auth-ing to it and
 */
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as querystring from 'querystring'
import * as _ from "lodash";
import * as request from 'request'
import {Service} from "../services/ServiceManager";
import {UserService} from "../services/UserService";

//Web server
const app = express();
app.use(cookieParser());
const port = 3001;

function init(mainApp) {
    let stateKey = 'spotify_auth_state';
    let userService = Service.getService(UserService);

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
    app.get('/callback', async function (req, res) {
        // your application requests refresh and access tokens
        let code = req.query.code || null;

        let state = req.query.state || null;
        let storedState = req.cookies ? req.cookies[stateKey] : null;
        let user_uuid = req.cookies['user_uuid'] || null;
        let existingUser = await userService.getUser({user_uuid: user_uuid});

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
            request.post(authOptions, async function (error, response, body) {
                if (!error && response.statusCode === 200) {

                    let access_token = body.access_token;
                    let refresh_token = body.refresh_token;
                    try {
                        await userService.setUserSpotifyCredentials(user_uuid, access_token, refresh_token);
                        res.status(200).send('Successfully logged in!')
                    }
                    catch (e) {
                        res.redirect('/#' +
                            querystring.stringify({
                                error: 'Unable to login to spotify. ¯\\_(ツ)_/¯'
                            }));
                    }
                    // mainApp.syncUser(user_uuid);
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

    app.listen(port, () => console.log(`User login server listening on port ${port}!`));
}

module.exports = init;