import * as dotenv from "dotenv";
dotenv.config();

// server related imports
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

// middlewares
import bodyParser from "body-parser";
import cors from "cors";

// database related imports
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// routes import
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";
import {
	joinRoomHandler,
	createRoomHandler,
	socketAuthMiddleware,
} from "./Controllers/SocketController";

const app = express();

// CORS configuration
const corsOptions = {
	origin: "http://localhost:5173",
	methods: ["GET", "POST", "PUT"],
	credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
	bodyParser.json({
		type: "application/json",
	}),
);

app.use(cors(corsOptions));
app.use(cookieParser());
// app.use(express.static(__dirname + "/../../../Collab/public/")); // using for testing the backend (own frontend)

// routers starts here
app.use("/auth", authRouter);
app.use("/user", userRouter);

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
export const httpServer = createServer(app);
export const io: Server = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// middleware for socket io
io.use((socket, next) => socketAuthMiddleware(socket, next));

// ------------------------------------------------------------ socket logics starts here
io.sockets.on("connection", (socket: Socket) => {
	console.log("Hello sir, it's socket connection");
	console.log(`Connected user: ${socket.handshake.auth.username}`);

	socket.on("create-room", (data) => createRoomHandler(socket, data));

	socket.on("join-room", async (data) => joinRoomHandler(socket, data));
});

io.sockets.on("disconnect", (socket) => {
	console.log(
		`${socket.auth.username} has disconnected from the socket.io server`,
	);
});
// ------------------------------------------------------------- socket logics ends here

const PORT: string = process.env.PORT as string;
console.log(PORT);
httpServer.listen(PORT, () => {
	console.log("listening on port: ", PORT);
});
