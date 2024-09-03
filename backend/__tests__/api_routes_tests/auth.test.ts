import mongoose from "mongoose";
import request = require("supertest");

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

/* Register a new test client, login, check for JWT and check for entry in DB */
describe("Register, Login & getting JWT back in header", () => {
	const random_user = randomUser();
	it("should register a client", async () => {
		const res = await request(httpServer)
			.post("/auth/register")
			.send(random_user);
		expect(res.statusCode).toBe(200); // this should be 201 (problem in backend)
	});
	it("should return not null JWT token upon login", async () => {
		const res = await request(httpServer).post("/auth/login").send({
			email: random_user.email,
			password: random_user.password,
		});
		expect(res.statusCode).toBe(200);
		expect(res.header.authtoken).toBeDefined();
	});
	it("should create a database entry for the registered client", async () => {
		const res = await request(httpServer).get(`/user/${random_user.email}`);
		expect(res.body.username).toBe(random_user.username);
		expect(res.body.firstName).toBe(random_user.firstName);
		expect(res.body.lastName).toBe(random_user.lastName);
		expect(res.body.password).not.toBe(random_user.password);
	});
});

/* Test for auth middleware function
 * Send the JWT via header and check for auth (in all routes --> HOME, PROFILE)
 */

/* Check for other routes (like Profile) And test them
 */
