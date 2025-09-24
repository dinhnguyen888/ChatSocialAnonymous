"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../shared/config");
const uri = process.env.MONGODB_URI || config_1.config.mongoUri;
mongoose_1.default.connect(uri, {})
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((err) => {
    console.error('Error connecting to MongoDB', err);
});
exports.default = mongoose_1.default;
