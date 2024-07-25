"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require("colors");
const express_1 = __importDefault(require("express"));
const userController_1 = require("../Controllers/userController");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
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
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, userController_1.createUser)(req.body);
        res.status(201).send(user);
    }
    catch (error) {
        console.error(`[Error]: ${error}`.red.italic);
    }
}));
router.delete("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.deleteUser)(req.params.userId);
        res.status(204).send("user successfully deleted!");
    }
    catch (error) {
        console.error(`[Error]: ${error}`.red.italic);
    }
}));
router.put("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, userController_1.updateUser)(req.params.userId, req.body);
    res.send(user);
}));
// for testing purpose this route returns a message
router.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const user = await getUser(req.params.userId);
    // res.send(user);
    res.send(`Hello ${req.params.userId} Sir!`);
}));
exports.default = router;
