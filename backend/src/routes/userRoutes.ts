require("dotenv").config();
import "colors";
import express, { Request, Response } from "express";
import {
	createUser,
	deleteUser,
	updateUser,
	getUser,
} from "../Controllers/userController";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
	try {
		const user = await createUser(req.body);
		res.status(201).send(user);
	} catch (error) {
		console.error(`[Error]: ${error}`.red.italic);
	}
});

router.delete("/:userId", async (req: Request, res: Response) => {
	try {
		await deleteUser(req.params.userId);
		res.status(204).send("user successfully deleted!");
	} catch (error) {
		console.error(`[Error]: ${error}`.red.italic);
	}
});

router.put("/:userId", async (req: Request, res: Response) => {
	const user = await updateUser(req.params.userId, req.body);
	res.send(user);
});

// for testing purpose this route returns a message
router.get("/:email", async (req: Request, res: Response) => {
	const user = await getUser(req.params.email);
	res.send(user);
});

export default router;
