/**
 * Geospatial utility functions
 */
export class SpatialUtils {
  private static readonly EARTH_RADIUS_KM = 6371.0;

  /**
   * Calculates the Great Circle / Haversine distance between two points in kilometers.
   */
  static haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Number((this.EARTH_RADIUS_KM * c).toFixed(2));
  }

  /**
   * Generates a bounding box [minLat, maxLat, minLon, maxLon] around a center point with a radius in km.
   */
  static boundingBox(
    lat: number,
    lon: number,
    radiusKm: number
  ): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    const latDelta = radiusKm / 111.0; // ~111 km per degree latitude
    const lonDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

    return {
      minLat: Number((lat - latDelta).toFixed(6)),
      maxLat: Number((lat + latDelta).toFixed(6)),
      minLon: Number((lon - lonDelta).toFixed(6)),
      maxLon: Number((lon + lonDelta).toFixed(6)),
    };
  }
}
