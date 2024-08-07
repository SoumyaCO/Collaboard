import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import RoomModel from "./Models/Room";

import { joinRoom, createRoom } from "./Controllers/SocketConnection";

import userRouter from './routes/userRoutes';
import authRouter from './routes/authRoutes';
// create an express server
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
  bodyParser.json({
    type: 'application/json'
  })
);
// app.use(bodyParser.json({ type: 'application/json' }))
app.use(cors());
// routers starts here
app.use('/auth', authRouter);
app.use('/user', userRouter);


// database connection establishing here
let conn_str: string | undefined = "";

if (process.env.NODE_ENVIRONMENT === "local") {
  conn_str = process.env.MONGO_URL_LOCAL;
  console.log(`[environment] local`.green.bold);
} else {
  conn_str = process.env.MONGO_URL_PROD;
  console.log(`[environment] production`.green.bold);
}

if (!conn_str) {
  console.error("Database connection string is undefined.".red.bold);
  process.exit(1); // Exit the process if the connection string is not defined
}
mongoose
  .connect(conn_str)
  .then(() => {
    console.log(`[Connected] connected to the database!\n`.cyan.bold);
  })
  .catch((error) => {
    console.error(`Error: ${error}`.red.italic);
  });


// routers ends here 
const httpServer = createServer(app);
const io: Server = new Server(httpServer);

// ------------------------------------------------------------ socket logics starts here
io.sockets.on("connection", (socket: Socket) => {
  let username = socket.handshake.auth.username;
  console.log(`Connected user: ${username}`);

  socket.on("create-room", (data, callback) => {
    createRoom(socket, data);
    callback({
      cb_msg: `room created ${data.id}`
    })
    // ---------------------- have to listen to the "on-drawing" event inside the join room
    socket.on("on-drawing", (msg, callback) => {
      callback({
        cb_msg: "drawing data received"
      })
      console.log(`Id of the room: ${data.id}`.blue.italic);
      io.to(data.id).emit("draw-on-canvas", msg);
    });
  });

  socket.on("join-room", (data, callback) => {
    let imageString: string = "";
    joinRoom(socket, data);

    io.sockets
      .in(data.id)
      .emit("notification", { msg: `${username} joined the room` });

    RoomModel.findOne({ roomId: data.id })
      .then((user: any) => {
        if (user) {
          io.to(user.adminId)
            .timeout(5000)
            .emit(
              "send-current-state",
              `hello from ${username}`,
              (error: Error, response: any) => {
                if (error) {
                  console.log(`Error: ${error}`.red.underline);
                } else {
                  imageString = response[0].data; // getting the image string from the callback ( gives back an array `[{data: string}]`)
                  // ------------------------------------------ sending callback
                  callback({
                    cb_msg: "imgeString sending",
                    imgURL: imageString,
                  });
                }
              },
            );
        }
      })
      .catch((e) => {
        console.log(`Error: ${e}`.red.underline);
      });

    socket.on("on-drawing", (msg, callback) => {
      // ---------------------- have to listen to the "on-drawing" event inside the join room
      callback({
        cb_msg: "drawing data received"
      })
      io.to(data.id).emit("draw-on-canvas", msg);
    });
  });
});
// ------------------------------------------------------------- socket logics ends here

app.get("/", (req, res) => {
  res.send("Routes are yet to be implemented");
});


const PORT: string | undefined = process.env.PORT;
console.log(PORT);
httpServer.listen(PORT, () => {
  console.log("listening on port: ", PORT);
});
