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
exports.RoomService = void 0;
const room_entity_1 = __importDefault(require("../../domain/models/room.entity"));
const mongoose_1 = __importDefault(require("mongoose"));
const account_entity_1 = __importDefault(require("../../domain/models/account.entity"));
exports.RoomService = {
    ensureGeneralRoom() {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield room_entity_1.default.findOne({ roomName: '/general' });
            if (existing)
                return existing;
            const newRoom = new room_entity_1.default({ roomName: '/general', participants: [] });
            return yield newRoom.save();
        });
    },
    listByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            return yield room_entity_1.default.find({ participants: userObjectId }).exec();
        });
    },
    getMembers(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const room = yield room_entity_1.default.findById(roomId).populate('participants', 'name');
            return (_a = room === null || room === void 0 ? void 0 : room.participants) !== null && _a !== void 0 ? _a : [];
        });
    },
    createRoom(name, leaderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderObjectId = new mongoose_1.default.Types.ObjectId(leaderId);
            const newRoom = new room_entity_1.default({ roomName: name, participants: [leaderObjectId], leader: leaderObjectId });
            return yield newRoom.save();
        });
    },
    joinRoom(roomId, personId) {
        return __awaiter(this, void 0, void 0, function* () {
            const personObjectId = new mongoose_1.default.Types.ObjectId(personId);
            const room = yield room_entity_1.default.findById(roomId);
            if (!room)
                return null;
            if (!room.participants.includes(personObjectId)) {
                room.participants.push(personObjectId);
                yield room.save();
            }
            return room;
        });
    },
    autoJoinGeneral(personId) {
        return __awaiter(this, void 0, void 0, function* () {
            const general = yield this.ensureGeneralRoom();
            return yield this.joinRoom(general._id.toString(), personId);
        });
    },
    addMember(roomId, friendId) {
        return __awaiter(this, void 0, void 0, function* () {
            const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
            const room = yield room_entity_1.default.findById(roomId);
            if (!room)
                return { error: 'Room not found' };
            const friend = yield account_entity_1.default.findById(friendObjectId);
            if (!friend)
                return { error: 'Friend not found' };
            if (!room.participants.includes(friendObjectId)) {
                room.participants.push(friendObjectId);
                yield room.save();
            }
            return { room, friend };
        });
    },
    leaveRoom(roomId, personId) {
        return __awaiter(this, void 0, void 0, function* () {
            const personObjectId = new mongoose_1.default.Types.ObjectId(personId);
            const room = yield room_entity_1.default.findById(roomId);
            if (!room)
                return null;
            const idx = room.participants.findIndex((p) => p.equals(personObjectId));
            if (idx > -1) {
                room.participants.splice(idx, 1);
                yield room.save();
            }
            return room;
        });
    },
    deleteRoom(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield room_entity_1.default.findByIdAndDelete(roomId);
        });
    },
    rename(roomId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield room_entity_1.default.findByIdAndUpdate(roomId, { roomName: name }, { new: true });
        });
    },
};
