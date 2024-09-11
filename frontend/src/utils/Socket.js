import { io } from "socket.io-client";
import Cookies from "js-cookie";

// Server URL and session hash
const Server_Url = "http://localhost:8080";
const joinHash = sessionStorage.getItem("sessionHash");

// Create and configure the socket connection
export const createSocket = () => {
  const username = localStorage.getItem("username");
  let token = Cookies.get("authToken");
  console.log("frontend token", token);

  return io(Server_Url, {
    autoConnect: false,
    auth: {
      token: token,
      username: username,
    },
  });
};


// Emit drawing data to the server
const emitDrawing = (socket, data) => {
  const payload = {
    ...data,
    joinHash: joinHash,
  };

  socket.emit("on-drawing", payload, (response) => {
    console.log("on-drawing:", response);
  });
};

// Listen for drawing updates from the server
const doDrawing = (socket, callback) => {
  socket.on("draw-on-canvas", (data) => {
    callback(data);
  });
};

// Handle 'send-current-state' event from the server

// Export functions
export { emitDrawing, doDrawing };
