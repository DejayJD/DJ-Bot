"use strict";
/*
    This class is effectively a "Service Factory" that will create and manage
    singleton service objects.

    Example usage (recommended to do it in a constructor):

    constructor() {
        this.userService = Service.getService(UserService);
        or
        (with constructor parameters)
        this.userService = Service.getService(UserService, 'constructor arg 1', 'arg 2');
    }

    Small issue -
        if you are just using getInstance(service) with no params to get an object that does have params
        it will only work if the object has already been created, otherwise it will create object
        without any params which will mess it up

 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const UserService_1 = require("./UserService");
const SpotifyService_1 = require("../../spotify/services/SpotifyService");
let Service = (function () {
    let ServiceDirectory = [
        { prototype: UserService_1.UserService, instance: null },
        { prototype: SpotifyService_1.SpotifyService, instance: null }
    ];
    function createInstance(prototype, constructorParams) {
        return new prototype(...constructorParams);
    }
    return {
        getService: function (serviceType, ...constructorParams) {
            let service = _.find(ServiceDirectory, { prototype: serviceType });
            // console.log(ServiceDirectory);
            if (_.isNil(service)) {
                console.error("Unable to find service of type " + serviceType);
            }
            if (_.isNil(service.instance)) {
                service.instance = createInstance(service['prototype'], constructorParams);
            }
            return service.instance;
        }
    };
})();
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmljZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2VzL1NlcnZpY2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHOztBQUVILDRCQUE0QjtBQUM1QiwrQ0FBMEM7QUFDMUMsMEVBQXFFO0FBRXJFLElBQUksT0FBTyxHQUFHLENBQUM7SUFDWCxJQUFJLGdCQUFnQixHQUFHO1FBQ25CLEVBQUMsU0FBUyxFQUFFLHlCQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztRQUN4QyxFQUFDLFNBQVMsRUFBRSwrQkFBYyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7S0FDOUMsQ0FBQztJQUVGLFNBQVMsY0FBYyxDQUFDLFNBQVMsRUFBRSxpQkFBaUI7UUFDaEQsT0FBTyxJQUFJLFNBQVMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELE9BQU87UUFDSCxVQUFVLEVBQUUsVUFBVSxXQUFXLEVBQUUsR0FBRyxpQkFBaUI7WUFDbkQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLGlDQUFpQztZQUNqQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEdBQUcsV0FBVyxDQUFDLENBQUM7YUFDbEU7WUFDRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzQixPQUFPLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzthQUM5RTtZQUNELE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUM1QixDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDRywwQkFBTyJ9