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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BvdGlmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXJzL3Nwb3RpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOzs7O0dBSUc7QUFDSCw4Q0FBNkM7QUFDN0MsbUNBQWtDO0FBQ2xDLDJDQUEwQztBQUMxQyw0QkFBNEI7QUFDNUIsbUNBQWtDO0FBQ2xDLCtEQUFtRDtBQUNuRCx5REFBb0Q7QUFFcEQsWUFBWTtBQUNaLE1BQU0sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFFbEIsU0FBUyxJQUFJLENBQUMsT0FBTztJQUNqQixJQUFJLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQztJQUNwQyxJQUFJLFdBQVcsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLENBQUM7SUFFbEQsU0FBUyxvQkFBb0IsQ0FBQyxNQUFNO1FBQ2hDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksUUFBUSxHQUFHLGdFQUFnRSxDQUFDO1FBRWhGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDeEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQUEsQ0FBQztJQUdGLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDaEMsSUFBSSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRWhELGdEQUFnRDtRQUNoRCwyRUFBMkU7UUFDM0UsSUFBSSxNQUFNLEdBQUc7WUFDVCxtQkFBbUI7WUFDbkIsbUJBQW1CO1lBQ25CLHVCQUF1QjtZQUN2Qix5QkFBeUI7WUFDekIsd0JBQXdCO1lBQ3hCLDZCQUE2QjtZQUM3QixpQkFBaUI7WUFDakIsMEJBQTBCO1lBQzFCLFdBQVc7WUFDWCw0QkFBNEI7U0FDL0IsQ0FBQztRQUNGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEdBQUcsQ0FBQyxRQUFRLENBQUMseUNBQXlDO1lBQ2xELFdBQVcsQ0FBQyxTQUFTLENBQUM7Z0JBQ2xCLGFBQWEsRUFBRSxNQUFNO2dCQUNyQixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7Z0JBQ3hDLEtBQUssRUFBRSxLQUFLO2dCQUNaLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtnQkFDMUMsS0FBSyxFQUFFLEtBQUs7YUFDZixDQUFDLENBQUMsQ0FBQztJQUdaLENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsVUFBZ0IsR0FBRyxFQUFFLEdBQUc7O1lBQ3pDLHNEQUFzRDtZQUN0RCxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7WUFFbEMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO1lBQ3BDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM3RCxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNqRCxJQUFJLFlBQVksR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztZQUVyRSxxQ0FBcUM7WUFFckMsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztnQkFDdEQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJO29CQUNiLFdBQVcsQ0FBQyxTQUFTLENBQUM7d0JBQ2xCLEtBQUssRUFBRSxnQkFBZ0I7cUJBQzFCLENBQUMsQ0FBQyxDQUFDO2FBQ1g7aUJBQU0sSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7Z0JBQ3pELEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSTtvQkFDYixXQUFXLENBQUMsU0FBUyxDQUFDO3dCQUNsQixLQUFLLEVBQUUsMEJBQTBCLEdBQUcsU0FBUztxQkFDaEQsQ0FBQyxDQUFDLENBQUM7YUFDWDtZQUNEO2dCQUNJLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzFCLElBQUksV0FBVyxHQUFHO29CQUNkLEdBQUcsRUFBRSx3Q0FBd0M7b0JBQzdDLElBQUksRUFBRTt3QkFDRixJQUFJLEVBQUUsSUFBSTt3QkFDVixZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7d0JBQzFDLFVBQVUsRUFBRSxvQkFBb0I7cUJBQ25DO29CQUNELE9BQU8sRUFBRTt3QkFDTCxlQUFlLEVBQUUsUUFBUSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDdkk7b0JBQ0QsSUFBSSxFQUFFLElBQUk7aUJBQ2IsQ0FBQztnQkFDRixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFnQixLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUk7O3dCQUMzRCxJQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFOzRCQUV2QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDOzRCQUNyQyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDOzRCQUN2QyxJQUFJO2dDQUNBLE1BQU0sV0FBVyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0NBQ3BGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUE7NkJBQ2xEOzRCQUNELE9BQU8sQ0FBQyxFQUFFO2dDQUNOLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSTtvQ0FDYixXQUFXLENBQUMsU0FBUyxDQUFDO3dDQUNsQixLQUFLLEVBQUUsd0NBQXdDO3FDQUNsRCxDQUFDLENBQUMsQ0FBQzs2QkFDWDs0QkFDRCwrQkFBK0I7eUJBQ2xDOzZCQUFNOzRCQUNILEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSTtnQ0FDYixXQUFXLENBQUMsU0FBUyxDQUFDO29DQUNsQixLQUFLLEVBQUUsZUFBZTtpQ0FDekIsQ0FBQyxDQUFDLENBQUM7eUJBQ1g7b0JBQ0wsQ0FBQztpQkFBQSxDQUFDLENBQUM7YUFDTjtRQUNMLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDSCxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQy9CLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDOUMsQ0FBQyxDQUFDLENBQUM7SUFFSCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEYsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDIn0=