require("dotenv").config();
import "colors";
import express, { Request, Response } from "express";
import { deleteUser, updateUser, getUser } from "../Controllers/userController";

const router = express.Router();

router.delete("/:username", async (req: Request, res: Response) => {
	try {
		const result = await deleteUser(req.params.username);
		if (result === 1) {
			res.status(200).send({ msg: "user successfully deleted!", error: null });
		} else {
			res.status(400).send({ msg: "No such user exist" });
		}
	} catch (error) {
		console.error(`[Error]: ${error}`.red.italic);
		res.status(500).send({ msg: "internal error", error: error });
	}
});

router.put("/:username", updateUser);

// for testing purpose this route returns a message
router.get("/:email", async (req: Request, res: Response) => {
	try {
		const user = await getUser(req.params.email);
		res.status(200).send({ msg: "user exist", data: user });
	} catch (error) {
		res.status(500).send({ msg: "server error", data: undefined });
	}
});

export default router;
