import { MeetingModel, Meeting } from "../Models/Meeting";
import jwt from "jsonwebtoken";

interface DecodedToken {
	_id: string;
}

/**
 * Creates a new Meeting in DB
 * @param meeting - meeting object
 * @returns Promise<boolean> - is successful or not
 */
export async function createMeeting(
	meeting: Partial<Meeting>,
): Promise<boolean> {
	const meet = new MeetingModel(meeting);
	await meet
		.save()
		.then(() => {
			console.log("Meeting Created");
		})
		.catch((err) => {
			console.log(err);
			return false;
		});

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
		await MeetingModel.deleteOne({ meetingID });
	} catch (error) {
		console.log("Error deleting Meeting: ", error);
		return false;
	}
	return true;
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
	await MeetingModel.findOneAndUpdate({ meetingID }, updateData, {
		new: true,
	})
		.then(() => {
			console.log("meeting deleted");
		})
		.catch((error) => {
			console.log("Error updating meeting: ", error);
			return false;
		});
	return true;
}
