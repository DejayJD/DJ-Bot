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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvY2xhc3Nlcy9Vc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFHSCxnQ0FBZ0M7QUFFaEMsTUFBYSxJQUFJO0lBY2IsWUFBWSxRQUFRO1FBQ2hCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELG9CQUFvQixDQUFDLElBQUk7UUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDakM7SUFDTCxDQUFDO0NBQ0o7QUExQkQsb0JBMEJDIn0=