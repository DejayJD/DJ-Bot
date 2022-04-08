"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Created By JD.Francis on 9/26/18
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.UserModel = {
    user_uuid: String,
    username: String,
    context: Schema.Types.Mixed,
    access_token: String,
    refresh_token: String,
    playlist_id: Schema.Types.Mixed,
    device_id: Schema.Types.Mixed,
    channel: Schema.Types.Mixed,
    active: Boolean,
    isDj: Boolean,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlck1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVscy9Vc2VyTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNILHFDQUFxQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBRWxCLFFBQUEsU0FBUyxHQUFHO0lBQ3JCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE9BQU8sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7SUFDM0IsWUFBWSxFQUFFLE1BQU07SUFDcEIsYUFBYSxFQUFFLE1BQU07SUFDckIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSztJQUMvQixTQUFTLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO0lBQzdCLE9BQU8sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7SUFDM0IsTUFBTSxFQUFFLE9BQU87SUFDZixJQUFJLEVBQUUsT0FBTztDQUNoQixDQUFDIn0=