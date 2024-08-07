import { io as ioc, Socket } from "socket.io-client";

describe("Basic Socket Events Test", () => {
	let socket: Socket;

	beforeAll((done) => {
		jest.setTimeout(60000);
		socket = ioc(`http://localhost:8080`, {
			auth: {
				"username": "soumyadip"
			}
		});
		socket.on("connect", done);
	});

	afterAll(() => {
		socket.disconnect();
	});

	// test for creating a room
	test("Creating a room", (done) => {
		socket.emit("create-room", { id: "test-room-from-dev" }, (res: any) => {
			expect(res.cb_msg).toBe("room created test-room-from-dev");
			done();
		});
	});

	// test for joining a room
	//	test("joining to a room", (done) => {
	//		socket.emit("join-room", { id: "test-room-from-dev" }, (res: any) => {
	//			expect(res.cb_msg).toBe("imageString sending");
	//			done();
	//		});
	//	});
});
