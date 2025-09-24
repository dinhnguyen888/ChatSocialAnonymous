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
exports.FriendService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const friend_entity_1 = __importDefault(require("../../domain/models/friend.entity"));
const friendRoom_entity_1 = __importDefault(require("../../domain/models/friendRoom.entity"));
exports.FriendService = {
    sendRequest(to, from) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUserId = new mongoose_1.default.Types.ObjectId(from);
            return yield friend_entity_1.default.findOneAndUpdate({ ownerId: to }, { $addToSet: { friendIdRequest: requestUserId } }, { new: true, upsert: true });
        });
    },
    addFriend(ownerId, friendId, ownerName, friendName) {
        return __awaiter(this, void 0, void 0, function* () {
            const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
            const owner = yield friend_entity_1.default.findOneAndUpdate({ ownerId }, { $addToSet: { friendId: friendObjectId }, $pull: { friendIdRequest: friendObjectId } }, { new: true });
            const friend = yield friend_entity_1.default.findOneAndUpdate({ ownerId: friendId }, { $addToSet: { friendId: new mongoose_1.default.Types.ObjectId(ownerId) } }, { new: true, upsert: true });
            const chatRoom = new friendRoom_entity_1.default({ friendRoomName: `${ownerName}${friendName}`, participants: [ownerId, friendId] });
            yield chatRoom.save();
            return { owner, friend };
        });
    },
    deleteFriend(ownerId, friendId) {
        return __awaiter(this, void 0, void 0, function* () {
            const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
            const owner = yield friend_entity_1.default.findOneAndUpdate({ ownerId }, { $pull: { friendId: friendObjectId } }, { new: true });
            const friend = yield friend_entity_1.default.findOneAndUpdate({ ownerId: friendId }, { $pull: { friendId: new mongoose_1.default.Types.ObjectId(ownerId) } }, { new: true });
            const room = yield friendRoom_entity_1.default.findOneAndDelete({ participants: { $all: [ownerId, friendId] } });
            return { owner, friend, room };
        });
    },
};
