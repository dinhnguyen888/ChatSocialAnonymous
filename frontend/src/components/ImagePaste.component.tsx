import React, { useRef, useCallback, useState } from 'react';
import { Box, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import { uploadImage } from '../services/apiAccount';

interface ImagePasteProps {
  onImageUploaded: (imageUrl: string, filename: string, size: number) => void;
  disabled?: boolean;
}

const ImagePaste: React.FC<ImagePasteProps> = ({ onImageUploaded, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadImage(formData);
      onImageUploaded(response.imageUrl, response.filename, response.size);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [onImageUploaded]);

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (disabled || uploading) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        break;
      }
    }
  }, [handleImageUpload, disabled, uploading]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  }, [handleImageUpload]);

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <>
      <Tooltip title={disabled ? "Image upload disabled" : "Upload image (Ctrl+V or click)"}>
        <span>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            size="small"
            sx={{ 
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <ImageIcon />
          </IconButton>
        </span>
      </Tooltip>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          action={
            <IconButton size="small" onClick={() => setError(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ImagePaste;
