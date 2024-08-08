import { io } from "socket.io-client";
const Server_Url = "http://localhost:8080";
const joinHash = sessionStorage.getItem("sessionHash");

//initialize socket connection

const socket = io(Server_Url, {
  autoConnect: false,
  auth: {
    username: "",
  },
});
// socket.auth.username = username;
// connect the socket
socket.connect();

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

const handleSendCurrentState = (canvas) => {
  socket.on("send-current-state", (arg, callback) => {
    console.log("Server requested current state.");

    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext("2d");
      if (ctx) {
        const currentState = canvas.current.toDataURL(); // current canvas state as a data URL
        callback({ data: currentState }); // Send current state to the server
      }
    } else {
      console.error("Canvas not available.");
    }
  });
};

export { socket, emitDrawing, doDrawing, handleSendCurrentState };
