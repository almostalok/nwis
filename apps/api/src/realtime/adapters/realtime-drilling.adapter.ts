import { RealtimeDrillingSample } from '@nwis/types';

export interface AdapterStatus {
  connected: boolean;
  adapterName: string;
  sourceType: string;
  subscribedWells: string[];
  samplesReceived: number;
  lastSampleTimestamp?: Date;
  statusMessage: string;
}

export type SampleCallback = (sample: RealtimeDrillingSample) => void | Promise<void>;

export interface RealtimeDrillingAdapter {
  readonly adapterName: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(wellId: string): Promise<void>;
  unsubscribe(wellId: string): Promise<void>;
  onSample(callback: SampleCallback): void;
  getStatus(): AdapterStatus;
}
