import { Injectable, Logger } from '@nestjs/common';
import { RealtimeDrillingAdapter, AdapterStatus, SampleCallback } from './realtime-drilling.adapter';
import { RealtimeDrillingSample } from '@nwis/types';

/**
 * Production Placeholder for WITSML 1.4.1.1 / 2.0 Live Telemetry Stream
 *
 * Designed to connect to external WITSML servers via SOAP/WSDL or ETP (Energistics Transfer Protocol)
 * when deployed on-site or connected to OIL rig telemetry servers.
 */
@Injectable()
export class WITSMLLiveAdapter implements RealtimeDrillingAdapter {
  private readonly logger = new Logger(WITSMLLiveAdapter.name);
  readonly adapterName = 'WITSML-Live-Stream-Connector (Placeholder)';
  private isConnected = false;
  private subscribedWells = new Set<string>();
  private sampleCallback?: SampleCallback;

  async connect(): Promise<void> {
    this.logger.warn(
      'WITSMLLiveAdapter: External WITSML endpoint not configured. System is in Synthetic Prototype Mode.'
    );
    this.isConnected = false;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.subscribedWells.clear();
  }

  async subscribe(wellId: string): Promise<void> {
    this.subscribedWells.add(wellId);
    this.logger.log(`Subscribed to WITSML live stream for well: ${wellId}`);
  }

  async unsubscribe(wellId: string): Promise<void> {
    this.subscribedWells.delete(wellId);
  }

  onSample(callback: SampleCallback): void {
    this.sampleCallback = callback;
  }

  getStatus(): AdapterStatus {
    return {
      connected: this.isConnected,
      adapterName: this.adapterName,
      sourceType: 'WITSML_LIVE_STANDBY',
      subscribedWells: Array.from(this.subscribedWells),
      samplesReceived: 0,
      statusMessage:
        'Awaiting live WITSML/ETP connection string. System running SyntheticLiveStreamAdapter for demonstration.',
    };
  }
}
