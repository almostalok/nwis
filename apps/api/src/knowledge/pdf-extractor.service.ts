import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { OCRProvider } from './ocr.provider';
// @ts-ignore
import { PDFParse } from 'pdf-parse';

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
   * Supports both binary PDF inputs and structured text/markdown documents.
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

    const buffer = fs.readFileSync(resolvedPath);
    const isPdf =
      filePath.toLowerCase().endsWith('.pdf') ||
      (buffer.length >= 5 && buffer.slice(0, 5).toString('ascii') === '%PDF-');

    // 1. Handle Binary PDF files
    if (isPdf) {
      try {
        const parser = new (PDFParse as any)(new Uint8Array(buffer));
        const parsed = await parser.getText();
        const rawPages = (parsed && parsed.pages && parsed.pages.length > 0)
          ? parsed.pages.map((p: any) => p.text || '')
          : (parsed?.text || '').split(/\f/).filter((p: string) => p.trim().length > 0);

        if (rawPages.length > 0) {
          const pages: ExtractedPage[] = [];
          for (let i = 0; i < rawPages.length; i++) {
            const pageText = rawPages[i].trim();
            const words = pageText.split(/\s+/).filter((w: string) => w.length > 0);

            // If page text is very sparse (< 10 words), run OCR on the buffer
            if (words.length < 10) {
              const ocrRes = await this.ocrProvider.extractTextFromPage(
                `${filePath}#page=${i + 1}`,
                buffer,
              );
              pages.push({
                pageNumber: i + 1,
                text: ocrRes.text || pageText,
                confidence: ocrRes.confidence,
                wordCount: ocrRes.wordCount || words.length,
                isOcr: true,
              });
            } else {
              pages.push({
                pageNumber: i + 1,
                text: pageText,
                confidence: 0.98,
                wordCount: words.length,
                isOcr: false,
              });
            }
          }
          return pages;
        }
      } catch (pdfErr: any) {
        this.logger.warn(
          `Binary PDF parser error for ${filePath}: ${pdfErr.message}, falling back to OCR provider`,
        );
        const ocrRes = await this.ocrProvider.extractTextFromPage(filePath, buffer);
        return [
          {
            pageNumber: 1,
            text: ocrRes.text,
            confidence: ocrRes.confidence,
            wordCount: ocrRes.wordCount,
            isOcr: true,
          },
        ];
      }
    }

    // 2. Handle Structured Text / Markdown documents
    const rawContent = buffer.toString('utf-8');

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
