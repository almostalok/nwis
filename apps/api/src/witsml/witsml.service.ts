import { Injectable, Logger } from '@nestjs/common';
import { IWITSMLAdapter, WITSMLConnectionConfig } from '@nwis/types';

/**
 * WITSML Adapter Placeholder for Future OIL eRTMAC Integration
 *
 * Implements the standard WITSML 1.4.1.1 schema contract expected by OIL's
 * real-time monitoring center (eRTMAC). In Stage 01, this returns validated
 * simulated responses and architecture contracts.
 */
@Injectable()
export class WitsmlService implements IWITSMLAdapter {
  private readonly logger = new Logger(WitsmlService.name);

  async testConnection(config: WITSMLConnectionConfig): Promise<{ connected: boolean; serverVersion: string; message: string }> {
    this.logger.log(`[WITSML Placeholder] Probing connection to ${config.endpointUrl} (version: ${config.witsmlVersion})`);
    return {
      connected: true,
      serverVersion: `WITSML-${config.witsmlVersion}-OIL-COMPATIBLE-SANDBOX`,
      message: 'Connection validated against NWIS OIL-compatible WITSML 1.4.1.1 specification contract.',
    };
  }

  async getCap(config: WITSMLConnectionConfig): Promise<Record<string, any>> {
    return {
      witsmlVersion: config.witsmlVersion,
      dataSchemaVersion: '1.4.1.1',
      supportedObjects: [
        'well',
        'wellbore',
        'trajectory',
        'log',
        'mudLog',
        'tubular',
        'bhaRun',
        'cementJob',
      ],
      functionsSupported: [
        'WMLS_GetCap',
        'WMLS_GetBaseMsg',
        'WMLS_GetFromStore',
        'WMLS_AddToStore',
        'WMLS_UpdateInStore',
      ],
      compression: 'gzip',
      authenticationMode: 'HTTP_BASIC_TLS_OR_CLIENT_CERT',
    };
  }

  async getWellList(config: WITSMLConnectionConfig): Promise<Array<{ uid: string; name: string; timeZone?: string }>> {
    return [
      { uid: 'WITSML-SYN-001', name: 'NWIS Discovery Well 01', timeZone: '+05:30' },
      { uid: 'WITSML-SYN-002', name: 'NWIS Duliajan North 02', timeZone: '+05:30' },
      { uid: 'WITSML-SYN-003', name: 'NWIS Precedent Well 03 (Stuck Pipe)', timeZone: '+05:30' },
    ];
  }

  async getTrajectory(config: WITSMLConnectionConfig, wellUid: string, wellboreUid: string): Promise<any[]> {
    return [
      { md: 0, tvd: 0, incl: 0, azi: 0 },
      { md: 1000, tvd: 1000, incl: 1.2, azi: 45.0 },
      { md: 2000, tvd: 1995, incl: 4.8, azi: 62.0 },
      { md: 3000, tvd: 2980, incl: 8.5, azi: 75.0 },
    ];
  }

  async getLogData(
    config: WITSMLConnectionConfig,
    wellUid: string,
    wellboreUid: string,
    logUid: string,
    startIndex?: number,
    endIndex?: number
  ): Promise<any[]> {
    return [
      { depth: startIndex || 3180, rop: 14.5, wob: 110, rpm: 120, torque: 11.5, spp: 190, flowRate: 2200 },
      { depth: (startIndex || 3180) + 10, rop: 9.2, wob: 125, rpm: 115, torque: 18.4, spp: 205, flowRate: 2200 },
      { depth: (startIndex || 3180) + 20, rop: 4.1, wob: 135, rpm: 95, torque: 26.8, spp: 220, flowRate: 2150 },
      { depth: (startIndex || 3180) + 30, rop: 0.5, wob: 140, rpm: 40, torque: 34.5, spp: 245, flowRate: 1900 },
    ];
  }

  subscribeRealtime(config: WITSMLConnectionConfig, wellUid: string, callback: (sample: any) => void): () => void {
    this.logger.log(`[WITSML Placeholder] Initiating simulated real-time stream subscription for well ${wellUid}`);
    const interval = setInterval(() => {
      callback({
        timestamp: new Date().toISOString(),
        wellUid,
        depth: 3200 + Math.random() * 5,
        rop: 12 + Math.random() * 4,
        wob: 115 + Math.random() * 10,
        torque: 13 + Math.random() * 2,
      });
    }, 5000);

    return () => clearInterval(interval);
  }
}
