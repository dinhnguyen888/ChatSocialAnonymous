"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const account_Route_1 = __importDefault(require("./Routes/account.Route"));
const db_1 = __importDefault(require("../Database/db"));
const cors_1 = __importDefault(require("cors"));
const socket_Controller_1 = require("./Controllers/socket.Controller");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        // origin: ["http://localhost:3000", "http://localhost:3001"],
        origin: true
    }
});
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api', account_Route_1.default);
db_1.default;
app.use(express_1.default.static('public'));
//connect socket.io
// socketController(io);
(0, socket_Controller_1.socketController)(io);
//disconnect
server.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
    throw new Error(error.message);
});
