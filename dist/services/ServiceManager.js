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
const SpotifyService_1 = require("./SpotifyService");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmljZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvU2VydmljZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7O0FBRUgsNEJBQTRCO0FBQzVCLCtDQUEwQztBQUMxQyxxREFBZ0Q7QUFFaEQsSUFBSSxPQUFPLEdBQUcsQ0FBQztJQUNYLElBQUksZ0JBQWdCLEdBQUc7UUFDbkIsRUFBQyxTQUFTLEVBQUUseUJBQVcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1FBQ3hDLEVBQUMsU0FBUyxFQUFFLCtCQUFjLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztLQUM5QyxDQUFDO0lBRUYsU0FBUyxjQUFjLENBQUMsU0FBUyxFQUFFLGlCQUFpQjtRQUNoRCxPQUFPLElBQUksU0FBUyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsT0FBTztRQUNILFVBQVUsRUFBRSxVQUFVLFdBQVcsRUFBRSxHQUFHLGlCQUFpQjtZQUNuRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7WUFDakUsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsR0FBRyxXQUFXLENBQUMsQ0FBQzthQUNsRTtZQUNELElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2FBQzlFO1lBQ0QsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQzVCLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNHLDBCQUFPIn0=