'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  validateFile,
} from '@/lib/supabase/storage';
import { useAsyncForm } from '@/lib/hooks/useAsyncError';
import { errorLogger, ValidationError, ExternalServiceError } from '@/lib/services/error';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  type: 'avatar' | 'project' | 'certificate' | 'company';
  portfolioId: string;
  className?: string;
  disabled?: boolean;
  preview?: boolean;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export function ImageUpload({
  value,
  onChange,
  type,
  portfolioId,
  className,
  disabled = false,
  preview = true,
  aspectRatio = 'auto',
}: ImageUploadProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, isUploading]
  );

  const uploadForm = useAsyncForm(async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid file');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('portfolioId', portfolioId);

    const response = await fetch('/api/v1/upload/image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new ExternalServiceError('Upload API', new Error(data.error || 'Upload failed'));
    }

    return data.data.url;
  }, {
    onSuccess: (url) => {
      onChange(url);
      toast({
        title: t.success || 'Success',
        description: t.imageUploaded || 'Image uploaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: t.error || 'Error',
        description:
          error instanceof ValidationError
            ? error.message
            : t.uploadFailed || 'Failed to upload image',
        variant: 'destructive',
      });
    },
  });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    await uploadForm.submit(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const deleteForm = useAsyncForm(async () => {
    if (!value) throw new Error('No image to delete');

    // Extract path from URL
    const url = new URL(value);
    const path = url.pathname.split('/').slice(-3).join('/'); // Get last 3 segments

    const response = await fetch(
      `/api/v1/upload/image?path=${encodeURIComponent(path)}&type=${type}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new ExternalServiceError('Delete API', new Error(data.error || 'Delete failed'));
    }
  }, {
    onSuccess: () => {
      onChange(undefined);
      toast({
        title: t.success || 'Success',
        description: t.imageRemoved || 'Image removed successfully',
      });
    },
    onError: (error) => {
      errorLogger.logError(error, {
        component: 'ImageUpload',
        action: 'delete_image',
        metadata: { value, type },
      });
      toast({
        title: t.error || 'Error',
        description: t.deleteFailed || 'Failed to remove image',
        variant: 'destructive',
      });
    },
  });

  const handleRemove = async () => {
    if (!value || uploadForm.isSubmitting || deleteForm.isSubmitting) return;
    await deleteForm.submit();
  };

  const isUploading = uploadForm.isSubmitting || deleteForm.isSubmitting;

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'aspect-auto',
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="sr-only"
      />

      {value && preview ? (
        <div className="relative group">
          <img
            src={value}
            alt={t.uploadedImage || 'Uploaded image'}
            className={cn(
              'w-full object-cover rounded-lg',
              aspectClasses[aspectRatio]
            )}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              {t.remove || 'Remove'}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
            aspectClasses[aspectRatio]
          )}
          onClick={() =>
            !disabled && !isUploading && fileInputRef.current?.click()
          }
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t.uploading || 'Uploading...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {value ? (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {value.split('/').pop()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.clickToChange || 'Click to change'}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {t.dropImageHere || 'Drop image here or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.maxFileSize || `Max ${MAX_FILE_SIZE / 1024 / 1024}MB`} •
                    {' ' + (t.allowedFormats || 'JPG, PNG, WebP, GIF')}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
