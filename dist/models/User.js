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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvVXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBR0gsZ0NBQWdDO0FBRWhDLE1BQWEsSUFBSTtJQWNiLFlBQVksUUFBUTtRQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxJQUFJO1FBQ3JCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztDQUNKO0FBMUJELG9CQTBCQyJ9