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
const User_1 = require("../models/User");
const _ = require("lodash");
const ServiceManager_1 = require("./ServiceManager");
const SpotifyService_1 = require("./SpotifyService");
const DatabaseConnection_1 = require("./DatabaseConnection");
class UserService {
    constructor() {
        this.users = [];
        this.playlistQueueName = 'DJ-Bot~Queue';
        this.spotifyService = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService, this);
        this.getUsers();
        this.spotifyApi = this.spotifyService.spotifyApi;
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.users = yield DatabaseConnection_1.user.find();
            console.log(this.users);
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            let newUser = new User_1.User(userData);
            let dbUser = new DatabaseConnection_1.user(newUser); //adds the user to the DB
            try {
                yield dbUser.save();
                console.log("created new user in db");
            }
            catch (e) {
                console.error(e);
                console.error("Unable to save user to db");
            }
            this.users.push(newUser);
            return newUser;
        });
    }
    getUser(userData, identifier = 'user_uuid') {
        return __awaiter(this, void 0, void 0, function* () {
            let dbUser = yield DatabaseConnection_1.user.find({ identifier: userData[identifier] });
            if (!_.isNil(dbUser)) {
                if (dbUser.length > 0) {
                    console.log("Found existing user!");
                    console.log(dbUser);
                    //TODO: refresh spotify token
                    return dbUser;
                }
            }
        });
    }
    setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = _.find(this.users, { user_uuid: user_uuid });
            if (_.isNil(user)) {
                console.error("Unable to set credentials for user with token: " + user_uuid);
                return;
            }
            user['access_token'] = access_token;
            user['refresh_token'] = refresh_token;
            //TODO: DB HERE - update user in the db
            yield this.getUserPlaylistId(user);
        });
    }
    getUserPlaylistId(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.spotifyApi.setAccessToken(user['access_token']);
                let spotifyUser = yield this.spotifyApi.getMe();
                let userId = spotifyUser['id'];
                let userPlaylists = yield this.spotifyApi.getUserPlaylists(userId);
                let djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                    return playlist.name == this.playlistQueueName;
                });
                if (_.isNil(djBotPlaylist)) {
                    //TODO: Create a playlist when an existing one is not found
                    this.createSpotifyPlaylist(user);
                }
                user.playlist_id = djBotPlaylist.id;
            }
            catch (e) {
                console.error("Unable to find a DJ-Bot~Queue playlist");
                console.error(e);
            }
        });
    }
    getSlackUser(userData) {
        return _.find(this.users, (user) => {
            return user.context.user.id === userData.context.user.id;
        });
    }
    userIsLoggedIn(userData, context = 'slack') {
        if (context == 'slack') {
            //Find user by slack id and check their access token
            return !_.isNil(_.find(this.users, (user) => {
                return user.context.user.id === userData.context.user.id && !_.isNil(user['access_token']);
            }));
        }
    }
    loginUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingUser = yield this.getUser(user);
            if (_.isNil(existingUser)) {
                user = yield this.createUser(user);
            }
            else {
                user = existingUser;
            }
            user['active'] = true;
            console.log(user);
            return user;
        });
    }
    createSpotifyPlaylist(user) {
        //TODO:
    }
}
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvVXNlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHlDQUFvQztBQUNwQyw0QkFBNEI7QUFDNUIscURBQXlDO0FBQ3pDLHFEQUFnRDtBQUNoRCw2REFBOEM7QUFFOUMsTUFBYSxXQUFXO0lBT3BCO1FBTEEsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUdYLHNCQUFpQixHQUFHLGNBQWMsQ0FBQztRQUcvQixJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7SUFDckQsQ0FBQztJQUVLLFFBQVE7O1lBQ1YsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLHlCQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsQ0FBQztLQUFBO0lBRUssVUFBVSxDQUFDLFFBQVE7O1lBQ3JCLElBQUksT0FBTyxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLElBQUksTUFBTSxHQUFHLElBQUkseUJBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUN6RCxJQUFJO2dCQUNBLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7YUFDekM7WUFDRCxPQUFNLENBQUMsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLDJC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