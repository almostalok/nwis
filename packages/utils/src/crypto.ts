import * as crypto from 'crypto';

export class CryptoUtils {
  /**
   * Generates a SHA-256 checksum for a buffer or string.
   */
  static sha256(data: Buffer | Uint8Array | string): string {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Generates a deterministic UUID v5 or random UUID v4
   */
  static randomId(): string {
    return crypto.randomUUID();
  }
}
