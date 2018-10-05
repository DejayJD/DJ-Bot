/*
 *  Created By JD.Francis on 9/26/18
 */

export class UserModel {
    user_uuid: string; // Internal app token for tracking users
    username: string; //Will be originating from the app context (Slack, Discord, whatevs)
    context: any; //App context (slack, discord, hipchat)
    user_access_token: string; // Spotify access token
    user_refresh_token: string; // Spotify refresh token
    playlist_id: any; // id of their playlist queue
    device_id: any; // spotify device id
    channel: any; // channel that user is a part of

    active: boolean; // if the user is active/inactive and should receive song sync updates
    //Currently unused
    isDj: boolean;
}