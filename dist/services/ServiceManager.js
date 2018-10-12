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
const ChannelService_1 = require("./ChannelService");
let Service = (function () {
    let ServiceDirectory = [
        { prototype: UserService_1.UserService, instance: null },
        { prototype: SpotifyService_1.SpotifyService, instance: null },
        { prototype: ChannelService_1.ChannelService, instance: null },
    ];
    function createInstance(prototype, constructorParams) {
        return new prototype(...constructorParams);
    }
    return {
        getService: function (serviceType, ...constructorParams) {
            let service = _.find(ServiceDirectory, { prototype: serviceType });
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
let userService = Service.getService(UserService_1.UserService);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmljZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvU2VydmljZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7O0FBRUgsNEJBQTRCO0FBQzVCLCtDQUEwQztBQUMxQyxxREFBZ0Q7QUFDaEQscURBQWdEO0FBRWhELElBQUksT0FBTyxHQUFHLENBQUM7SUFDWCxJQUFJLGdCQUFnQixHQUFHO1FBQ25CLEVBQUMsU0FBUyxFQUFFLHlCQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztRQUN4QyxFQUFDLFNBQVMsRUFBRSwrQkFBYyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7UUFDM0MsRUFBQyxTQUFTLEVBQUUsK0JBQWMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO0tBQzlDLENBQUM7SUFFRixTQUFTLGNBQWMsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCO1FBQ2hELE9BQU8sSUFBSSxTQUFTLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxPQUFPO1FBQ0gsVUFBVSxFQUFFLFVBQVUsV0FBVyxFQUFFLEdBQUcsaUJBQWlCO1lBQ25ELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEdBQUcsV0FBVyxDQUFDLENBQUM7YUFDbEU7WUFDRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzQixPQUFPLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQzthQUM5RTtZQUNELE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUM1QixDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFHRywwQkFBTztBQURmLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxDQUFDIn0=