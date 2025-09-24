"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name, fallback) {
    var _a;
    const value = (_a = process.env[name]) !== null && _a !== void 0 ? _a : fallback;
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.config = {
    nodeEnv: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    jwtSecret: requireEnv('JWT_SECRET', 'change-me-in-prod'),
    mongoUri: requireEnv('MONGO_URI', ''),
    cors: {
        origins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
            .split(',')
            .map((origin) => origin.trim())
            .filter((origin) => Boolean(origin)),
    },
    mail: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS || '',
        fromEmail: process.env.MAIL_FROM || '',
    }
};
