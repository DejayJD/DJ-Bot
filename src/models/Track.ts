/*
 *  Created By JD.Francis on 9/27/18
 */
import {User} from "./User";

export class Track {
    uri: string;
    startTime?: Date;
    timer? : any;
    duration_ms? : any;

    //TODO: Planning to use these eventually
    listeners?: User[];
    albumImg?: string;
    emotes?: any[]; // emotes that the track received
    endTime?: Date;
}