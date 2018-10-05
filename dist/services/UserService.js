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
            this.users = yield DatabaseConnection_1.DbUser.find();
        });
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            let newUser = new User_1.User(userData);
            let dbUser = new DatabaseConnection_1.DbUser(newUser); //adds the user to the DB
            try {
                yield dbUser.save();
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
            let userQuery = {};
            userQuery[identifier] = _.get(userData, identifier);
            let dbUser = yield DatabaseConnection_1.DbUser.find(userQuery);
            if (!_.isNil(dbUser)) {
                if (dbUser.length > 0) {
                    return dbUser[0];
                }
            }
        });
    }
    setUserSpotifyCredentials(user_uuid, access_token, refresh_token) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.getUser({ user_uuid: user_uuid });
            if (_.isNil(user)) {
                console.error("Unable to set credentials for user with token: " + user_uuid);
                return;
            }
            let playlist_id = yield this.getUserPlaylistId(user);
            try {
                yield this.updateUser(user, {
                    access_token: access_token,
                    refresh_token: refresh_token,
                    playlist_id: playlist_id
                });
            }
            catch (e) {
                console.error("unable to save user");
                console.error(e);
            }
        });
    }
    updateUser(user, newValues) {
        return __awaiter(this, void 0, void 0, function* () {
            DatabaseConnection_1.DbUser.updateOne({ _id: user['_id'] }, {
                $set: newValues
            }).exec().then().catch();
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
                return djBotPlaylist.id;
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
    userIsLoggedIn(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingUser = yield this.getUser(userData, 'context');
            return !_.isNil(existingUser);
        });
    }
    loginUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let existingUser = yield this.getUser(user, 'context');
            if (_.isNil(existingUser)) {
                user = yield this.createUser(user);
            }
            else {
                user = existingUser;
            }
            user['active'] = true;
            return user;
        });
    }
    createSpotifyPlaylist(user) {
        //TODO:
    }
}
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvVXNlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHlDQUFvQztBQUNwQyw0QkFBNEI7QUFDNUIscURBQXlDO0FBQ3pDLHFEQUFnRDtBQUNoRCw2REFBNEM7QUFFNUMsTUFBYSxXQUFXO0lBT3BCO1FBTEEsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUdYLHNCQUFpQixHQUFHLGNBQWMsQ0FBQztRQUcvQixJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7SUFDckQsQ0FBQztJQUVLLFFBQVE7O1lBQ1YsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLDJCQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRUssVUFBVSxDQUFDLFFBQVE7O1lBQ3JCLElBQUksT0FBTyxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLElBQUksTUFBTSxHQUFHLElBQUksMkJBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUMzRCxJQUFJO2dCQUNBLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3ZCO1lBQ0QsT0FBTyxDQUFDLEVBQUU7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2FBQzlDO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekIsT0FBTyxPQUFPLENBQUM7UUFD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