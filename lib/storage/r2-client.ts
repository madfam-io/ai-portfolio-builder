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

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  publicUrl: string;
}

class R2Storage {
  private client: S3Client;
  private config: R2Config;

  constructor() {
    this.config = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
      bucketName:
        process.env.CLOUDFLARE_BUCKET_NAME || 'portfolio-builder-assets',
      region: process.env.CLOUDFLARE_REGION || 'auto',
      publicUrl:
        process.env.NEXT_PUBLIC_CDN_URL ||
        'https://cdn.portfolio-builder.madfam.io',
    };

    this.client = new S3Client({
      region: this.config.region,
      endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Upload file to Cloudflare R2
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        // Public read access
        ACL: 'public-read',
      });

      await this.client.send(command);
      return `${this.config.publicUrl}/${key}`;
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Get presigned URL for direct uploads from client
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('R2 presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error}`);
    }
  }

  /**
   * Get file from R2
   */
  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);
      const chunks: Uint8Array[] = [];

      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('R2 download error:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Generate public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }

  /**
   * Upload portfolio assets (images, documents, etc.)
   */
  async uploadPortfolioAsset(
    userId: string,
    portfolioId: string,
    fileName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `portfolios/${userId}/${portfolioId}/${fileName}`;
    return this.uploadFile(key, buffer, contentType, {
      userId,
      portfolioId,
      uploadedAt: new Date().toISOString(),
    });
  }

  /**
   * Upload user profile assets
   */
  async uploadProfileAsset(
    userId: string,
    fileName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `profiles/${userId}/${fileName}`;
    return this.uploadFile(key, buffer, contentType, {
      userId,
      type: 'profile',
      uploadedAt: new Date().toISOString(),
    });
  }

  /**
   * Upload temporary files (cleanup after 24h)
   */
  async uploadTempFile(
    fileName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `temp/${Date.now()}-${fileName}`;
    return this.uploadFile(key, buffer, contentType, {
      temporary: 'true',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}

// Export singleton instance
export const r2Storage = new R2Storage();

// Export types
export type { R2Config };
export { R2Storage };
