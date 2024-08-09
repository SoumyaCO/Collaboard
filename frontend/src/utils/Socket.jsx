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

//emit

const emitDrawing = (data) => {
  const payload = {
    ...data,
    joinHash: joinHash,
  };

  // Emit "on-drawing" event with data and a callback function
  socket.emit("on-drawing", payload, (response) => {
    // handle the server's response
    console.log(response.cb_msg);
  });
};

const doDrawing = (callback) => {
  socket.on("draw-on-canvas", (data) => {
    callback(data); // Pass the received data to the provided callback
  });
};

// Function to handle the 'send-current-state' event
const handleSendCurrentState = (canvas) => {
  // Listen for the 'send-current-state' event from the server
  socket.on("send-current-state", (arg, callback) => {
    console.log("Server requested current state.");

    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext("2d");
      if (ctx) {
        const currentState = canvas.current.toDataURL(); // Get current canvas state as a data URL
        callback({ data: currentState }); // Send current state to the server
      } else {
        console.error("Unable to get canvas context.");
      }
    } else {
      console.error("Canvas not available.");
    }
  });
};

export { socket, emitDrawing, doDrawing, handleSendCurrentState };
