"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const boardSchema = new mongoose_1.default.Schema({
    time: { type: Date, default: Date.now },
    currentState: { type: String, required: true },
});
const BoardModel = mongoose_1.default.model('Board', boardSchema);
exports.default = BoardModel;
