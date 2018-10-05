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
const SpotifyWebApi = require("spotify-web-api-node");
const _ = require("lodash");
class SpotifyService {
    constructor(userService) {
        this.userService = userService;
        this.spotifyApiObj = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT
        });
    }
    spotifyApi(user, method, ...params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.spotifyApiObj.setAccessToken(user['access_token']);
            try {
                let data = yield this.spotifyApiObj[method](...params);
                return data;
            }
            catch (e) {
                // If the error is caused by a 401, its probably cause token expired.
                // This tries refreshing and then attempting again
                // If that also fails it errors out completely
                if (e.statusCode === 401 && user['refresh_token'] != null) {
                    this.spotifyApiObj.setRefreshToken(user['refresh_token']);
                    try {
                        let newToken = (yield this.spotifyApiObj.refreshAccessToken()).body.access_token;
                        this.userService.updateUser(user, { access_token: newToken });
                        this.spotifyApiObj.setAccessToken(newToken);
                        let data = yield this.spotifyApiObj[method](...params);
                        return data;
                    }
                    catch (e2) {
                        console.error(e2);
                        console.error('Unable to refresh token and call method again. Userdata = ');
                        console.error(user);
                    }
                }
                console.error(e);
            }
        });
    }
    setAccessToken(user) {
        this.spotifyApiObj.setAccessToken(user['access_token']);
        this.spotifyApiObj.setRefreshToken(user['refresh_token']);
    }
    addToUserPlaylist(userId, trackData, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = _.find(this.userService.users, (data) => {
                return data['context']['user']['id'] === userId && data['context']['type'] == context;
            });
            this.setAccessToken(user);
            let playlist_id = user['playlist_id'];
            try {
                yield this.spotifyApi(user, 'addTracksToPlaylist', playlist_id, [trackData['value']], { position: 0 });
            }
            catch (e) {
                console.error("Unable to add track to playlist user=");
                console.error(user);
                console.error(e);
            }
        });
    }
}
exports.SpotifyService = SpotifyService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3BvdGlmeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvU3BvdGlmeVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHNEQUFxRDtBQUNyRCw0QkFBNEI7QUFJNUIsTUFBYSxjQUFjO0lBSXZCLFlBQVksV0FBd0I7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQztZQUNuQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7WUFDdkMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCO1lBQy9DLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtTQUM1QyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUssVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNOztZQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN4RCxJQUFJO2dCQUNBLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUN2RCxPQUFPLElBQUksQ0FBQzthQUNmO1lBQ0QsT0FBTyxDQUFDLEVBQUU7Z0JBQ04scUVBQXFFO2dCQUNyRSxrREFBa0Q7Z0JBQ2xELDhDQUE4QztnQkFDOUMsSUFBSSxDQUFDLENBQUMsVUFBVSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksSUFBSSxFQUFFO29CQUN2RCxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztvQkFDMUQsSUFBSTt3QkFDQSxJQUFJLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQzt3QkFDakYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUMsWUFBWSxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7d0JBQzNELElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUM1QyxJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQzt3QkFDdkQsT0FBTyxJQUFJLENBQUM7cUJBQ2Y7b0JBQ0QsT0FBTyxFQUFFLEVBQUU7d0JBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO3dCQUM1RSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUN2QjtpQkFDSjtnQkFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BCO1FBQ0wsQ0FBQztLQUFBO0lBRUQsY0FBYyxDQUFDLElBQUk7UUFDZixJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUssaUJBQWlCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPOztZQUM5QyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDO1lBQzFGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUE7YUFDdkc7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7Z0JBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEI7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQTlERCx3Q0E4REMifQ==