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

import * as _ from "lodash";
import {UserService} from "./UserService";
import {SpotifyService} from "../../spotify/services/SpotifyService";

let Service = (function () {
    let ServiceDirectory = [
        {prototype: UserService, instance: null},
        {prototype: SpotifyService, instance: null}
    ];

    function createInstance(prototype, constructorParams) {
        let object = new prototype(...constructorParams);
        return object;
    }

    return {
        getService: function (serviceType, ...constructorParams) {
            let service = _.find(ServiceDirectory, {prototype: serviceType});
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
export {Service}