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
const User_1 = require("../classes/User");
const _ = require("lodash");
const ServiceManager_1 = require("./ServiceManager");
const SpotifyService_1 = require("./SpotifyService");
class UserService {
    constructor() {
        this.playlistQueueName = 'DJ-Bot~Queue';
        this.users = [];
        this.spotifyService = ServiceManager_1.Service.getService(SpotifyService_1.SpotifyService);
        this.spotifyApi = this.spotifyService.spotifyApi;
    }
    createUser(user) {
        let newUser = new User_1.User(user);
        this.users.push(newUser);
        return newUser;
    }
    userExists(user) {
        //TODO: set this up
        return false;
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
    getUser(userData, identifier = 'user_uuid') {
        return _.find(this.users, (user) => {
            return user[identifier] === userData[identifier];
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
        user['active'] = true;
        if (!this.userExists(user)) {
            user = this.createUser(user);
        }
        else {
            console.log("user already exists, just inactive");
        }
        return user;
    }
    createSpotifyPlaylist(user) {
        //TODO:
    }
}
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvVXNlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDBDQUFxQztBQUNyQyw0QkFBNEI7QUFDNUIscURBQXlDO0FBQ3pDLHFEQUFnRDtBQUVoRCxNQUFhLFdBQVc7SUFPcEI7UUFGQSxzQkFBaUIsR0FBRyxjQUFjLENBQUM7UUFHL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGNBQWMsR0FBRyx3QkFBTyxDQUFDLFVBQVUsQ0FBQywrQkFBYyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztJQUNyRCxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQUk7UUFDWCxJQUFJLE9BQU8sR0FBRyxJQUFJLFdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQUk7UUFDWCxtQkFBbUI7UUFDbkIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVLLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsYUFBYTs7WUFDbEUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsaURBQWlELEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQzdFLE9BQU87YUFDVjtZQUNELElBQUksQ0FBQyxjQUFjLENBQUMsR0FB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