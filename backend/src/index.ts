import * as dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

// create an express server
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(cors());

const httpServer = createServer(app);
const io: Server = new Server(httpServer);

// connection logics
// make a count of the sockets.
let countOfConnection: number = 0;
io.on("connection", (socket: Socket) => {
  ++countOfConnection;
  console.log(`Client Connected with Socket Id: ${socket.id}`);

  // on join-room event
  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`socket ${socket.id} has joined room ${roomId}`);

    socket.on("onDraw", (drawData: JSON) => {
      io.to(roomId).emit("draw", { drawData: JSON });
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      console.log(`socket ${socket.id} has left from room ${roomId}`);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello Sir");
});

const PORT: string | undefined = process.env.PORT;
console.log(PORT);
httpServer.listen(PORT, () => {
  console.log("listning on port: ", PORT);
});
