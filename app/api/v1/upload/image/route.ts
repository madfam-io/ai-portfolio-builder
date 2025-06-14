import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { apiSuccess, apiError, versionedApiHandler } from '@/lib/api/response-helpers';
import { uploadFile, generateFilePath, STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/v1/upload/image
 * Upload an image to Supabase Storage
 */
export const POST = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;
      const portfolioId = formData.get('portfolioId') as string;

      // Validate required fields
      if (!file || !(file instanceof File)) {
        return apiError('No file provided', { status: 400 });
      }

      if (!type) {
        return apiError('Upload type is required', { status: 400 });
      }

      if (!portfolioId) {
        return apiError('Portfolio ID is required', { status: 400 });
      }

      // Determine bucket based on type
      let bucket: keyof typeof STORAGE_BUCKETS;
      let prefix: string;

      switch (type) {
        case 'avatar':
          bucket = 'AVATARS';
          prefix = 'profile';
          break;
        case 'project':
          bucket = 'PROJECTS';
          prefix = portfolioId;
          break;
        case 'certificate':
          bucket = 'CERTIFICATES';
          prefix = portfolioId;
          break;
        case 'company':
          bucket = 'COMPANIES';
          prefix = portfolioId;
          break;
        default:
          return apiError('Invalid upload type', { status: 400 });
      }

      // Generate file path
      const userId = request.user.id;
      const path = generateFilePath(userId, file.name, prefix);

      // Upload file
      const result = await uploadFile({
        bucket,
        path,
        file,
      });

      if (!result.success) {
        return apiError(result.error || 'Upload failed', { status: 400 });
      }

      logger.info('Image uploaded successfully', {
        userId,
        portfolioId,
        type,
        path,
      });

      return apiSuccess({
        url: result.publicUrl,
        path,
        type,
      });

    } catch (error) {
      logger.error('Unexpected error in image upload:', error as Error);
      return apiError('Internal server error', { status: 500 });
    }
  })
);

/**
 * DELETE /api/v1/upload/image
 * Delete an image from Supabase Storage
 */
export const DELETE = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const path = searchParams.get('path');
      const type = searchParams.get('type');

      if (!path || !type) {
        return apiError('Path and type are required', { status: 400 });
      }

      // Determine bucket based on type
      let bucket: keyof typeof STORAGE_BUCKETS;

      switch (type) {
        case 'avatar':
          bucket = 'AVATARS';
          break;
        case 'project':
          bucket = 'PROJECTS';
          break;
        case 'certificate':
          bucket = 'CERTIFICATES';
          break;
        case 'company':
          bucket = 'COMPANIES';
          break;
        default:
          return apiError('Invalid upload type', { status: 400 });
      }

      // Ensure user owns the file (path should start with userId)
      const userId = request.user.id;
      if (!path.startsWith(userId)) {
        return apiError('Unauthorized', { status: 403 });
      }

      // Import deleteFile function
      const { deleteFile } = await import('@/lib/supabase/storage');
      
      const success = await deleteFile(bucket, path);

      if (!success) {
        return apiError('Failed to delete file', { status: 400 });
      }

      logger.info('Image deleted successfully', {
        userId,
        type,
        path,
      });

      return apiSuccess({ message: 'File deleted successfully' });

    } catch (error) {
      logger.error('Unexpected error in image delete:', error as Error);
      return apiError('Internal server error', { status: 500 });
    }
  })
);