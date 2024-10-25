import mongoose from "mongoose";
import request from "supertest";

import { httpServer } from "../../src/index";
import { randomUserName } from "../test_utils/random";

/* Connecting to the databas before each test. */
beforeEach(async () => {
	let connStr = process.env.MONGO_URL_LOCAL;
	if (connStr == undefined) {
		console.log("problem in connStr");
	} else {
		await mongoose.connect(connStr);
	}
});

/* Closing database connection after each test. */
afterEach(async () => {
	await mongoose.connection.close();
	httpServer.close();
});

/*
 * Check for create, delete and update meeting routes
 * STEPS:
 * 1. Create new meeting
 * 2. update the meeting
 * 3. Search for that updation in database
 * 4. Delete the meeting (to keep the db clean)
 * TODO: figure out how to mock the DB to test while CI with jenkins/github actions
 */

describe("Create, Update, Get and Delete of Meeting data", () => {
	const meetingID = randomUserName(20);
	it("should create a random user", async () => {
		const res = await request(httpServer).post("/meeting/createMeeting").send({
			ownerUsername: "username",
			title: "New Meeting",
			date: "2024-10-24T06:01:29.133Z",
			meetingID: meetingID,
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toBeDefined();
	});

	it("should update the user", async () => {
		const res = await request(httpServer)
			.put(`/meeting/updateMeeting/${meetingID}`)
			.send({
				title: "Updated Meeting",
				date: "2009-11-11T06:01:29.133Z",
			});
		expect(res.statusCode).toBe(201);
	});

	it("Should delete the data successfully", async () => {
		const res = await request(httpServer).delete(
			`/meeting/deleteMeeting/${meetingID}`,
		);
		// FIXME: Should return 200 IG
		expect(res.statusCode).toBe(201);
	});

	// cookie based auth will happen in the backend
	// INFO: getAllMeetings route, automatically get the meetings under that very person
});
