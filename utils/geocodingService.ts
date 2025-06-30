import { BASE_URL } from '@/config'; // or '@/utils/config' if you put BASE_URL there

export const getCoordinatesFromAddress = async (query: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/mapbox/geocode?query=${encodeURIComponent(query)}`);
    return await res.json(); // { coords, place }
  } catch (err) {
    console.error('Forward geocoding error:', err);
    return null;
  }
};

export const getAddressFromCoordinates = async (lat: number, lng: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/mapbox/reverse-geocode?lat=${lat}&lng=${lng}`);
    return await res.json(); // { address }
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
};
