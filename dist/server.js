"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const account_Route_1 = __importDefault(require("./src/Routes/account.Route"));
const db_1 = __importDefault(require("./Database/db"));
const cors_1 = __importDefault(require("cors"));
// configures dotenv to work in your application
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
const corsOptions = {
    origin: "localhost:3000"
};
app.use('/api', account_Route_1.default);
app.use((0, cors_1.default)(corsOptions));
db_1.default;
app.use(express_1.default.static('public'));
app.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
    throw new Error(error.message);
});
