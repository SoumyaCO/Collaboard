"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.updateUser = exports.deleteUser = exports.createUser = void 0;
const User_1 = __importDefault(require("../Models/User"));
const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new User_1.default(userData);
    yield user.save()
        .then(() => {
        console.log("User Created");
    }).catch(err => {
        console.log(err);
    });
});
exports.createUser = createUser;
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield User_1.default.deleteOne({ userId });
});
exports.deleteUser = deleteUser;
const updateUser = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOneAndUpdate({ userId }, updateData, { new: true });
    return user;
});
exports.updateUser = updateUser;
const getUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ userId });
    return user;
});
exports.getUser = getUser;
