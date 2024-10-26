import { MeetingModel, Meeting } from "../Models/Meeting"
import jwt from "jsonwebtoken"
import { redisClient } from "../db/redis"
import UserModel, { User } from "../Models/User"

interface DecodedToken {
    _id: string
}

// TODO: for now, we don't need this
//interface meetingInfo {
//	title: string;
//	meeting_id: string;
//	expiry_date: Date;
//	owner_username: string;
//}

/**
 * Link response interface
 */
export interface LinkResponse {
    valid: boolean
    admin: boolean
    id: string | null
    adminIn: boolean
}

async function jwtEncr(info: Partial<Meeting>): Promise<string> {
    const encr_url = jwt.sign(
        info,
        process.env.MEETING_ENCR_PASS as string
    ) as string
    return encr_url
}

/**
 * Creates a new Meeting in DB
 * @param meeting - meeting object
 * @returns Promise<boolean> - is successful or not
 */
export async function createMeeting(
    meeting: Partial<Meeting>
): Promise<boolean> {
    try {
        const encr_url = await jwtEncr(meeting)
        const meeting_info: Partial<Meeting> = {
            ownerUsername: meeting.ownerUsername,
            title: meeting.title,
            meetingID: meeting.meetingID,
            link: encr_url,
        }
        const meet = new MeetingModel(meeting_info)
        await meet.save()
        console.log("meeting [created]".green.italic)
    } catch (err) {
        console.log(`Error: ${err}`.red.bold)
        return false
    }

    return true
}

/**
 * Gets all the Meetings under a person(user)
 * @param authToken - cookie (for verification, and userId)
 * @returns Promise<Meeting[]> - list of meetings under that username
 */
export async function getAllMeeting(authToken: string): Promise<Meeting[]> {
    try {
        // verification for the user, also getting the userid to query for meeting under his/her name
        let verified: DecodedToken = jwt.verify(
            authToken,
            process.env.JWT_PASS as string
        ) as DecodedToken

        let id = verified._id
        let user = (await UserModel.find({
            _id: id,
        })) as unknown as [User]

        let meetings = await MeetingModel.find({
            ownerUsername: user[0].username as unknown as [User],
        })
        return meetings
    } catch (error) {
        console.log("Error getting meetings", error)
        return []
    }
}

/**
 * Get just one meeting detail
 * @param {string} meetingID
 * @returns {Promise<[Meeting, boolean]>} meeting, isSuccessful
 */
export async function getOneMeeting(
    meetingID: string
): Promise<Meeting | undefined> {
    try {
        const meeting = (await MeetingModel.findOne({
            meetingID: meetingID,
        })) as Meeting
        return meeting
    } catch (error) {
        return undefined
    }
}

/**
 * Deletes a new Meeting in DB
 * @param meetingID - meetingID
 * @returns Promise<boolean> - is successful or not
 */
export async function deleteMeeting(meetingID: string): Promise<boolean> {
    try {
        let res = await MeetingModel.deleteOne({ meetingID })
        // I know that's rare (as we'll handle the deletion of meetings from a strict interface,
        // But just making sure, to have errors in the places of errors for future debugging helps)
        if (res.deletedCount != 0) {
            console.log("meeting [deleted]".red.italic)
            return true
        } else {
            console.log(
                "Error deleting the meeting (maybe meeting doesent exist)"
            )
            return false
        }
    } catch (error) {
        console.log("Error deleting Meeting: ", error)
        return false
    }
}

/**
 * Updates a new Meeting in DB
 * @param meetingID - meetingID
 * @param updateData - data
 * @returns Promise<boolean> - is successful or not
 */
export async function updateMeeting(
    meetingID: string,
    updateData: Partial<Meeting>
): Promise<boolean> {
    try {
        let res = await MeetingModel.findOneAndUpdate({ meetingID }, updateData)
        if (res) {
            console.log("meeting [updated]".yellow.italic)
            return true
        } else {
            console.log("Error updating meeting (maybe meeting doesent exist)")
            return false
        }
    } catch (error) {
        console.log("Error updating meeting: ", error)
    }
    return true
}

/**
 * joins via link
 * 1. validates the jwt,
 * 2. sends a response {LinkResponse}
 * @param {string} meet_token - token for joining the room
 * @returns {LinkResponse} - in response to the req. of joining
 */
export async function joinViaLink(
    meet_token: string,
    authToken: string
): Promise<LinkResponse> {
    let meeting = jwt.verify(
        meet_token,
        process.env.MEETING_ENCR_PASS as string
    ) as unknown as Meeting

    const meeting_key = `meeting:${meeting.meetingID}`
    let verified: DecodedToken = jwt.verify(
        authToken,
        process.env.JWT_PASS as string
    ) as DecodedToken

    let id = verified._id

    // TODO: Bind the username also with the authToken, so that we can avoid
    // the mongodb query (it'll be faster)
    let user = (await UserModel.find({
        _id: id,
    })) as unknown as [User]

    try {
        if (user[0].username == meeting.ownerUsername) {
            return {
                valid: true,
                admin: true,
                id: meeting.meetingID,
                adminIn: false,
            }
        } else {
            const reply = await redisClient.exists(meeting_key)
            if (reply == 1) {
                return {
                    valid: true,
                    admin: false,
                    id: meeting.meetingID,
                    adminIn: true,
                }
            } else {
                return {
                    valid: true,
                    admin: false,
                    id: meeting.meetingID,
                    adminIn: false,
                }
            }
        }
    } catch (error) {
        console.log(
            `error fetching existance of roomID ${meeting.meetingID} from redis`
        )
        return { valid: false, admin: false, id: null, adminIn: false }
    }
}
