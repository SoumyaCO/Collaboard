import mongoose, { now } from "mongoose";

export interface Room {
    roomId: string;
    adminId: string;
    members: string[];
    createdAt: Date;
}

const roomSchema = new mongoose.Schema<Room>({
    roomId: { type: String, required: true, unique: true },
    adminId: { type: String, required: true, unique: true },
    members: { type: [String], required: true },
    createdAt: { type: Date, default: now() },
});

const RoomModel = mongoose.model<Room>("Room", roomSchema);
export default RoomModel;
