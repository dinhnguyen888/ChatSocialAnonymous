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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'images');
        // Create uploads directory if it doesn't exist
        if (!(0, fs_1.existsSync)(uploadsDir)) {
            yield (0, promises_1.mkdir)(uploadsDir, { recursive: true });
        }
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = req.file.originalname.split('.').pop() || 'jpg';
        const filename = `${timestamp}-${randomString}.${extension}`;
        const filepath = (0, path_1.join)(uploadsDir, filename);
        // Save file to disk
        yield (0, promises_1.writeFile)(filepath, req.file.buffer);
        // Return file info
        const imageUrl = `/uploads/images/${filename}`;
        res.status(200).json({
            success: true,
            imageUrl,
            filename: req.file.originalname,
            size: req.file.size,
            message: 'Image uploaded successfully'
        });
    }
    catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});
exports.uploadImage = uploadImage;
