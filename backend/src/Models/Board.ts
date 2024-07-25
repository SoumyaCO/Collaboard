import mongoose from "mongoose"
export interface Board {
    time: Date,
    currentState: CanvasImageData
}

const boardSchema = new mongoose.Schema<Board>({
    time: { type: Date, default: Date.now },
    currentState: { type: String, required: true },
})

const BoardModel = mongoose.model<Board>('Board', boardSchema);
export default BoardModel;


