import { IDataAdapter, DataSourceType } from '@nwis/types';
import * as fs from 'fs';

export class JsonDataAdapter implements IDataAdapter<string> {
  readonly sourceType = DataSourceType.SYNTHETIC;

  async fetchRawData(sourceConfig: { filePath?: string; rawContent?: string }): Promise<string> {
    if (sourceConfig.rawContent) {
      return sourceConfig.rawContent;
    }
    if (sourceConfig.filePath) {
      return fs.promises.readFile(sourceConfig.filePath, 'utf-8');
    }
    throw new Error('JsonDataAdapter requires either rawContent or filePath');
  }
}

export class CsvDataAdapter implements IDataAdapter<string> {
  readonly sourceType = DataSourceType.CSV;

  async fetchRawData(sourceConfig: { filePath?: string; rawContent?: string }): Promise<string> {
    if (sourceConfig.rawContent) {
      return sourceConfig.rawContent;
    }
    if (sourceConfig.filePath) {
      return fs.promises.readFile(sourceConfig.filePath, 'utf-8');
    }
    throw new Error('CsvDataAdapter requires either rawContent or filePath');
  }
}
