/*
 *  Created By JD.Francis on 9/27/18
 */

export class Track {
    uri: string;
    startTime?: Date;
    timer? : any;
    duration_ms? : any;

    //TODO: Planning to use these eventually
    albumImg?: string;
    emotes?: any[]; // emotes that the track received
    endTime?: Date;
}