import { io } from "socket.io-client";

const joinHash = sessionStorage.getItem("sessionHash");

//initialize socket connection

const socket = io("https://localhost:8080");

//emit

const emitDrawing = (data) => {
  const payload = {
    ...data,
    joinHash: joinHash,
  };
  socket.emit("on-drawing", data);
};

const doDrawing = (callback) => {
  socket.on("draw-on-canvas", callback);
};

export { socket, emitDrawing, doDrawing };
