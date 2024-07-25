import mongoose from "mongoose";
import BoardModel, { Board } from "./Board";
import UserModel, { User } from "./User";
export interface Room {
    id: string,
    adminID: string,
    adminUserID: string,
    members: User[],
    board: Board
}

const roomSchema = new mongoose.Schema<Room>({
    adminID: { type: String, required: true, unique: true },
    members: { type: [UserModel], required: true },
    board: { type: BoardModel, required: true }
})

const RoomModel = mongoose.model<Room>('User', roomSchema);
export default RoomModel;