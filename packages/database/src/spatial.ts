import { PrismaClient, Prisma } from '@prisma/client';
import { NearbyWellResult, WellStatus, WellType } from '@nwis/types';
import { SpatialUtils } from '@nwis/utils';

export interface SpatialQueryParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  formation?: string;
  status?: WellStatus;
  wellType?: WellType;
  limit?: number;
}

export class SpatialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Queries nearby wells within radiusKm of (latitude, longitude).
   * Supports PostGIS ST_DWithin/ST_Distance, PostgreSQL earthdistance, or indexed bounding-box.
   * Strictly parameterized with Prisma.sql to prevent SQL injection.
   */
  private hasPostgis: boolean | null = null;
  private hasEarthdistance: boolean | null = null;

  private async detectExtensions(): Promise<void> {
    if (this.hasPostgis === null) {
      try {
        const ext: any[] = await this.prisma.$queryRaw`
          SELECT extname FROM pg_extension WHERE extname IN ('postgis', 'earthdistance');
        `;
        const names = ext.map((e) => e.extname);
        this.hasPostgis = names.includes('postgis');
        this.hasEarthdistance = names.includes('earthdistance');
      } catch {
        this.hasPostgis = false;
        this.hasEarthdistance = false;
      }
    }
  }

  async findNearbyWells(params: SpatialQueryParams): Promise<NearbyWellResult[]> {
    const { latitude, longitude, radiusKm, formation, status, wellType, limit = 20 } = params;
    await this.detectExtensions();

    const statusClause = status ? Prisma.sql`AND w.status = ${status}::"WellStatus"` : Prisma.empty;
    const wellTypeClause = wellType ? Prisma.sql`AND w."wellType" = ${wellType}::"WellType"` : Prisma.empty;
    const radiusMeters = radiusKm * 1000.0;

    if (this.hasPostgis) {
      try {
        const rawResults: any[] = await this.prisma.$queryRaw`
          SELECT 
            w.id,
            w."wellId",
            w.name,
            w.field,
            w.latitude,
            w.longitude,
            w."totalDepth",
            w.status,
            w."wellType",
            (ST_Distance(
              ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
            ) / 1000.0) AS "distanceKm"
          FROM wells w
          WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )
          ${statusClause}
          ${wellTypeClause}
          ORDER BY "distanceKm" ASC
          LIMIT ${limit};
        `;

        return this.enrichWellResults(rawResults, formation);
      } catch {
        // Fallback
      }
    }

    if (this.hasEarthdistance) {
      try {
        const rawResults: any[] = await this.prisma.$queryRaw`
          SELECT 
            w.id,
            w."wellId",
            w.name,
            w.field,
            w.latitude,
            w.longitude,
            w."totalDepth",
            w.status,
            w."wellType",
            (earth_distance(ll_to_earth(w.latitude, w.longitude), ll_to_earth(${latitude}, ${longitude})) / 1000.0) AS "distanceKm"
          FROM wells w
          WHERE earth_distance(ll_to_earth(w.latitude, w.longitude), ll_to_earth(${latitude}, ${longitude})) <= ${radiusMeters}
          ${statusClause}
          ${wellTypeClause}
          ORDER BY "distanceKm" ASC
          LIMIT ${limit};
        `;

        return this.enrichWellResults(rawResults, formation);
      } catch {
        // Fallback
      }
    }
        // Fallback to indexed Bounding Box + Haversine calculation in application
        const box = SpatialUtils.boundingBox(latitude, longitude, radiusKm);
        const candidateWells = await this.prisma.well.findMany({
          where: {
            latitude: { gte: box.minLat, lte: box.maxLat },
            longitude: { gte: box.minLon, lte: box.maxLon },
            ...(status ? { status } : {}),
            ...(wellType ? { wellType } : {}),
          },
          include: {
            formations: true,
            _count: { select: { events: true } },
          },
        });

        const matched: NearbyWellResult[] = [];
        for (const w of candidateWells) {
          const dist = SpatialUtils.haversineDistanceKm(latitude, longitude, w.latitude, w.longitude);
          if (dist <= radiusKm) {
            matched.push({
              id: w.id,
              wellId: w.wellId,
              name: w.name,
              field: w.field,
              distanceKm: dist,
              latitude: w.latitude,
              longitude: w.longitude,
              totalDepth: w.totalDepth,
              status: w.status as WellStatus,
              wellType: w.wellType as WellType,
              formationSummary: w.formations.map((f) => f.formationName),
              eventCount: w._count.events,
            });
          }
        }
        
        matched.sort((a, b) => a.distanceKm - b.distanceKm);
        return formation
          ? matched.filter((w) => w.formationSummary.some((f) => f.toLowerCase().includes(formation.toLowerCase()))).slice(0, limit)
          : matched.slice(0, limit);
      }

  private async enrichWellResults(rawResults: any[], formationFilter?: string): Promise<NearbyWellResult[]> {
    if (!rawResults || rawResults.length === 0) return [];

    const wellIds = rawResults.map((r) => r.id);
    const formations = await this.prisma.formationInterval.findMany({
      where: { wellId: { in: wellIds } },
      select: { wellId: true, formationName: true },
    });

    const eventCounts = await this.prisma.operationalEvent.groupBy({
      by: ['wellId'],
      where: { wellId: { in: wellIds } },
      _count: { id: true },
    });

    const formationMap = new Map<string, string[]>();
    for (const f of formations) {
      const list = formationMap.get(f.wellId) || [];
      list.push(f.formationName);
      formationMap.set(f.wellId, list);
    }

    const eventCountMap = new Map<string, number>();
    for (const ec of eventCounts) {
      eventCountMap.set(ec.wellId, ec._count.id);
    }

    let results: NearbyWellResult[] = rawResults.map((r) => ({
      id: r.id,
      wellId: r.wellId,
      name: r.name,
      field: r.field,
      distanceKm: Number(Number(r.distanceKm).toFixed(2)),
      latitude: r.latitude,
      longitude: r.longitude,
      totalDepth: r.totalDepth,
      status: r.status as WellStatus,
      wellType: r.wellType as WellType,
      formationSummary: formationMap.get(r.id) || [],
      eventCount: eventCountMap.get(r.id) || 0,
    }));

    if (formationFilter) {
      results = results.filter((w) =>
        w.formationSummary.some((f) => f.toLowerCase().includes(formationFilter.toLowerCase()))
      );
    }

    return results;
  }
}
