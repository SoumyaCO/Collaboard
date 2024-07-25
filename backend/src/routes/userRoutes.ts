require("dotenv").config();
import "colors";
import express, { Request, Response } from "express";
import {
  createUser,
  deleteUser,
  updateUser,
  getUser,
} from "../Controllers/userController";
import mongoose from "mongoose";

const router = express.Router();

let conn_str: string | undefined = "";
if (process.env.NODE_ENVIRONMENT === "local") {
  conn_str = process.env.MONGO_URL_LOCAL;
  console.log(`[environment] local`.green.bold);
} else {
  conn_str = process.env.MONGO_URL_PROD;
  console.log(`[environment] production`.green.bold);
}

if (!conn_str) {
  console.error("Database connection string is undefined.".red.bold);
  process.exit(1); // Exit the process if the connection string is not defined
}

mongoose
  .connect(conn_str)
  .then(() => {
    console.log(`[Connected] connected to the database!\n`.cyan.bold);
  })
  .catch((error) => {
    console.error(`Error: ${error}`.red.italic);
  });

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
router.get("/:userId", async (req: Request, res: Response) => {
  // const user = await getUser(req.params.userId);
  // res.send(user);
  res.send(`Hello ${req.params.userId} Sir!`);
});

export default router;
