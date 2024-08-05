import * as dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

import { Room } from "./Models/Room";
import { Drawing } from "./Models/Drawing";

import { draw, joinRoom, leaveRoom } from "./Controllers/SocketConnection";
import userRouter from './routes/userRoutes';
import authRouter from './routes/authRoutes';
// create an express server
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(cors());

// routers starts here
app.use('/auth', authRouter);
app.use('/user', userRouter);

// routers ends here 

const httpServer = createServer(app);
const io: Server = new Server(httpServer);

// make a count of the sockets.
let countOfConnection: number = 0;
io.on("connection", (socket: Socket) => {
  ++countOfConnection;
  console.log(`Client Connected with Socket Id: ${socket.id}`);

  // on join-room event
  socket.on("join-room", (roomData: Room) => {
    joinRoom(socket, roomData);

    socket.on("on-drawing", (drawData: Drawing) => {
      draw(socket, drawData, roomData)
    });

    socket.on("leave-room", () => {
      leaveRoom(socket)
    });
  });
});

app.get("/", (req, res) => {
  res.send("Routes are yet to be implemented");
});


const PORT: string | undefined = process.env.PORT;
console.log(PORT);
httpServer.listen(PORT, () => {
  console.log("listening on port: ", PORT);
});
