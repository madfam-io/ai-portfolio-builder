# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage for the AI Portfolio Builder application.

## Overview

The application uses Supabase Storage to handle image uploads for:

- **Avatar images** - Profile pictures for portfolios
- **Project images** - Screenshots and thumbnails for projects
- **Certificate images** - Certification and credential images
- **Company logos** - Logos for work experience entries

## Setup Instructions

### 1. Create a Supabase Project

If you haven't already, create a Supabase project at [supabase.com](https://supabase.com).

### 2. Run the Storage Setup Script

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `/scripts/setup-storage.sql`
4. Paste and run the script in the SQL Editor

This script will:

- Create four storage buckets (avatars, project-images, certificates, company-logos)
- Set appropriate file size limits and allowed MIME types
- Configure Row Level Security (RLS) policies for secure access

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Verify Storage Configuration

1. Go to Storage in your Supabase dashboard
2. Verify that all four buckets are created:
   - `avatars` - Public bucket, 5MB limit
   - `project-images` - Public bucket, 5MB limit
   - `certificates` - Public bucket, 5MB limit
   - `company-logos` - Public bucket, 2MB limit

## Storage Structure

Files are organized by user ID to ensure proper access control:

```
avatars/
├── [userId]/
│   └── profile/
│       └── [timestamp]_filename.jpg

project-images/
├── [userId]/
│   └── [portfolioId]/
│       └── [timestamp]_filename.jpg

certificates/
├── [userId]/
│   └── [portfolioId]/
│       └── [timestamp]_filename.jpg

company-logos/
├── [userId]/
│   └── [portfolioId]/
│       └── [timestamp]_filename.jpg
```

## Security

### Row Level Security (RLS)

The storage buckets use RLS policies to ensure:

- Users can only upload/update/delete their own files
- Files are organized by user ID in the path
- Public read access for all images (since portfolios are public)

### File Validation

The application validates files before upload:

- **File types**: Only specific image formats allowed (JPEG, PNG, WebP, GIF)
- **File size**: Maximum 5MB for most images, 2MB for logos
- **Client-side validation**: Files are checked before upload
- **Server-side validation**: Additional validation in the API

## Usage in the Application

### Image Upload Component

The application provides a reusable `ImageUpload` component:

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

<ImageUpload
  value={imageUrl}
  onChange={url => setImageUrl(url)}
  type="project" // 'avatar' | 'project' | 'certificate' | 'company'
  portfolioId={portfolioId}
  aspectRatio="video" // 'square' | 'video' | 'auto'
/>;
```

### API Endpoints

- **POST** `/api/v1/upload/image` - Upload an image
- **DELETE** `/api/v1/upload/image` - Delete an image

## Troubleshooting

### Common Issues

1. **"Storage service not available"**

   - Ensure environment variables are set correctly
   - Check that Supabase project is active

2. **"Unauthorized" errors**

   - Verify RLS policies are created correctly
   - Ensure user is authenticated

3. **"File too large" errors**
   - Check file size limits in bucket configuration
   - Implement client-side compression if needed

### Testing Uploads

To test the storage functionality:

1. Run the application locally with proper environment variables
2. Create a portfolio and navigate to the editor
3. Try uploading images in different sections:
   - Hero section → Avatar upload
   - Projects section → Project images
   - Experience section → Company logos
   - Certifications section → Certificate images

## Future Enhancements

- [ ] Client-side image compression and optimization
- [ ] Bulk upload functionality
- [ ] Image cropping and editing
- [ ] CDN integration for faster delivery
- [ ] Automatic thumbnail generation
