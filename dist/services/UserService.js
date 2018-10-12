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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvVXNlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDRCQUE0QjtBQUM1QixxREFBeUM7QUFDekMscURBQWdEO0FBQ2hELHFFQUFrRDtBQUNsRCxnQ0FBZ0M7QUFFaEMsTUFBYSxXQUFXO0lBS3BCO1FBSkEsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUVYLHNCQUFpQixHQUFHLGNBQWMsQ0FBQztRQUcvQixJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFSyxRQUFROztZQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSx5QkFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLENBQUM7S0FBQTtJQUVELG9CQUFvQixDQUFDLElBQUk7UUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDakM7SUFDTCxDQUFDO0lBRUssVUFBVSxDQUFDLFFBQVE7O1lBQ3JCLElBQUksT0FBTyxHQUFHO2dCQUNWLFNBQVMsRUFBRSxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUM1QixPQUFPLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQztnQkFDNUIsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUM7YUFDaEQsQ0FBQztZQUNGLElBQUksTUFBTSxHQUFHLElBQUkseUJBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUN6RCxJQUFJO2dCQUNBLE1BQU0sTUFB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