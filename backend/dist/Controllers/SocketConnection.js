"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = joinRoom;
exports.leaveRoom = leaveRoom;
exports.draw = draw;
/**
 * Joins a client to a specified room and emits the current canvas state to it.
 *
 * @param {Socket} client - The socket instance representing the client.
 * @param {Room} roomData - An object containing the room's details, including its ID and the current state of the board.
 *
 * @example
 * socket.on("<join-event>", (roomData: Room)=>{
 *      joinRoom(socket, roomData);
 * });
 */
function joinRoom(client, roomData) {
    client.join(roomData.id);
    client.to(roomData.id).emit("get-current-canvas", roomData.board.currentState);
    console.log(`[INFO] (joined...)Socket ${client.id} has joined room ${roomData.id}`);
}
/**
 * Leave a client from the joined room and disconnects from the server
 * @param client - The socket instance representing the client
 *
 * @example
 * socket.on("<leave-event>", ()=> {
 *      leaveRoom(socket);
 * });
 */
function leaveRoom(client) {
    let rooms = Array.from(client.rooms);
    if (rooms.length == 1) {
        client.leave(rooms[0]);
        console.log(`[INFO] (left...)Socket ${client.id} has left from room ${rooms[0]}`);
    }
    else {
        // Not a desired condition at all (a client in more than one room)
        console.error("[Error] Client is in more than one room");
    }
}
/**
 * Listen for the <"Draw"> event from any client connected to the room and emits the event to the other members of the room
 * @param client   - The socket instance representing the client
 * @param drawData - Drawing Object, all the data need for drawing
 * @param roomData - Room Object, details about the room
 *
 * @example
 * socket.on("<join-room-event>", (roomData) => {
 *  // logics ...
 *  socket.on("<draw-event>", (drawData) => {
 *      draw(socket, drawData, roomData);
 *  })
 * })
 */
function draw(client, drawData, roomData) {
    client.to(roomData.id).emit("draw-on-canvas", drawData);
}
