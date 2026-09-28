import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider } from '@nwis/types';
import { CryptoUtils } from '@nwis/utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseStorageDir: string;

  constructor() {
    this.baseStorageDir = path.resolve(process.env.STORAGE_LOCAL_PATH || './data/storage');
    if (!fs.existsSync(this.baseStorageDir)) {
      fs.mkdirSync(this.baseStorageDir, { recursive: true });
    }
  }

  async saveFile(
    fileBuffer: Uint8Array,
    fileName: string,
    mimeType: string
  ): Promise<{ storagePath: string; checksum: string; sizeBytes: number }> {
    const checksum = CryptoUtils.sha256(fileBuffer);
    const datePrefix = new Date().toISOString().slice(0, 10);
    const targetDir = path.join(this.baseStorageDir, datePrefix);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fullPath = path.join(targetDir, uniqueFileName);

    await fs.promises.writeFile(fullPath, Buffer.from(fileBuffer));
    const relativePath = path.relative(this.baseStorageDir, fullPath).replace(/\\/g, '/');

    this.logger.log(`Stored file ${fileName} (${fileBuffer.length} bytes) to ${relativePath}`);
    return {
      storagePath: relativePath,
      checksum,
      sizeBytes: fileBuffer.length,
    };
  }

  async getFile(storagePath: string): Promise<Uint8Array> {
    const fullPath = path.join(this.baseStorageDir, storagePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found at path: ${storagePath}`);
    }
    return fs.promises.readFile(fullPath);
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseStorageDir, storagePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    return `${apiUrl}/api/v1/storage/${storagePath}`;
  }
}
