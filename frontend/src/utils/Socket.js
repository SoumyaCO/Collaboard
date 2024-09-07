import { io } from "socket.io-client";
import Cookies from "js-cookie";

const Server_Url = "http://localhost:8080";
const joinHash = sessionStorage.getItem("sessionHash");

let user = null;

// export const findUsername = async () => {
//   try {
//     const res = await fetch("http://localhost:8080/auth/getdata", {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       credentials: "include",
//     });

//     if (!res.ok) {
//       throw new Error("Failed to fetch user profile");
//     }
//     const data = await res.json();
//     user = data;
//   } catch (err) {
//     navigate("/Login");
//   }
// };

// findUsername();

// socket connection
const socket = io(Server_Url, {
  autoConnect: false,
  auth: {
    token: Cookies.get("authToken"),
  },
});

// Emit drawing data to the server
const emitDrawing = (data) => {
  const payload = {
    ...data,
    joinHash: joinHash,
  };

  socket.emit("on-drawing", payload, (response) => {});
};

// Listen for drawing updates from the server
const doDrawing = (callback) => {
  socket.on("draw-on-canvas", (data) => {
    callback(data); // Pass the received data to the provided callback
  });
};

// Function to handle the 'send-current-state' event
const handleSendCurrentState = (canvas) => {
  // Listen for the 'send-current-state' event from the server
  socket.on("send-current-state", (callback) => {
    console.log("Server requested current state.");

    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext("2d");
      if (ctx) {
        const currentState = canvas.current.toDataURL();
        callback({ data: currentState });
      } else {
        console.error("Unable to get canvas context.");
      }
    } else {
      console.error("Canvas not available.");
    }
  });
};

// Function to request the current state from the server
const requestCurrentState = () => {
  socket.emit("request-current-state", joinHash);
};

// Handle the reception of the current state from the server
const handleCurrentState = (callback) => {
  socket.on("current-state", (data) => {
    callback(data); // Pass the received data to the provided callback
  });
};

export {
  socket,
  emitDrawing,
  doDrawing,
  handleSendCurrentState,
  requestCurrentState,
  handleCurrentState,
};
