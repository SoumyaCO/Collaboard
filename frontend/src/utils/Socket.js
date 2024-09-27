import { io } from "socket.io-client";
import Cookies from "js-cookie";

const Server_Url = "http://localhost:8080";
const joinHash = sessionStorage.getItem("sessionHash");

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

const emitDrawing = (socket, data) => {
  socket.emit("on-drawing", data);
};

export { emitDrawing };
