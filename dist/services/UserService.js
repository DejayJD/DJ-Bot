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
            console.log(newValues);
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
            console.log("creating new user playlist");
            return yield this.spotifyService.spotifyApi(user, 'createPlaylist', userId, this.playlistQueueName, newPlaylistOpts);
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvVXNlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDRCQUE0QjtBQUM1QixxREFBeUM7QUFDekMscURBQWdEO0FBQ2hELHFFQUFrRDtBQUNsRCxnQ0FBZ0M7QUFFaEMsTUFBYSxXQUFXO0lBS3BCO1FBSkEsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUVYLHNCQUFpQixHQUFHLGNBQWMsQ0FBQztRQUcvQixJQUFJLENBQUMsY0FBYyxHQUFHLHdCQUFPLENBQUMsVUFBVSxDQUFDLCtCQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFSyxRQUFROztZQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSx5QkFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLENBQUM7S0FBQTtJQUVELG9CQUFvQixDQUFDLElBQUk7UUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDakM7SUFDTCxDQUFDO0lBRUssVUFBVSxDQUFDLFFBQVE7O1lBQ3JCLElBQUksT0FBTyxHQUFHO2dCQUNWLFNBQVMsRUFBRSxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUM1QixPQUFPLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQztnQkFDNUIsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUM7YUFDaEQsQ0FBQztZQUNGLElBQUksTUFBTSxHQUFHLElBQUkseUJBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtZQUN6RCxJQUFJO2dCQUNBLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3ZCO1lBQ0QsT0FBTyxDQUFDLEVBQUU7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2FBQzlDO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekIsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBRUssT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLEdBQUcsV0FBVzs7WUFDNUMsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwRCxJQUFJLE1BQU0sR0FBRyxNQUFNLHlCQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNuQixPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEI7YUFDSjtRQUNMLENBQUM7S0FBQTtJQUVLLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsYUFBYTs7WUFDbEUsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsaURBQWlELEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQzdFLE9BQU87YUFDVjtZQUNELElBQUksU0FBUyxHQUFHO2dCQUNaLFlBQVksRUFBRSxZQUFZO2dCQUMxQixhQUFhLEVBQUUsYUFBYTthQUMvQixDQUFDO1lBQ0YsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUk7Z0JBQ0EsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzthQUMxQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDckMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQjtRQUNMLENBQUM7S0FBQTtJQUVLLFVBQVUsQ0FBQyxJQUFJLEVBQUUsU0FBUzs7WUFDNUIseUJBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFDLEVBQzdCO2dCQUNJLElBQUksRUFBRSxTQUFTO2FBQ2xCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQUE7SUFFSyxpQkFBaUIsQ0FBQyxJQUFJOztZQUN4QixJQUFJO2dCQUNBLDRCQUE0QjtnQkFDNUIsbUNBQW1DO2dCQUNuQyxJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxlQUFlLENBQUEsT0FBTyxDQUFDLENBQUM7Z0JBQ3JGLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BDLCtDQUErQztnQkFDL0MsSUFBSSxlQUFlLEdBQUc7b0JBQ2xCLEtBQUssRUFBRSxFQUFFO29CQUNULE1BQU0sRUFBRSxDQUFDO2lCQUNaLENBQUM7Z0JBQ0YsSUFBSSxhQUFhLENBQUM7Z0JBQ2xCLElBQUk7b0JBQ0EsYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztpQkFDM0c7Z0JBQ0QsT0FBTyxDQUFDLEVBQUU7b0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEI7Z0JBQ0QsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUM5RCxPQUFPLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDO2dCQUNuRCxDQUFDLENBQUMsQ0FBQztnQkFDSCx3RUFBd0U7Z0JBQ3hFLHdFQUF3RTtnQkFDeEUsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksZUFBZSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUN2RixlQUFlLENBQUMsTUFBTSxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUM7b0JBQ2hELGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7b0JBQ3hHLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQzFELE9BQU8sUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUM7b0JBQ25ELENBQUMsQ0FBQyxDQUFDO2lCQUNOO2dCQUNELDJFQUEyRTtnQkFDM0UsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUN4QixhQUFhLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7aUJBQ3pFO2dCQUVELE9BQU8sYUFBYSxDQUFDLEVBQUUsQ0FBQTthQUMxQjtZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztnQkFDeEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQjtRQUNMLENBQUM7S0FBQTtJQUVELFlBQVksQ0FBQyxRQUFRO1FBQ2pCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzdELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVLLGNBQWMsQ0FBQyxRQUFROztZQUN6QixJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO29CQUN6SCxPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7S0FBQTtJQUVLLFNBQVMsQ0FBQyxJQUFJOztZQUNoQixJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN0QztpQkFDSTtnQkFDRCxJQUFJLEdBQUcsWUFBWSxDQUFDO2FBQ3ZCO1lBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN6QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQUE7SUFFSyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsTUFBTTs7WUFDcEMsSUFBSSxlQUFlLEdBQUc7Z0JBQ2xCLFdBQVcsRUFBRSxvR0FBb0c7YUFDcEgsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUMxQyxPQUFPLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDekgsQ0FBQztLQUFBO0NBRUo7QUEvSkQsa0NBK0pDIn0=