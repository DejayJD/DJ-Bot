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
            'user-top-read',
            'user-read-recently-played',
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
        return __awaiter(this, void 0, void 0, function* () {
            // your application requests refresh and access tokens
            let code = req.query.code || null;
            let state = req.query.state || null;
            let storedState = req.cookies ? req.cookies[stateKey] : null;
            let user_uuid = req.cookies['user_uuid'] || null;
            let existingUser = yield userService.getUser({ user_uuid: user_uuid });
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
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!error && response.statusCode === 200) {
                            let access_token = body.access_token;
                            let refresh_token = body.refresh_token;
                            try {
                                yield userService.setUserSpotifyCredentials(user_uuid, access_token, refresh_token);
                                res.status(200).send('Successfully logged in!');
                            }
                            catch (e) {
                                res.redirect('/#' +
                                    querystring.stringify({
                                        error: 'Unable to login to spotify. ¯\\_(ツ)_/¯'
                                    }));
                            }
                            // mainApp.syncUser(user_uuid);
                        }
                        else {
                            res.redirect('/#' +
                                querystring.stringify({
                                    error: 'invalid_token'
                                }));
                        }
                    });
                });
            }
        });
    });
    app.get('/test', function (req, res) {
        res.status(200).send("Server is working");
    });
    app.listen(port, () => console.log(`User login server listening on port ${port}!`));
}
module.exports = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BvdGlmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXJzL3Nwb3RpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O0dBSUc7QUFDSCw4Q0FBNkM7QUFDN0MsbUNBQWtDO0FBQ2xDLDJDQUEwQztBQUMxQyw0QkFBNEI7QUFDNUIsbUNBQWtDO0FBQ2xDLCtEQUFtRDtBQUNuRCx5REFBb0Q7QUFFcEQsWUFBWTtBQUNaLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFFbEIsU0FBUyxJQUFJLENBQUMsT0FBTztJQUNqQixJQUFJLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQztJQUNwQyxJQUFJLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFFbEQsU0FBUyxvQkFBb0IsQ0FBQyxNQUFNO1FBQ2hDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksUUFBUSxHQUFHLGdFQUFnRSxDQUFDO1FBRWhGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDeEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQUEsQ0FBQztJQUdGLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDaEMsSUFBSSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsR0FB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