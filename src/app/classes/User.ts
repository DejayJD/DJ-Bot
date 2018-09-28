/*
 *  Created By JD.Francis on 9/26/18
 */

import {Track} from "./Track";
import {uuid} from 'uuid';

export class User {
    user_uuid: string; // Internal app id for tracking users
    username: string; //Will be originating from the app context (Slack, Discord, whatevs)
    context: any; //App context (slack, discord, hipchat)

    user_access_token: string; // Spotify access token
    user_refresh_token: string; // Spotify refresh token

    device_id: any; // spotify device id
    channel: any;
    team: any;

    active: boolean;
    queue: Track[];
    //Currently unused
    isDj: boolean;

    constructor(userData) {
        this.user_uuid = uuid();
        this.channel = userData['channel'];
        this.context = userData['context'];
        this.username = this.getUserNameByContext(userData);
    }

    getUserNameByContext(user) {
        if (user.context.type == 'slack') {
            return user.context.user.name;
        }
    }
}