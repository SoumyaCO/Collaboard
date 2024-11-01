import { Socket } from "socket.io";
import { User } from "../Models/User";
import { io } from "../index";
import jwt from "jsonwebtoken";
import { ExtendedError } from "socket.io/dist/namespace";
import { redisClient, connectRedis, disconnectRedis } from "../db/redis";
const EXPIRE_TIME = 300; // (in seconds) 5 minutes

export interface RoomData {
	id: string;
}

export interface Message {
	clientID?: string;
	roomID?: string;
	message: string;
	allow?: boolean;
	drawingStack?: JSON[];
}

/**
 * Checks for already exsisting room and then creates a room
 * @param data: a room id basically
 * @param client :Socket - socket.io socket instance
 */

export async function createRoom(client: Socket, data: any) {
	client.join(data.id);
	await connectRedis(redisClient);
	const meeting_key = `meeting:${data.id}`;
	const members_key = `${data.id}:members`;
	const meeting_info = {
		ownerSocketID: client.id,
		ownerUserName: client.handshake.auth.username,
		createdAt: Date.now(),
	};
	const new_member = {
		username: client.handshake.auth.username,
		dp_url: client.handshake.auth.dp_url as string,
		full_name: client.handshake.auth.fullname,
	};

	await redisClient.hSet(meeting_key, meeting_info);
	await redisClient.sAdd(members_key, JSON.stringify(new_member));
	console.log(`${new_member.username}[admin] added to the meeting`);
}

/**
 * Joins a room with given room code (specified by user)
 * @param client: Socket object (from socket.io)
 * @param data: any received from the client
 */

async function joinRoom(client: Socket, roomID: string) {
	client.join(roomID); // joins the client to the room
	const meeting_key = `meeting:${roomID}`;
	const members_key = `${roomID}:members`;
	const new_member = {
		username: client.handshake.auth.username,
		dp_url: client.handshake.auth.dp_url,
		full_name: client.handshake.auth.fullname,
	};

	await redisClient.exists(meeting_key);
	try {
		const reply = await redisClient.exists(meeting_key);
		if (reply == 1) {
			await redisClient.sAdd(members_key, JSON.stringify(new_member));
			console.log(`${new_member.username}[member] added to the meeting`);
            // notify all the members
			let members = await getAllUsers(roomID);
			client.to(roomID).emit("on-users-list", { members: members });
		} else {
			console.log(`[error] room id ${roomID} does not exist`);
		}
	} catch (error) {
		console.log(
			`error fetching existance of roomID ${roomID} from redis`,
			error,
		);
	}
}

/**
 * Query the rooms collection and finds the admin socket id of a specific room.
 * @param {string} roomId - room id of the room
 * @return {Promise<Room>} adminSocketId - socket id of the admin (socket.io)
 */
async function getAdmin(roomId: string): Promise<string> {
	try {
		const meeting_key = `meeting:${roomId}`;
		const adminSocketID = await redisClient.hGet(meeting_key, "ownerSocketID");
		if (!adminSocketID) {
			console.log("Admin not found");
		} else {
			return adminSocketID as unknown as string;
		}
	} catch (error) {
		console.log("[Error] Error fetching admin");
	}

	console.error("can't find the admin, maybe not yet joined");
	return "can't find the admin";
}

/**
 * Query the redis db for all the users in the meeting
 */
export interface UsersInMeeting {
	name: string;
	photo: string;
	role: string;
}

/**
 * Query for all the users in the meeting
 * @param {string} roomID - room id of the client/owner requesting
 */
export async function getAllUsers(roomID: string): Promise<string[]> {
	const members_key = `${roomID}:members`;

	try {
		let members = await redisClient.sMembers(members_key);
		console.log("Triggered, here are members: \n", members);
		return members;
	} catch (error) {
		console.log("[Error] Error getting users");
		return [];
	}
}

/* Socket event handlers */

/**
 * Handles "on-drawing" event coming from client when updating the drawing stack
 * @param {Socket} socket - socket object
 * @param {String} roomID - room data
 * @param {Message} message - payload coming from client
 */
function onDrawingHandler(socket: Socket, roomID: string, message: Message) {
	socket.broadcast.to(roomID).emit("draw-on-canvas", message);
}

/**
 * Permission handler - triggered after getting permission from admin
 * @param {Message} message - message got from admin
 * @param {Socket} client - socket
 */
export function onPermissionHandler(message: Message, client: Socket) {
	if (message.allow) {
		try {
			joinRoom(client, message.roomID as string);
			io.to(client.id).emit("permission-from-admin", message);
		} catch (error) {
			console.log("Error while permission handling: ", error);
		}
	} else {
		try {
			// disconnect if it's joined
			client.disconnect();
			io.to(client.id as string).emit("permission-from-admin", message);
		} catch (error) {
			console.log("Error while permission handling: ", error);
		}
	}
}

