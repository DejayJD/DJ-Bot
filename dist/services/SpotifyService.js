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
const SpotifyWebApi = require("../../spotify-web-api-node");
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
                if (e.statusCode === 403) {
                    return 'not-premium';
                }
                if (e.statusCode === 404) {
                    return 'spotify-issue';
                }
                console.error(e);
            }
        });
    }
    setAccessToken(user) {
        this.spotifyApiObj.setAccessToken(user['access_token']);
        this.spotifyApiObj.setRefreshToken(user['refresh_token']);
    }
    addToUserPlaylist(user, trackData) {
        return __awaiter(this, void 0, void 0, function* () {
            user = yield this.userService.getUser(user, 'context');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3BvdGlmeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvU3BvdGlmeVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDREQUE0RDtBQUs1RCxNQUFhLGNBQWM7SUFJdkIsWUFBWSxXQUF3QjtRQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDO1lBQ25DLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQjtZQUN2QyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7WUFDL0MsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCO1NBQzVDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFSyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU07O1lBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUk7Z0JBQ0EsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZELE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDTixxRUFBcUU7Z0JBQ3JFLGtEQUFrRDtnQkFDbEQsOENBQThDO2dCQUM5QyxJQUFJLENBQUMsQ0FBQyxVQUFVLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFJLEVBQUU7b0JBQ3ZELElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUMxRCxJQUFJO3dCQUNBLElBQUksUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO3dCQUNqRixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBQyxZQUFZLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQzt3QkFDM0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzVDLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO3dCQUN2RCxPQUFPLElBQUksQ0FBQztxQkFDZjtvQkFDRCxPQUFPLEVBQUUsRUFBRTt3QkFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLDREQUE0RCxDQUFDLENBQUM7d0JBQzVFLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3ZCO2lCQUNKO2dCQUNELElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxHQUFHLEVBQUU7b0JBQ3RCLE9BQU8sYUFBYSxDQUFDO2lCQUN4QjtnQkFDRCxJQUFJLENBQUMsQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFO29CQUN0QixPQUFPLGVBQWUsQ0FBQztpQkFDMUI7Z0JBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQjtRQUNMLENBQUM7S0FBQTtJQUVELGNBQWMsQ0FBQyxJQUFJO1FBQ2YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVLLGlCQUFpQixDQUFDLElBQUksRUFBRSxTQUFTOztZQUNuQyxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdkQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLElBQUk7Z0JBQ0EsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFBO2FBQ3ZHO1lBQ0QsT0FBTyxDQUFDLEVBQUU7Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2dCQUN2RCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BCO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUFqRUQsd0NBaUVDIn0=