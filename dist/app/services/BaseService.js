"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = (function () {
    let instance;
    function createInstance() {
        let object = new Object("I am the instance");
        return object;
    }
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2VzL0Jhc2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQVcsUUFBQSxXQUFXLEdBQUcsQ0FBQztJQUN0QixJQUFJLFFBQVEsQ0FBQztJQUViLFNBQVMsY0FBYztRQUNuQixJQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxPQUFPO1FBQ0gsV0FBVyxFQUFFO1lBQ1QsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDWCxRQUFRLEdBQUcsY0FBYyxFQUFFLENBQUM7YUFDL0I7WUFDRCxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMifQ==