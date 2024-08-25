"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const Room_1 = __importDefault(require("./Models/Room"));
const SocketConnection_1 = require("./Controllers/SocketConnection");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// create an express server
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({
    extended: true,
}), body_parser_1.default.json({
    type: "application/json",
}));
// app.use(bodyParser.json({ type: 'application/json' }))
app.use((0, cors_1.default)());
// routers starts here
app.use("/auth", authRoutes_1.default);
app.use("/user", userRoutes_1.default);
// database connection establishing here
let conn_str = "";
if (process.env.NODE_ENVIRONMENT === "local") {
    conn_str = process.env.MONGO_URL_LOCAL;
    console.log(`[environment] local`.green.bold);
}
else {
    conn_str = process.env.MONGO_URL_PROD;
    console.log(`[environment] production`.green.bold);
}
if (!conn_str) {
    console.error("Database connection string is undefined.".red.bold);
    process.exit(1); // Exit the process if the connection string is not defined
}
mongoose_1.default
    .connect(conn_str)
    .then(() => {
    console.log(`[Connected] connected to the database!\n`.cyan.bold);
})
    .catch((error) => {
    console.error(`Error: ${error}`.red.italic);
});
// routers ends here
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
// ------------------------------------------------------------ socket logics starts here
io.sockets.on("connection", (socket) => {
    let username = socket.handshake.auth.username;
    console.log(`Connected user: ${username}`);
    socket.on("create-room", (data, callback) => {
        (0, SocketConnection_1.createRoom)(socket, data);
        callback({
            cb_msg: `room created ${data.id}`,
        });
        // ---------------------- have to listen to the "on-drawing" event inside the join room
        socket.on("on-drawing", (msg, callback) => {
            callback({
                cb_msg: "drawing data received",
            });
            console.log(`Id of the room: ${data.id}`.blue.italic);
            io.to(data.id).emit("draw-on-canvas", msg);
        });
    });
    socket.on("join-room", (data, callback) => {
        let imageString = "";
        (0, SocketConnection_1.joinRoom)(socket, data);
        io.sockets
            .in(data.id)
            .emit("notification", { msg: `${username} joined the room` });
        Room_1.default.findOne({ roomId: data.id })
            .then((user) => {
            if (user) {
                io.to(user.adminId)
                    .timeout(5000)
                    .emit("send-current-state", `hello from ${username}`, (error, response) => {
                    if (error) {
                        console.log(`Error: ${error}`.red.underline);
                    }
                    else {
                        imageString = response[0].data; // getting the image string from the callback ( gives back an array `[{data: string}]`)
                        // ------------------------------------------ sending callback
                        callback({
                            cb_msg: "imgeString sending",
                            imgURL: imageString,
                        });
                    }
                });
            }
        })
            .catch((e) => {
            console.log(`Error: ${e}`.red.underline);
        });
        socket.on("on-drawing", (msg, callback) => {
            // ---------------------- have to listen to the "on-drawing" event inside the join room
            callback({
                cb_msg: "drawing data received",
            });
            io.to(data.id).emit("draw-on-canvas", msg);
        });
    });
});
// ------------------------------------------------------------- socket logics ends here
app.get("/", (req, res) => {
    res.send("Routes are yet to be implemented");
});
const PORT = process.env.PORT;
console.log(PORT);
httpServer.listen(PORT, () => {
    console.log("listening on port: ", PORT);
});
