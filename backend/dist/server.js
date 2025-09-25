"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const account_route_1 = __importDefault(require("./presentation/routes/account.route"));
const db_1 = __importDefault(require("./infrastructure/database/db"));
const cors_1 = __importDefault(require("cors"));
const socket_controller_1 = require("./presentation/controllers/socket.controller");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const config_1 = require("./shared/config");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (config_1.config.cors.origins.includes(origin))
                return callback(null, true);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    }
});
const PORT = config_1.config.port;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origins,
    credentials: true
}));
app.use('/api', account_route_1.default);
app.use('/uploads', express_1.default.static('uploads'));
db_1.default;
app.use(express_1.default.static('public'));
//connect socket.io
// socketController(io);
(0, socket_controller_1.socketController)(io);
//disconnect
server.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
    throw new Error(error.message);
});
