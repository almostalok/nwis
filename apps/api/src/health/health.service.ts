import { Injectable } from '@nestjs/common';
import { prisma } from '@nwis/database';

export interface HealthCheckResult {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  checks: {
    database: {
      status: 'UP' | 'DOWN';
      latencyMs: number;
      details?: string;
    };
    realtimeStream: {
      status: 'UP' | 'DOWN';
      activeSimulations: number;
    };
    memory: {
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
      status: 'NORMAL' | 'HIGH';
    };
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  async checkHealth(): Promise<HealthCheckResult> {
    const startDb = Date.now();
    let dbStatus: 'UP' | 'DOWN' = 'UP';
    let dbLatency = 0;
    let dbDetails: string | undefined = undefined;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - startDb;
    } catch (err: any) {
      dbStatus = 'DOWN';
      dbDetails = err.message;
    }

    const mem = process.memoryUsage();
    const heapUsedMb = Math.round(mem.heapUsed / (1024 * 1024));
    const heapTotalMb = Math.round(mem.heapTotal / (1024 * 1024));
    const rssMb = Math.round(mem.rss / (1024 * 1024));

    const isHealthy = dbStatus === 'UP';

    return {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      version: '1.0.0-stage04',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatency,
          details: dbDetails,
        },
        realtimeStream: {
          status: 'UP',
          activeSimulations: 0,
        },
        memory: {
          heapUsedMb,
          heapTotalMb,
          rssMb,
          status: heapUsedMb > 1024 ? 'HIGH' : 'NORMAL',
        },
      },
    };
  }

  async checkLiveness(): Promise<{ status: string; uptime: number }> {
    return {
      status: 'OK',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  async checkReadiness(): Promise<{ status: string; database: string }> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'READY',
        database: 'CONNECTED',
      };
    } catch {
      return {
        status: 'NOT_READY',
        database: 'DISCONNECTED',
      };
    }
  }

  getDependencies() {
    return {
      name: 'NWIS Drilling Intelligence Platform',
      role: 'Decision-Support Advisory System',
      oilCompatibility: 'eRTMAC & WITSML 1.4.1.1/2.0 Ready',
      subsystems: [
        {
          name: 'PostgreSQL + PostGIS',
          purpose: 'Geospatial well radius search & subsurface relational data',
          status: 'ONLINE',
          isCritical: true,
        },
        {
          name: 'Vector & Semantic Engine',
          purpose: '64-dim domain-normalized embeddings for hybrid search',
          status: 'ONLINE',
          isCritical: true,
        },
        {
          name: 'Real-time Streaming Engine',
          purpose: 'Server-Sent Events (SSE) telemetry broadcast',
          status: 'ONLINE',
          isCritical: true,
        },
        {
          name: 'Multi-Hazard Risk Engine',
          purpose: 'Stuck pipe, lost circulation, kick, torque & cementing risk fusion',
          status: 'ONLINE',
          isCritical: true,
        },
        {
          name: 'OIL eRTMAC Integration Adapter',
          purpose: 'Synthetic live stream active; production eRTMAC interface ready',
          status: 'STANDBY_READY',
          isCritical: false,
        },
      ],
    };
  }
}
