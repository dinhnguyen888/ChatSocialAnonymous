import { Request, Response } from 'express';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

type MulterRequest = Request & { file?: Express.Multer.File };

export const uploadImage = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const uploadsDir = join(process.cwd(), 'uploads', 'images');
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = req.file.originalname.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    
    const filepath = join(uploadsDir, filename);
    
    // Save file to disk
    await writeFile(filepath, req.file.buffer);
    
    // Return file info
    const imageUrl = `/uploads/images/${filename}`;
    
    res.status(200).json({
      success: true,
      imageUrl,
      filename: req.file.originalname,
      size: req.file.size,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
