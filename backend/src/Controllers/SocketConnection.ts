import { Socket } from "socket.io";
import RoomModel from "../Models/Room";

// TODO: add more functions here and make the index.ts less cluttered

/**
 * Checks for already exsisting room and then creates a room
 * @param data: a room id basically
 * @param client :Socket - socket.io socket instance
 */

export async function createRoom(client: Socket, data: any, username: string) {
  client.join(data.id);
  console.log(`[ADMIN CREATED} ${username} created the room: ${data.id}`);

  await RoomModel.create({
    roomId: data.id,
    adminId: client.id,
    members: [username],
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

export async function joinRoom(client: Socket, data: any, username:string) {
  let isExist = await RoomModel.findOne({ roomId: data.id });
  if (!isExist) {
    console.log("room does not exists");
  } else {
    await RoomModel.updateOne(
      { roomId: data.id },
      { $push: { members:username } }
    );

    client.join(data.id);
    console.log(
      `[MEMBER JOINED] ${username} joined the room: ${data.id}`
    );
  }
}

/**
 * Query the rooms collection and finds the admin socket id of a specific room.
 * @param {string} roomId - room id of the room
 * @return {Promise<Room>} adminSocketId - socket id of the admin (socket.io)
 */
export async function getAdmin(roomId: string): Promise<string> {
  try {
    const room = await RoomModel.findOne({ roomId: roomId });

    return room?.adminId ?? "not found";
  } catch (error) {
    console.error("Error fetching admin: ", error);
    throw new Error("Failed to fetch admin ID");
  }
}
