import { Injectable, Logger } from '@nestjs/common';
import { storageConfig } from '../../config/storage.config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class S3Provider {
  private readonly logger = new Logger(S3Provider.name);
  private readonly localStorageDir: string;

  constructor() {
    this.localStorageDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.localStorageDir)) {
      fs.mkdirSync(this.localStorageDir, { recursive: true });
    }
    this.logger.log(`Storage initialized. Bucket: ${storageConfig.bucket}, Endpoint: ${storageConfig.endpoint}`);
  }

  async upload(
    key: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<UploadResult> {
    const safeKey = key.replace(/[^a-zA-Z0-9._/-]/g, '_');
    const targetPath = path.join(this.localStorageDir, safeKey);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    await fs.promises.writeFile(targetPath, fileBuffer);
    this.logger.log(`Uploaded file key: ${safeKey} (${fileBuffer.length} bytes)`);

    const url = `${storageConfig.endpoint}/${storageConfig.bucket}/${safeKey}`;
    return {
      key: safeKey,
      url,
      size: fileBuffer.length,
      mimeType,
    };
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return `${storageConfig.endpoint}/${storageConfig.bucket}/${key}?expires=${expiresInSeconds}`;
  }

  async delete(key: string): Promise<boolean> {
    const targetPath = path.join(this.localStorageDir, key);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      this.logger.log(`Deleted file key: ${key}`);
      return true;
    }
    return false;
  }

  async exists(key: string): Promise<boolean> {
    const targetPath = path.join(this.localStorageDir, key);
    return fs.existsSync(targetPath);
  }
}
