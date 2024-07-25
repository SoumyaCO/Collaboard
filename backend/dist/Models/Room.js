"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Board_1 = __importDefault(require("./Board"));
const User_1 = __importDefault(require("./User"));
const roomSchema = new mongoose_1.default.Schema({
    adminID: { type: String, required: true, unique: true },
    members: { type: [User_1.default], required: true },
    board: { type: Board_1.default, required: true }
});
const RoomModel = mongoose_1.default.model('User', roomSchema);
exports.default = RoomModel;
