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
const _ = require("lodash");
const ServiceManager_1 = require("./ServiceManager");
const SpotifyService_1 = require("./SpotifyService");
const DatabaseConnection_1 = require("../models/DatabaseConnection");
const uuid = require("uuid/v1");
class UserService {
    constructor() {
        this.users = [];
        this.playlistQueueName = 'DJ-Bot~Queue';
        this.spotifyService = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService, this);
        this.getUsers();
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.users = yield DatabaseConnection_1.User.find();
        });
    }
    getUserByContext(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getUser(user, 'context');
        });
    }
    getUserNameByContext(user) {
        if (user.context.type == 'slack') {
            return user.context.user.name;
        }
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            let newUser = {
                user_uuid: uuid(),
                channel: userData['channel'],
                context: userData['context'],
                username: this.getUserNameByContext(userData)
            };
            let dbUser = new DatabaseConnection_1.User(newUser); //adds the user to the DB
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
            let dbUser = yield DatabaseConnection_1.User.find(userQuery);
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
            let newValues = {
                access_token: access_token,
                refresh_token: refresh_token,
            };
            user = _.merge(user, newValues);
            newValues['playlist_id'] = yield this.getUserPlaylistId(user);
            try {
                yield this.updateUser(user, newValues);
            }
            catch (e) {
                console.error("unable to save user");
                console.error(e);
            }
        });
    }
    updateUser(user, newValues) {
        return __awaiter(this, void 0, void 0, function* () {
            DatabaseConnection_1.User.updateOne({ _id: user['_id'] }, {
                $set: newValues
            }).exec().then().catch();
        });
    }
    getUserPlaylistId(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //first get spotify user id.
                //Might be able to get rid of this?
                let spotifyUser = yield this.spotifyService.spotifyApi(user, /*you just...*/ 'getMe');
                let userId = spotifyUser.body['id'];
                //Fetch user playlists. Start with the first 30
                let playlistOptions = {
                    limit: 20,
                    offset: 0
                };
                let userPlaylists;
                try {
                    userPlaylists = yield this.spotifyService.spotifyApi(user, 'getUserPlaylists', userId, playlistOptions);
                }
                catch (e) {
                    console.error(e);
                }
                let djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                    return playlist.name == this.playlistQueueName;
                });
                //Keep going through user playlists until all of them have been checked.
                //Only occurs if user has >30 playlists and searches in increments of 30
                while (userPlaylists.body.items.length == playlistOptions.limit && _.isNil(djBotPlaylist)) {
                    playlistOptions.offset += playlistOptions.limit;
                    userPlaylists = yield this.spotifyService.spotifyApi(user, 'getUserPlaylists', userId, playlistOptions);
                    djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                        return playlist.name == this.playlistQueueName;
                    });
                }
                //If playlist is still null after all the searching, then need to create it
                if (_.isNil(djBotPlaylist)) {
                    djBotPlaylist = (yield this.createSpotifyPlaylist(user, userId)).body;
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
            if (!_.isNil(existingUser)) {
                if (_.isNil(existingUser['playlist_id']) || _.isNil(existingUser['access_token']) || _.isNil(existingUser['refresh_token'])) {
                    return false;
                }
                return true;
            }
            return false;
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
            user['listening'] = true;
            return user;
        });
    }
    createSpotifyPlaylist(user, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let newPlaylistOpts = {
                description: 'This is where you can put your songs to play with DJ-Bot! Just drag them in here and get to DJing!'
            };
            return yield this.spotifyService.spotifyApi(user, 'createPlaylist', userId, this.playlistQueueName, newPlaylistOpts);
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvVXNlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDRCQUE0QjtBQUM1QixxREFBeUM7QUFDekMscURBQWdEO0FBQ2hELHFFQUFrRDtBQUNsRCxnQ0FBZ0M7QUFFaEMsTUFBYSxXQUFXO0lBS3BCO1FBSkEsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUVYLHNCQUFpQixHQUFHLGNBQWMsQ0FBQztRQUcvQixJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFSyxRQUFROztZQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSx5QkFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLENBQUM7S0FBQTtJQUVLLGdCQUFnQixDQUFDLElBQUk7O1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBRUQsb0JBQW9CLENBQUMsSUFBSTtRQUNyQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNqQztJQUNMLENBQUM7SUFFSyxVQUFVLENBQUMsUUFBUTs7WUFDckIsSUFBSSxPQUFPLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLElBQUksRUFBRTtnQkFDakIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUM7Z0JBQzVCLE9BQU8sRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUM1QixRQUFRLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQzthQUNo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