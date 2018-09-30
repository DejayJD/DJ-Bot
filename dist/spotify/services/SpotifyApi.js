"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpotifyWebApi = require("spotify-web-api-node");
class SpotifyService {
    constructor() {
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            redirectUri: process.env.SPOTIFY_REDIRECT
        });
    }
}
exports.SpotifyService = SpotifyService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3BvdGlmeUFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zcG90aWZ5L3NlcnZpY2VzL1Nwb3RpZnlBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzREFBcUQ7QUFDckQsTUFBYSxjQUFjO0lBRXZCO1FBQ0ksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGFBQWEsQ0FBQztZQUNoQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7WUFDdkMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCO1lBQy9DLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtTQUM1QyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFURCx3Q0FTQyJ9