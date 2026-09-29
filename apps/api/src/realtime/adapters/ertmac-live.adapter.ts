import { Injectable, Logger } from '@nestjs/common';
import { RealtimeDrillingAdapter, AdapterStatus, SampleCallback } from './realtime-drilling.adapter';
import { RealtimeDrillingSample } from '@nwis/types';

/**
 * Production Placeholder for Oil India Limited (OIL) eRTMAC System
 * 
 * DISCLAIMER:
 * There is NO connection to OIL's production eRTMAC in this prototype.
 * This class establishes the exact adapter interface required for production integration
 * once authorized credentials, API endpoints, and network conduits (e.g. MQTT/OPC-UA/REST)
 * are provided by Oil India Limited.
 */
@Injectable()
export class ERTMACAdapter implements RealtimeDrillingAdapter {
  private readonly logger = new Logger(ERTMACAdapter.name);
  readonly adapterName = 'OIL-eRTMAC-Live-Connector (Placeholder)';
  private isConnected = false;
  private subscribedWells = new Set<string>();
  private sampleCallback?: SampleCallback;

  async connect(): Promise<void> {
    this.logger.warn(
      'ERTMACAdapter: Production OIL eRTMAC endpoint not configured. System is in Synthetic Prototype Mode.'
    );
    this.isConnected = false;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.subscribedWells.clear();
  }

  async subscribe(wellId: string): Promise<void> {
    this.subscribedWells.add(wellId);
    this.logger.log(`Subscribed to eRTMAC stream for well: ${wellId}`);
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
      sourceType: 'PRODUCTION_ERTMAC_STANDBY',
      subscribedWells: Array.from(this.subscribedWells),
      samplesReceived: 0,
      statusMessage:
        'Awaiting production OIL eRTMAC credentials and network conduit. System running SyntheticLiveStreamAdapter for demonstration.',
    };
  }
}
