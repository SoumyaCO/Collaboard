import { Router, Request, Response } from "express";
import {
	createMeeting,
	deleteMeeting,
	getAllMeeting,
	updateMeeting,
} from "../Controllers/MeetingController";
import { Meeting } from "../Models/Meeting";

const router = Router();

router.post("/createMeeting", async (req: Request, res: Response) => {
	try {
		let result = await createMeeting(req.body);
		if (result) {
			res.status(201).send({ msg: "Meeting created", error: null });
		}
	} catch (error) {
		res.status(400).send({ msg: "Bad Request", error: error });
	}
});

router.put("/updateMeeting/:meetingID", async (req: Request, res: Response) => {
	try {
		let result: boolean = await updateMeeting(req.params.meetingID, req.body);
		if (result) {
			res.status(201).send({ msg: "Updated meeting", error: null });
		}
	} catch (error) {
		res.status(400).send({ msg: "Bad Request", error: error });
	}
});

router.delete(
	"/deleteMeeting/:meetingID",
	async (req: Request, res: Response) => {
		try {
			let result: boolean = await deleteMeeting(req.params.meetingID);
			if (result) {
				res.status(201).send({ msg: "Deleted successfully", error: null });
			}
		} catch (error) {
			res.status(400).send({ msg: "Bad Request", error: error });
		}
	},
);

router.put("/getAllMeeting", async (req: Request, res: Response) => {
	try {
		let result: Meeting[] = await getAllMeeting(req.cookies.authToken);
		if (result.length != 0) {
			res.status(200).send({ msg: "Successfull", error: null, data: result });
		}
	} catch (error) {
		res.status(400).send({ msg: "Bad request", error: error });
	}
});

export default router;