/**
 * Handles "create-room" event coming from client when creating a room
 * @param {Socket} socket - socket object
 * @param {RoomData} data - room data
 */
export function createRoomHandler(socket: Socket, data: RoomData) {
	createRoom(socket, data);
	socket.on("on-drawing", (message: Message) => {
		onDrawingHandler(socket, data.id, message);
	});

	socket.on("permission", (message: Message) => {
		io.to(message.clientID as string).emit("event", message);
	});

	socket.on("chat-message", (message: Message) => {
		socket.broadcast.to(message.roomID as string).emit("send-message", message);
	});

	socket.on("get-all-users", async () => {
		let members = await getAllUsers(data.id);
		socket.to(data.id).emit("on-users-list", { members: members });
	});

	socket.on("disconnect", async function () {
		// NOTE: Often time, the "disConnetRedis()" function throws an error,
		// keeping the the two segment inside a try catch statement will prevent
		// to apply an "expiry" timer to the meeting.
		// So, these two operations are in a seperate try..catch.. block (intentionally)
		try {
			const meeting_key = `meeting:${data.id}`;
			const members_key = `${data.id}:members`;
			await redisClient.expire(meeting_key, EXPIRE_TIME);
			await redisClient.expire(members_key, EXPIRE_TIME);
			// inform all the members
			let members = await getAllUsers(data.id);
			socket.to(data.id).emit("on-users-list", { members: members });
		} catch (error) {
			console.log("[error] while adding expiry to the meeting");
		}

		try {
			console.log(
				`[disconnect] ${socket.handshake.auth.username} disconnected`,
			);
			await disconnectRedis(redisClient);
		} catch (error) {
			console.log("[error mild] while disconnecting the admin");
		}
	});
}

/**
 * Handles "join-room" event when client tries to join a room
 * It handles
 *	- 1. join-room event
 *	- 2. emits new-joiner-alert
 *	- 3. emits
 * @param {RoomData} data - data about the room
 * @param {Socket} client - socket
 */
export async function joinRoomHandler(client: Socket, data: RoomData) {
	// get the admin id of the room
	let adminID = await getAdmin(data.id);

	// passing the socket object as a data
	io.to(adminID as string).emit("new-joiner-alert", {
		username: client.handshake.auth.username,
		roomID: data.id,
		clientID: client.id,
	});

	client.on("event", (message) => {
		onPermissionHandler(message, client);
	});

	client.on("on-drawing", (message: Message) => {
		onDrawingHandler(client, data.id, message);
	});

	client.on("get-all-users", async () => {
		let members = await getAllUsers(data.id);
		client.to(data.id).emit("on-users-list", { members: members });
	});

	client.on("disconnect", async function () {
		try {
			console.log(
				`[disconnect] ${client.handshake.auth.username} disconnected`,
			);
			await redisClient.sRem(
				`${data.id}:members`,
				JSON.stringify({
					username: client.handshake.auth.username,
					dp_url: client.handshake.auth.dp_url,
					full_name: client.handshake.auth.fullname,
				}),
			);
            // notify all the members
			let members = await getAllUsers(data.id);
			client.to(data.id).emit("on-users-list", { members: members });
		} catch (error) {
			console.log("[error mild] while disconnecting redis client");
		}
	});

	/* Send the roomID and also the client who sent it */
	client.on("chat-message", async (message: Message) => {
		client.broadcast.to(message.roomID as string).emit("send-message", message);
	});
}

/* Socket Middleware */

/**
 * Checks a token is valid or not
 * @param token - token getting from socket.hadnshake
 * @returns verified - verified user _id
 *
 */
function isvalidToken(token: string) {
	const verified = jwt.verify(token, process.env.JWT_PASS as string) as User;
	return verified;
}

/**
 * Socket authentication middleware
 * Checks for jwt token in socket.handshake object everytime
 * and validates the user
 * @param socket - Socket object
 * @param next - Function which passes the error
 * @tutorial https://socket.io/docs/v4/middlewares/
 */
export function socketAuthMiddleware(
	socket: Socket,
	next: (err?: ExtendedError | Error) => void,
) {
	try {
		let token = socket.handshake.auth.token;
		if (!token) {
			throw new Error("Missing Token");
		}
		if (!isvalidToken(token)) {
			throw new Error("Invalid Token");
		}
		next();
	} catch (error) {
		console.error("Authentication error", error);
		next(new Error("Authentication error"));
	}
}
