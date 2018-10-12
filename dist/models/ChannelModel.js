"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Created By JD.Francis on 9/27/18
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.ChannelModel = {
    channel_id: String,
    channel_name: String,
    current_song: {
        uri: String,
        start_time: Date,
        duration_ms: Number
    },
    dj_queue: Schema.Types.Mixed,
    channel_listeners: Schema.Types.Mixed,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbE1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9DaGFubmVsTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNILHFDQUFxQztBQUVyQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBR2xCLFFBQUEsWUFBWSxHQUFHO0lBQ3hCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFlBQVksRUFBRTtRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsVUFBVSxFQUFFLElBQUk7UUFDaEIsV0FBVyxFQUFFLE1BQU07S0FDdEI7SUFDRCxRQUFRLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO0lBQzVCLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSztDQUN4QyxDQUFDIn0=