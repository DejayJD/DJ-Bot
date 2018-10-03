"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const _ = require("lodash");
class DatabaseService {
    constructor() {
    }
    setupConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dbConnection = yield mongoose_1.mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
            return this.dbConnection;
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (_.isNil(this.dbConnection)) {
                return this.setupConnection();
            }
            else {
                return this.dbConnection;
            }
        });
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YWJhc2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0RhdGFiYXNlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsdUNBQWtDO0FBQ2xDLDRCQUE0QjtBQUU1QixNQUFhLGVBQWU7SUFFeEI7SUFDQSxDQUFDO0lBRUssZUFBZTs7WUFDakIsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLG1CQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUMsZUFBZSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDM0YsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzdCLENBQUM7S0FBQTtJQUVLLGFBQWE7O1lBQ2YsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDakM7aUJBQ0k7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO2FBQzVCO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUFsQkQsMENBa0JDIn0=