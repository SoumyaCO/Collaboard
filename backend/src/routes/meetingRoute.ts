import { Router, Request, Response } from "express";
import "colors";
import {
	createMeeting,
	deleteMeeting,
	getOneMeeting,
	getAllMeeting,
	updateMeeting,
	joinViaLink,
	LinkResponse,
} from "../Controllers/MeetingController";
import { Meeting } from "../Models/Meeting";

const router = Router();

router.post("/createMeeting", async (req: Request, res: Response) => {
  try {
    let result = await createMeeting(req.body);
    if (result) {
      res.status(201).send({ msg: "Meeting created", error: null });
    } else {
      res.status(201).send({ msg: "Database Query error", error: "DB" });
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
    } else {
      res.status(201).send({ msg: "Database Query error", error: "DB Error" });
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
      } else {
        res
          .status(201)
          .send({ msg: "Database Query error", error: "DB Error" });
      }
    } catch (error) {
      res.status(400).send({ msg: "Bad Request", error: error });
    }
  }
);

router.put("/getAllMeeting", async (req: Request, res: Response) => {
  try {
    let result: Meeting[] = await getAllMeeting(req.cookies.authToken);

    if (result.length != 0) {
      res.status(200).send({ msg: "Successfull", error: null, data: result });
    } else {
      res.status(201).send({ msg: "Database Query error", error: "DB Error" });
    }
  } catch (error) {
    res.status(400).send({ msg: "Bad request", error: error });
  }
});

router.put("/getOneMeeting", async (req: Request, res: Response) => {
	try {
		let result: Meeting | undefined = await getOneMeeting(req.body);
		if (result != undefined) {
			res.status(200).send({ msg: result, error: null });
		} else {
			res.status(400).send({ msg: "Error: Bad request", error: "Bad request" });
		}
	} catch (error) {
		res
			.status(500)
			.send({ msg: "[Server] Error getting meeting", error: error });
	}
});

/**
 *  Meeting joining via link
 * 1. validates the jwt
 * 2. query the redis
 * 3. returns the link validation and the user/admin
 */
router.post("/link", async (req: Request, res: Response) => {
	try {
		let result: LinkResponse = await joinViaLink(
			req.body,
			req.cookies.authToken,
		);
		res.status(200).send({ msg: result, error: null });
	} catch (error) {
		res.status(400).send({ msg: "Bad request", error: error });
	}
});

export default router;
