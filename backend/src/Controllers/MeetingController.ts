import { MeetingModel, Meeting } from "../Models/Meeting";
import { Room } from "../Models/Room";
import RoomModel from "../Models/Room";
import { User } from "../Models/User";

export const createMeeting = async (
	meeting: Partial<Meeting>,
): Promise<boolean> => {
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
};

export const deleteMeeting = async (meetingID: string): Promise<boolean> => {
	try {
		await MeetingModel.deleteOne({ meetingID });
	} catch (error) {
		console.log("Error deleting Meeting: ", error);
		return false;
	}
	return true;
};

export const updateMeeting = async (
	meetingID: string,
	updateData: Partial<Meeting>,
): Promise<boolean> => {
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
};
