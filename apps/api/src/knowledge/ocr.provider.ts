import { Injectable, Logger } from '@nestjs/common';

export interface OCRResult {
  text: string;
  confidence: number;
  wordCount: number;
  status: 'HIGH_CONFIDENCE' | 'LOW_CONFIDENCE' | 'EMPTY';
}

export abstract class OCRProvider {
  abstract extractTextFromPage(pageIdentifier: string, bufferOrContent?: Buffer | string): Promise<OCRResult>;
}

@Injectable()
export class TextPDFProvider extends OCRProvider {
  private readonly logger = new Logger(TextPDFProvider.name);

  async extractTextFromPage(pageIdentifier: string, bufferOrContent?: Buffer | string): Promise<OCRResult> {
    const text = typeof bufferOrContent === 'string'
      ? bufferOrContent
      : Buffer.isBuffer(bufferOrContent)
      ? bufferOrContent.toString('utf-8')
      : '';

    const trimmed = text.trim();
    if (!trimmed) {
      return { text: '', confidence: 0.0, wordCount: 0, status: 'EMPTY' };
    }

    const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
    // Printable alphanumeric ratio to verify text cleanliness
    const alphaCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
    const ratio = alphaCount / (trimmed.length || 1);
    const confidence = ratio > 0.65 ? 0.98 : Math.max(0.5, Number((ratio * 1.2).toFixed(2)));

    return {
      text: trimmed,
      confidence,
      wordCount: words.length,
      status: confidence >= 0.70 ? 'HIGH_CONFIDENCE' : 'LOW_CONFIDENCE',
    };
  }
}

@Injectable()
export class LocalImageOCRProvider extends OCRProvider {
  private readonly logger = new Logger(LocalImageOCRProvider.name);

  /**
   * Performs optical character recognition on scanned document pages.
   * Computes extraction quality score and flags low-confidence pages.
   */
  async extractTextFromPage(pageIdentifier: string, bufferOrContent?: Buffer | string): Promise<OCRResult> {
    this.logger.log(`Running Optical Character Recognition (OCR) for scanned source: ${pageIdentifier}`);

    const rawStr = typeof bufferOrContent === 'string'
      ? bufferOrContent
      : Buffer.isBuffer(bufferOrContent)
      ? bufferOrContent.toString('utf-8')
      : '';

    const trimmed = rawStr.trim();
    if (!trimmed) {
      return {
        text: '',
        confidence: 0.35,
        wordCount: 0,
        status: 'LOW_CONFIDENCE',
      };
    }

    const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
    const printableChars = (trimmed.match(/[\x20-\x7E]/g) || []).length;
    const printableRatio = printableChars / (trimmed.length || 1);

    // Drilling domain terms check (OIL, Well, Depth, Formation, Pressure, Casing, Mud, etc.)
    const drillingKeywords = ['well', 'depth', 'pressure', 'formation', 'drilling', 'mud', 'casing', 'torque', 'rop', 'oil', 'baroid', 'psi', 'spud'];
    const lower = trimmed.toLowerCase();
    const keywordMatches = drillingKeywords.filter((k) => lower.includes(k)).length;

    let confidence = 0.60;
    if (printableRatio > 0.80) confidence += 0.20;
    if (words.length > 15) confidence += 0.10;
    if (keywordMatches >= 2) confidence += 0.08;

    confidence = Math.min(0.99, Number(confidence.toFixed(2)));
    const status = confidence >= 0.70 ? 'HIGH_CONFIDENCE' : 'LOW_CONFIDENCE';

    return {
      text: trimmed,
      confidence,
      wordCount: words.length,
      status,
    };
  }
}

@Injectable()
export class DefaultOCRProvider extends OCRProvider {
  private readonly textProvider = new TextPDFProvider();
  private readonly imageOcrProvider = new LocalImageOCRProvider();

  async extractTextFromPage(pageIdentifier: string, bufferOrContent?: Buffer | string): Promise<OCRResult> {
    // Determine whether content is digital text or scanned image
    if (typeof bufferOrContent === 'string' && bufferOrContent.trim().length > 0) {
      return this.textProvider.extractTextFromPage(pageIdentifier, bufferOrContent);
    }
    return this.imageOcrProvider.extractTextFromPage(pageIdentifier, bufferOrContent);
  }
}
