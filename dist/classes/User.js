"use strict";
/*
 *  Created By JD.Francis on 9/26/18
 */
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v1");
class User {
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
exports.User = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGFzc2VzL1VzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUdILGdDQUFnQztBQUVoQyxNQUFhLElBQUk7SUFjYixZQUFZLFFBQVE7UUFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsb0JBQW9CLENBQUMsSUFBSTtRQUNyQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNqQztJQUNMLENBQUM7Q0FDSjtBQTFCRCxvQkEwQkMifQ==