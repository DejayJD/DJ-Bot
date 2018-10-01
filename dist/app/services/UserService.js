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
const SpotifyService_1 = require("../../spotify/services/SpotifyService");
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
        let user = _.find(this.users, { user_uuid: user_uuid });
        if (_.isNil(user)) {
            console.error("Unable to set credentials for user with token: " + user_uuid);
            return;
        }
        user['access_token'] = access_token;
        user['refresh_token'] = refresh_token;
        this.getUserPlaylistId(user);
    }
    getUserPlaylistId(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.spotifyService.setAccessToken(user);
                this.spotifyApi.setAccessToken(user['access_token']);
                let spotifyUser = yield this.spotifyApi.getMe();
                let userId = spotifyUser['id'];
                let userPlaylists = yield this.spotifyApi.getUserPlaylists(userId);
                let djBotPlaylist = _.find(userPlaylists.body.items, (playlist) => {
                    return playlist.name == this.playlistQueueName;
                });
                if (_.isNil(djBotPlaylist)) { //TODO:
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
    getUserByUserId(id) {
        return _.find(this.users, (user) => {
            return user.user.id === id;
        });
    }
    userIsLoggedIn(id) {
        return !_.isNil(_.find(this.users, (user) => {
            return user.conteuser.id === id && !_.isNil(user['access_token']);
        }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2VzL1VzZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSwwQ0FBcUM7QUFDckMsNEJBQTRCO0FBQzVCLHFEQUF5QztBQUN6QywwRUFBcUU7QUFFckUsTUFBYSxXQUFXO0lBT3BCO1FBRkEsc0JBQWlCLEdBQUcsY0FBYyxDQUFDO1FBRy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxjQUFjLEdBQUcsd0JBQU8sQ0FBQyxVQUFVLENBQUMsK0JBQWMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7SUFDckQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFJO1FBQ1gsSUFBSSxPQUFPLEdBQUcsSUFBSSxXQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFJO1FBQ1gsbUJBQW1CO1FBQ25CLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLGFBQWE7UUFDNUQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUM3RSxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsY0FBYyxDQUFD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