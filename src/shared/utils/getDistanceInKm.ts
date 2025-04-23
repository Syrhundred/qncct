export const getDistanceInKm = (
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number],
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
