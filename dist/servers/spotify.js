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