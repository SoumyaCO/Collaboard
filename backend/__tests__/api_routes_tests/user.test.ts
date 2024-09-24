import mongoose from "mongoose";
import request from "supertest";

import { httpServer } from "../../src/index";
import { randomUser } from "../test_utils/random";

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
 * Check for update user route
 * STEPS:
 * 1. Create new user
 * 2. update the user
 * 3. Search for that updation in database
 * 4. Delete the user (to keep the db clean)
 * TODO: figure out how to mock the DB to test while CI with jenkins/github actions
 */

/* It's better to create a user for each test,
 * In that way, one test is not dependent
 * on another test or event
 */
describe("Update and Delete user", () => {
	const random_user = randomUser();
	const random_user2 = randomUser();

	it("should create a random user", async () => {
		const res = await request(httpServer)
			.post("/auth/register")
			.send(random_user);
		expect(res.statusCode).toBe(201);
		expect(res.body).toBeDefined();
	});

	it("should update the user", async () => {
		const res = await request(httpServer)
			.put(`/user/${random_user.username}`)
			.send({
				firstName: random_user2.firstName,
				lastName: random_user2.lastName,
			});
		expect(res.statusCode).toBe(201);
		expect(res.body.data).toBeDefined();
	});

	it("should create a database entry for the updated user with same id", async () => {
		const res = await request(httpServer).get(`/user/${random_user.username}`);
		expect(res.body.data.username).toBe(random_user.username);
		expect(res.body.data.firstName).toBe(random_user2.firstName);
		expect(res.body.data.lastName).toBe(random_user2.lastName);
		expect(res.body.data.email).toBe(random_user.email);
	});

	it("should delete the entry", async () => {
		const res = await request(httpServer).delete(
			`/user/${random_user.username}`,
		);
		expect(res.statusCode).toBe(200);
	});
});
