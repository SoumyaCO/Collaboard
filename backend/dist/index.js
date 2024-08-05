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
const SocketConnection_1 = require("./Controllers/SocketConnection");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// create an express server
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.use((0, cors_1.default)());
// routers starts here
app.use('/auth', authRoutes_1.default);
app.use('/user', userRoutes_1.default);
// routers ends here 
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
// make a count of the sockets.
let countOfConnection = 0;
io.on("connection", (socket) => {
    ++countOfConnection;
    console.log(`Client Connected with Socket Id: ${socket.id}`);
    // on join-room event
    socket.on("join-room", (roomData) => {
        (0, SocketConnection_1.joinRoom)(socket, roomData);
        socket.on("on-drawing", (drawData) => {
            (0, SocketConnection_1.draw)(socket, drawData, roomData);
        });
        socket.on("leave-room", () => {
            (0, SocketConnection_1.leaveRoom)(socket);
        });
    });
});
app.get("/", (req, res) => {
    res.send("Routes are yet to be implemented");
});
const PORT = process.env.PORT;
console.log(PORT);
httpServer.listen(PORT, () => {
    console.log("listening on port: ", PORT);
});
