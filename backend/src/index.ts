import * as dotenv from "dotenv";
dotenv.config();

// server related imports
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

// middlewares
import bodyParser from "body-parser";
import cors from "cors";

// database related imports
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// controllers and models imports
import { joinRoom, createRoom, getAdmin } from "./Controllers/SocketConnection";

// routes import
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";
import { User } from "./Models/User";
// create an express server
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
	// It's called a type guard we can use (?) sign also
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
const io: Server = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

function isvalidToken(token: string) {
	const verified = jwt.verify(token, process.env.JWT_PASS as string) as User;
	return verified;
}

// middleware for socket io
io.use((socket, next) => {
	try {
		const token = socket.handshake.auth.token;
		if (!token) {
			throw new Error("Missing Token");
		}
		if (!isvalidToken(token)) {
			throw new Error("Invalid Token");
		}
		next();
	} catch (error) {
		console.error("Authentication error", error);
		next(new Error("Authentication error"));
	}
});

// ------------------------------------------------------------ socket logics starts here
io.sockets.on("connection", (socket: Socket) => {
	let username = socket.handshake.auth.username;
	console.log(`Connected user: ${username}`);

	socket.on("create-room", (data, callback) => {
		createRoom(socket, data);
		callback({
			msg: `room created by ${socket.handshake.auth.username}`,
		});
		// ---------------------- have to listen to the "on-drawing" event inside the join room
		socket.on("on-drawing", (msg) => {
			socket.broadcast.to(data.id).emit("draw-on-canvas", msg);
		});
	});

	socket.on("join-room", async (data, callback) => {
		await joinRoom(socket, data);
		io.sockets
			.in(data.id)
			.emit("notification", { msg: `${username} joined the room` });
		let adminID = await getAdmin(data.id);
		io.to(adminID)
			.timeout(5000)
			.emit(
				"send-current-state",
				username,
				handleSendCurrentStateError(callback),
			);

		function handleSendCurrentStateError(callback: Function) {
			return (error: Error, response: any) => {
				if (error) {
					console.log(`Error: ${error}`.red.underline);
					console.log(
						`${socket.handshake.auth.username} disconnected`.red.underline,
					);
					return callback({
						allow: false,
						cb_msg: "Access denied due to error",
						stack_data: null,
					});
				}
				handleResponse(response, callback);
			};
		}

		function handleResponse(response: any, callback: Function) {
			if (!response?.[0]?.allow) {
				socket.disconnect();
				return callback({
					allow: false,
					cb_msg: "Access denied by Admin",
					stack_data: null,
				});
			}
			const stack_data = response[0].data;
			return callback({
				allow: true,
				cb_msg: "Drawing stack sending",
				stack_data: stack_data,
			});
		}

		socket.on("on-drawing", (msg, callback) => {
			// ---------------------- have to listen to the "on-drawing" event inside the join room
			callback({
				cb_msg: "drawing data received",
			});
			socket.broadcast.to(data.id).emit("draw-on-canvas", msg);
		});
	});
});

io.sockets.on("disconnect", (socket) => {
	console.log(
		`${socket.auth.username} has disconnected from the socket.io server`,
	);
});
// ------------------------------------------------------------- socket logics ends here

// app.get("/", (_, res) => {
// 	res.send("Routes are yet to be implemented");
// });

const PORT: string = process.env.PORT ?? "8080";
console.log(PORT);
httpServer.listen(PORT, () => {
	console.log("listening on port: ", PORT);
});
