import { Socket } from "socket.io";

export function joinRoom(client: Socket, roomData: Room) {
    client.join(roomData.id)
    client.to(roomData.id).emit("get-current-canvas", roomData.board.currentState)
    console.log(`[INFO] (joined...)Socket ${client.id} has joined room ${roomData.id}`);
}

export function leaveRoom(client: Socket) {
    let rooms: Array<string> = Array.from(client.rooms)
    if (rooms.length == 1) {
        client.leave(rooms[0])
        console.log(`[INFO] (left...)Socket ${client.id} has left from room ${rooms[0]}`);
    }
    else {
        // Not a desired condition at all (a client in more than one room)
        console.error("[Error] Client is in more than one room");
    }
}

export function draw(client: Socket, drawData: Drawing, roomData: Room) {
    client.to(roomData.id).emit("draw-on-canvas", drawData)
}