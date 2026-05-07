export function getBoundingBox(lat: number | string, lon: number | string, distanceInKm: number | string) {
  // Forzamos la conversión a número para evitar concatenaciones accidentales
  const _lat = Number(lat);
  const _lon = Number(lon);
  const _dist = Number(distanceInKm);

  const EARTH_RADIUS_KM = 6371;

  const deltaLat = (_dist / EARTH_RADIUS_KM) * (180 / Math.PI);
  const deltaLon = (_dist / EARTH_RADIUS_KM) * (180 / Math.PI) / Math.cos(_lat * Math.PI / 180);

  return {
    minLat: _lat - deltaLat,
    maxLat: _lat + deltaLat,
    minLon: _lon - deltaLon,
    maxLon: _lon + deltaLon,
  };
}