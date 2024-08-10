import { Socket } from "socket.io";
import RoomModel from "../Models/Room";
import { boolean } from "joi";

// TODO: add more functions here and make the index.ts less cluttered

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
	})
		.then(() => {
			console.log("Room Created successfully in the database".green.italic);
		})
		.catch((error) => {
			console.log(`Error occurred ${error}`.red.underline);
		});
}

/**
 * Joins a room with given room code (specified by user)
 * @param client: Socket object (from socket.io)
 * @param data: any received from the client
 */

export async function joinRoom(client: Socket, data: any, callback: any) {
	let isExist = await RoomModel.findOne({ roomId: data.id });
	if (!isExist) {
		console.log("room does not exists");
		callback({
			success_msg: false, // check for this value @frontend for availability check
			cb_msg: "Room does not exist",
			imgURL: null,
		});
		client.disconnect(); // if room does not exist disconect the user from the socket
	} else {
		await RoomModel.updateOne(
			{ roomId: data.id },
			{ $push: { members: client.handshake.auth.username } },
		);

		client.join(data.id);
		console.log(
			`[MEMBER JOINED] ${client.handshake.auth.username} joined the room: ${data.id}`,
		);
		return true;
	}
}
