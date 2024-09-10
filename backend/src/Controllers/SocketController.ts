import { Socket } from "socket.io";
import RoomModel from "../Models/Room";
import { User } from "../Models/User";
import { io } from "../index";
import jwt from "jsonwebtoken";
import { ExtendedError } from "socket.io/dist/namespace";

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
	console.log(
		`[ADMIN CREATED} ${client.handshake.auth.username} created the room: ${data.id}`,
	);

	await RoomModel.create({
		roomId: data.id,
		adminId: client.id,
		members: [client.handshake.auth.username],
	});
}

/**
 * Joins a room with given room code (specified by user)
 * @param client: Socket object (from socket.io)
 * @param data: any received from the client
 */

async function joinRoom(client: Socket, roomID: string) {
	let isExist = await RoomModel.findOne({ roomId: roomID });
	if (!isExist) {
		console.log("room does not exists");
	} else {
		await RoomModel.updateOne(
			{ roomId: roomID },
			{ $push: { members: client.handshake.auth.username } },
		);
		client.join(roomID);
		console.log(
			`[MEMBER JOINED] ${client.handshake.auth.username} joined the room: ${roomID}`,
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
		const room = await RoomModel.findOne({ roomId: roomId });

		return room?.adminId ?? "not found";
	} catch (error) {
		console.error("Error fetching admin: ", error);
		throw new Error("Failed to fetch admin ID");
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
		id: client.handshake.auth.username,
		roomID: data.id,
		clientID: client.id,
	});

	client.on("event", (message) => {
		onPermissionHandler(message, client);
	});

	client.on("on-drawing", (message: Message) => {
		onDrawingHandler(client, data.id, message);
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
		const token = socket.handshake.auth.token;
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
