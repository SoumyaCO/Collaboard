import mongoose from "mongoose"

export interface Meeting {
    ownerUsername: string // owner/admin --> the username will be pushed here
    title: string
    date: Date
    meetingID: string
    link: string
}

const meetingSchema = new mongoose.Schema<Meeting>({
    ownerUsername: { type: String, required: true },
    title: { type: String },
    date: { type: Date },
    meetingID: { type: String, unique: true },
    link: { type: String, unique: true },
})

export const MeetingModel = mongoose.model<Meeting>("Meeting", meetingSchema)
