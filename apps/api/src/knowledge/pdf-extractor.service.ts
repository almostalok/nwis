import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { OCRProvider } from './ocr.provider';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  confidence: number;
  wordCount: number;
  isOcr: boolean;
}

@Injectable()
export class DocumentExtractorService {
  private readonly logger = new Logger(DocumentExtractorService.name);

  constructor(private readonly ocrProvider: OCRProvider) {}

  /**
   * Extracts text preserving page boundaries from a document file path.
   */
  async extractPages(filePath: string): Promise<ExtractedPage[]> {
    this.logger.log(`Extracting pages from document: ${filePath}`);

    // Resolve path relative to workspace or absolute
    let resolvedPath = filePath;
    if (!fs.existsSync(resolvedPath)) {
      resolvedPath = path.resolve(process.cwd(), filePath);
    }
    if (!fs.existsSync(resolvedPath)) {
      resolvedPath = path.resolve(__dirname, '../../../../', filePath);
    }

    if (!fs.existsSync(resolvedPath)) {
      this.logger.warn(`Document file not found at: ${filePath}, checking samples directory`);
      const baseName = path.basename(filePath);
      const fallbackSample = path.resolve(process.cwd(), 'data/samples', baseName);
      if (fs.existsSync(fallbackSample)) {
        resolvedPath = fallbackSample;
      } else {
        throw new Error(`Document file not found at: ${filePath}`);
      }
    }

    const rawContent = fs.readFileSync(resolvedPath, 'utf-8');

    // Check for explicit page separators (e.g. "=== PAGE 1 ===" or form feed "\f")
    const formFeedPages = rawContent.split(/\f/);
    if (formFeedPages.length > 1) {
      return formFeedPages.map((pageText, idx) => ({
        pageNumber: idx + 1,
        text: pageText.trim(),
        confidence: 0.98,
        wordCount: pageText.trim().split(/\s+/).length,
        isOcr: false,
      }));
    }

    const pageSeparatorPattern = /(?:===\s*PAGE\s*(\d+)\s*===|---+\s*Page\s*(\d+)\s*---+)/i;
    if (pageSeparatorPattern.test(rawContent)) {
      const parts = rawContent.split(/(?:===\s*PAGE\s*\d+\s*===|---+\s*Page\s*\d+\s*---+)/i);
      const pages: ExtractedPage[] = [];
      let pageNum = 1;
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          pages.push({
            pageNumber: pageNum++,
            text: trimmed,
            confidence: 0.98,
            wordCount: trimmed.split(/\s+/).length,
            isOcr: false,
          });
        }
      }
      if (pages.length > 0) return pages;
    }

    // If single long document, segment logically into pages of approximately 1800 characters
    // preserving section headers where possible
    const sections = rawContent.split(/(?=[A-Z\s]{4,}:)/);
    if (sections.length > 1 && rawContent.length > 1200) {
      const pages: ExtractedPage[] = [];
      let currentPageText = '';
      let pageNum = 1;

      for (const section of sections) {
        if (currentPageText.length + section.length > 1500 && currentPageText.length > 0) {
          pages.push({
            pageNumber: pageNum++,
            text: currentPageText.trim(),
            confidence: 0.97,
            wordCount: currentPageText.trim().split(/\s+/).length,
            isOcr: false,
          });
          currentPageText = section;
        } else {
          currentPageText += (currentPageText ? '\n\n' : '') + section;
        }
      }

      if (currentPageText.trim().length > 0) {
        pages.push({
          pageNumber: pageNum,
          text: currentPageText.trim(),
          confidence: 0.97,
          wordCount: currentPageText.trim().split(/\s+/).length,
          isOcr: false,
        });
      }

      return pages;
    }

    // Default single page
    const ocrResult = await this.ocrProvider.extractTextFromPage(filePath, rawContent);
    return [
      {
        pageNumber: 1,
        text: ocrResult.text.trim(),
        confidence: ocrResult.confidence,
        wordCount: ocrResult.wordCount,
        isOcr: true,
      },
    ];
  }
}
