import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export class CryptoUtils {
  /**
   * Generates a SHA-256 checksum for a buffer or string (used for file integrity).
   */
  static sha256(data: Buffer | Uint8Array | string): string {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Asynchronously hashes a password using bcrypt with a unique salt (cost factor = 10).
   */
  static async hashPassword(password: string, saltRounds = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Asynchronously verifies a plaintext password against a stored hash.
   * Supports bcrypt hashes ($2a$, $2b$, $2y$) and legacy SHA-256 hashes during migration.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;

    // Standard bcrypt hash check
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return bcrypt.compare(password, hash);
    }

    // Legacy SHA-256 verification (for backwards compatibility during demo migration)
    const legacyHash = this.sha256(password);
    return legacyHash === hash;
  }

  /**
   * Generates a deterministic UUID v5 or random UUID v4
   */
  static randomId(): string {
    return crypto.randomUUID();
  }
}

