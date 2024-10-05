import { MeetingModel, Meeting } from "../Models/Meeting";
import jwt from "jsonwebtoken";

interface DecodedToken {
	_id: string;
}

interface meetingInfo {
	title: string;
	meeting_id: string;
	expiry_date: Date;
	owner_username: string;
}

async function jwtEncr(info: meetingInfo): Promise<string> {
	const encr_url = jwt.sign(
		info,
		process.env.MEETING_ENCR_PASS as string,
	) as string;
	return encr_url;
}

/**
 * Creates a new Meeting in DB
 * @param meeting - meeting object
 * @returns Promise<boolean> - is successful or not
 */
export async function createMeeting(
	meeting: Partial<Meeting>,
): Promise<boolean> {
	try {
		const meet = new MeetingModel(meeting);
		await meet.save();
		console.log("meeting [created]".green.italic);
	} catch (err) {
		console.log(`Error: ${err}`.red.bold);
		return false;
	}

	return true;
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
			process.env.JWT_PASS as string,
		) as DecodedToken;

		let id = verified._id;

		let meetings = await MeetingModel.find({ _id: id });
		return meetings;
	} catch (error) {
		console.log("Error getting meetings", error);
		return [];
	}
}

/**
 * Deletes a new Meeting in DB
 * @param meetingID - meetingID
 * @returns Promise<boolean> - is successful or not
 */
export async function deleteMeeting(meetingID: string): Promise<boolean> {
	try {
		let res = await MeetingModel.deleteOne({ meetingID });
		// I know that's rare (as we'll handle the deletion of meetings from a strict interface,
		// But just making sure, to have errors in the places of errors for future debugging helps)
		if (res.deletedCount != 0) {
			console.log("meeting [deleted]".red.italic);
			return true;
		} else {
			console.log("Error deleting the meeting (maybe meeting doesent exist)");
			return false;
		}
	} catch (error) {
		console.log("Error deleting Meeting: ", error);
		return false;
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
	updateData: Partial<Meeting>,
): Promise<boolean> {
	try {
		let res = await MeetingModel.findOneAndUpdate({ meetingID }, updateData);
		if (res) {
			console.log("meeting [updated]".yellow.italic);
			return true;
		} else {
			console.log("Error updating meeting (maybe meeting doesent exist)");
			return false;
		}
	} catch (error) {
		console.log("Error updating meeting: ", error);
	}
	return true;
}
