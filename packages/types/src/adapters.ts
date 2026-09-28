import { DataSourceType } from './enums';
import { IngestionError, IngestionResult } from './ingestion';

/**
 * Adapter interface to connect to any data source (Synthetic files, CSV, WITSML, eRTMAC API)
 */
export interface IDataAdapter<TRaw = any> {
  readonly sourceType: DataSourceType;
  fetchRawData(sourceConfig: Record<string, any>): Promise<TRaw>;
}

/**
 * Parser interface to convert raw payloads into structured records
 */
export interface IDataParser<TRaw = any, TParsed = any> {
  parse(raw: TRaw): Promise<TParsed[]> | TParsed[];
}

/**
 * Validator interface to ensure integrity before database insertion
 */
export interface IDataValidator<T = any> {
  validate(record: T, index?: number): { isValid: boolean; errors: IngestionError[]; record: T };
}

/**
 * Normalizer interface to standardize units, event terminology, and depths
 */
export interface IDataNormalizer<T = any, TNormalized = any> {
  normalize(record: T): TNormalized;
}

/**
 * Mapper interface to convert normalized records into canonical database entity DTOs
 */
export interface IDataMapper<TInput = any, TOutput = any> {
  map(input: TInput): TOutput;
}

/**
 * High-level Ingestion Pipeline Contract
 */
export interface IIngestionPipeline<TRaw = any, TEntity = any> {
  run(rawPayload: TRaw, sourceConfig: Record<string, any>): Promise<IngestionResult<TEntity>>;
}

/**
 * Storage Provider interface for Document Repository
 */
export interface IStorageProvider {
  saveFile(fileBuffer: Uint8Array, fileName: string, mimeType: string): Promise<{ storagePath: string; checksum: string; sizeBytes: number }>;
  getFile(storagePath: string): Promise<Uint8Array>;
  deleteFile(storagePath: string): Promise<boolean>;
  getDownloadUrl(storagePath: string): Promise<string>;
}

/**
 * Future WITSML 1.3.1.1 / 1.4.1.1 / 2.0 Adapter Specification
 */
export interface WITSMLConnectionConfig {
  endpointUrl: string;
  username?: string;
  password?: string;
  witsmlVersion: '1.3.1.1' | '1.4.1.1' | '2.0';
  timeoutMs?: number;
  soapAction?: string;
}

export interface IWITSMLAdapter {
  testConnection(config: WITSMLConnectionConfig): Promise<{ connected: boolean; serverVersion: string; message: string }>;
  getCap(config: WITSMLConnectionConfig): Promise<Record<string, any>>;
  getWellList(config: WITSMLConnectionConfig): Promise<Array<{ uid: string; name: string; timeZone?: string }>>;
  getTrajectory(config: WITSMLConnectionConfig, wellUid: string, wellboreUid: string): Promise<any[]>;
  getLogData(config: WITSMLConnectionConfig, wellUid: string, wellboreUid: string, logUid: string, startIndex?: number, endIndex?: number): Promise<any[]>;
  subscribeRealtime?(config: WITSMLConnectionConfig, wellUid: string, callback: (sample: any) => void): () => void;
}

/**
 * Future OIL eRTMAC Integration Interface
 */
export interface IERTMACAdapter {
  connect(credentials: Record<string, any>): Promise<boolean>;
  fetchRealtimeDrillingState(wellId: string): Promise<any>;
  fetchHistoricalRun(wellId: string, fromTimestamp: Date, toTimestamp: Date): Promise<any[]>;
}
