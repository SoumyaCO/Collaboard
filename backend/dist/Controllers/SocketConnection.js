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
exports.createRoom = createRoom;
exports.joinRoom = joinRoom;
const Room_1 = __importDefault(require("../Models/Room"));
// TODO: add more functions here and make the index.ts less cluttered
/**
 * Checks for already exsisting room and then creates a room
 * @param data: a room id basically
 * @param client :Socket - socket.io socket instance
*/
function createRoom(client, data) {
    return __awaiter(this, void 0, void 0, function* () {
        client.join(data.id);
        console.log(`[ADMIN CREATED} ${client.handshake.auth.username} created the room: ${data.id}`);
        yield Room_1.default.create({
            roomId: data.id,
            adminId: client.id,
            members: [client.handshake.auth.username],
        }).then(() => {
            console.log("Room Created successfully in the database".green.italic);
        }).catch((error) => {
            console.log(`Error occurred ${error}`.red.underline);
        });
    });
}
/**
 * Joins a room with given room code (specified by user)
 * @param client: Socket object (from socket.io)
 * @param data: any received from the client
 */
function joinRoom(client, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let isExist = yield Room_1.default.findOne({ roomId: data.id });
        if (!isExist) {
            console.log("room does not exists");
        }
        else {
            yield Room_1.default.updateOne({ roomId: data.id }, { $push: { members: client.handshake.auth.username } });
            client.join(data.id);
            console.log(`[MEMBER JOINED] ${client.handshake.auth.username} joined the room: ${data.id}`);
        }
    });
}
