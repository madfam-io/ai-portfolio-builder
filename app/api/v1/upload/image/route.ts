/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware/auth';
import {
  apiSuccess,
  apiError,
  versionedApiHandler,
} from '@/lib/api/response-helpers';
import { uploadToR2, deleteFromR2 } from '@/lib/storage/r2';
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

      // Determine folder based on type
      let folder: string;

      switch (type) {
        case 'avatar':
          folder = 'avatars';
          break;
        case 'project':
          folder = 'projects';
          break;
        case 'certificate':
          folder = 'certificates';
          break;
        case 'company':
          folder = 'companies';
          break;
        default:
          return apiError('Invalid upload type', { status: 400 });
      }

      // Generate file path
      const userId = request.user.id;
      const fileExtension = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const path = `${folder}/${userId}/${portfolioId}/${filename}`;

      // Convert file to buffer
      const fileBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);

      // Upload file to R2
      const result = await uploadToR2(buffer, path, file.type);

      logger.info('Image uploaded successfully', {
        userId,
        portfolioId,
        type,
        path,
      });

      return apiSuccess({
        url: result.url,
        path: result.key,
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

      // Ensure user owns the file (path should contain userId)
      const userId = request.user.id;
      if (!path.includes(userId)) {
        return apiError('Unauthorized', { status: 403 });
      }

      // Delete file from R2
      await deleteFromR2(path);

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
