import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/v1/upload/image/route';
import { withAuth } from '@/lib/api/middleware/auth';
import { uploadFile, deleteFile, generateFilePath, STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/api/middleware/auth');
jest.mock('@/lib/supabase/storage');
jest.mock('@/lib/utils/logger');

// Mock the dynamic import for deleteFile
jest.mock('@/lib/supabase/storage', () => ({
  ...jest.requireActual('@/lib/supabase/storage'),
  deleteFile: jest.fn(),
}));

describe('Image Upload API Routes', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockFile = new File(['test image content'], 'test-image.jpg', {
    type: 'image/jpeg',
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth middleware to pass through with user
    (withAuth as jest.Mock).mockImplementation((handler) => {
      return (request: any) => {
        request.user = mockUser;
        return handler(request);
      };
    });

    // Mock logger
    (logger.info as jest.Mock).mockImplementation(() => {});
    (logger.error as jest.Mock).mockImplementation(() => {});

    // Mock generateFilePath
    (generateFilePath as jest.Mock).mockReturnValue('user-123/profile/test-image-123.jpg');
  });

  describe('POST /api/v1/upload/image', () => {
    it('should upload avatar image successfully', async () => {
      const mockUploadResult = {
        success: true,
        publicUrl: 'https://storage.example.com/avatars/user-123/profile/test-image-123.jpg',
      };

      (uploadFile as jest.Mock).mockResolvedValue(mockUploadResult);

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'avatar');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual({
        url: mockUploadResult.publicUrl,
        path: 'user-123/profile/test-image-123.jpg',
        type: 'avatar',
      });
      expect(uploadFile).toHaveBeenCalledWith({
        bucket: 'AVATARS',
        path: 'user-123/profile/test-image-123.jpg',
        file: mockFile,
      });
    });

    it('should upload project image successfully', async () => {
      const mockUploadResult = {
        success: true,
        publicUrl: 'https://storage.example.com/projects/user-123/portfolio-123/test-image-123.jpg',
      };

      (uploadFile as jest.Mock).mockResolvedValue(mockUploadResult);
      (generateFilePath as jest.Mock).mockReturnValue('user-123/portfolio-123/test-image-123.jpg');

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'project');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(uploadFile).toHaveBeenCalledWith({
        bucket: 'PROJECTS',
        path: 'user-123/portfolio-123/test-image-123.jpg',
        file: mockFile,
      });
      expect(generateFilePath).toHaveBeenCalledWith('user-123', 'test-image.jpg', 'portfolio-123');
    });

    it('should upload certificate image successfully', async () => {
      const mockUploadResult = {
        success: true,
        publicUrl: 'https://storage.example.com/certificates/user-123/portfolio-123/cert-123.jpg',
      };

      (uploadFile as jest.Mock).mockResolvedValue(mockUploadResult);

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'certificate');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(uploadFile).toHaveBeenCalledWith({
        bucket: 'CERTIFICATES',
        path: expect.any(String),
        file: mockFile,
      });
    });

    it('should upload company logo successfully', async () => {
      const mockUploadResult = {
        success: true,
        publicUrl: 'https://storage.example.com/companies/user-123/portfolio-123/logo-123.jpg',
      };

      (uploadFile as jest.Mock).mockResolvedValue(mockUploadResult);

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'company');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(uploadFile).toHaveBeenCalledWith({
        bucket: 'COMPANIES',
        path: expect.any(String),
        file: mockFile,
      });
    });

    it('should return 400 when no file provided', async () => {
      const formData = new FormData();
      formData.append('type', 'avatar');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
    });

    it('should return 400 when type is missing', async () => {
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Upload type is required');
    });

    it('should return 400 when portfolioId is missing', async () => {
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'avatar');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Portfolio ID is required');
    });

    it('should return 400 for invalid upload type', async () => {
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'invalid-type');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid upload type');
    });

    it('should handle upload failure', async () => {
      (uploadFile as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Storage quota exceeded',
      });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'avatar');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Storage quota exceeded');
    });

    it('should handle unexpected errors', async () => {
      (uploadFile as jest.Mock).mockRejectedValue(new Error('Network error'));

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('type', 'avatar');
      formData.append('portfolioId', 'portfolio-123');

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/upload/image', () => {
    it('should delete image successfully', async () => {
      (deleteFile as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image?path=user-123/profile/test-image.jpg&type=avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('File deleted successfully');
      expect(deleteFile).toHaveBeenCalledWith('AVATARS', 'user-123/profile/test-image.jpg');
    });

    it('should return 400 when path is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/upload/image?type=avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Path and type are required');
    });

    it('should return 400 when type is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/upload/image?path=user-123/profile/test.jpg', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Path and type are required');
    });

    it('should return 403 when user does not own the file', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/upload/image?path=other-user-456/profile/test.jpg&type=avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle different file types', async () => {
      (deleteFile as jest.Mock).mockResolvedValue(true);

      const types = [
        { type: 'project', bucket: 'PROJECTS' },
        { type: 'certificate', bucket: 'CERTIFICATES' },
        { type: 'company', bucket: 'COMPANIES' },
      ];

      for (const { type, bucket } of types) {
        const request = new NextRequest(`http://localhost:3000/api/v1/upload/image?path=user-123/test.jpg&type=${type}`, {
          method: 'DELETE',
        });

        const response = await DELETE(request);
        expect(response.status).toBe(200);
        expect(deleteFile).toHaveBeenCalledWith(bucket, 'user-123/test.jpg');
      }
    });

    it('should return 400 for invalid type', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/upload/image?path=user-123/test.jpg&type=invalid', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid upload type');
    });

    it('should handle deletion failure', async () => {
      (deleteFile as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image?path=user-123/test.jpg&type=avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Failed to delete file');
    });

    it('should handle unexpected errors', async () => {
      (deleteFile as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const request = new NextRequest('http://localhost:3000/api/v1/upload/image?path=user-123/test.jpg&type=avatar', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});