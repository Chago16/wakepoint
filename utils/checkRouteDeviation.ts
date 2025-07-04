import * as turf from '@turf/turf';

export function checkRouteDeviation(
  userCoords: [number, number],
  routeBuffer: any // GeoJSON Polygon or MultiPolygon Feature
): boolean {
  if (!routeBuffer) return false;

  const point = turf.point(userCoords);

  try {
    const geometryType = routeBuffer.geometry?.type;

    if (geometryType === 'Polygon') {
      const poly = turf.polygon(routeBuffer.geometry.coordinates);
      return !turf.booleanPointInPolygon(point, poly); // ✅ FIXED
    }

    if (geometryType === 'MultiPolygon') {
      const polygons = routeBuffer.geometry.coordinates;
      for (const coords of polygons) {
        const poly = turf.polygon(coords);
        if (turf.booleanPointInPolygon(point, poly)) {
          return false; // inside at least one polygon
        }
      }
      return true; // outside all polygons
    }

    console.warn('⚠️ Unexpected geometry type in routeBuffer:', geometryType);
    return false;
  } catch (err) {
    console.error('❌ Error in checkRouteDeviation:', err);
    return false;
  }
}
