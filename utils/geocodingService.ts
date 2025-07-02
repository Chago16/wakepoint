import { BASE_URL } from '@/config'; // or '@/utils/config'

export const getCoordinatesFromAddress = async (query: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/mapbox/geocode?query=${encodeURIComponent(query)}`);
    return await res.json(); // { coords, place }
  } catch (err) {
    console.error('Forward geocoding error:', err);
    return null;
  }
};

export const getAddressFromCoordinates = async (lng: number, lat: number) => {
  try {
    const res = await fetch(`${BASE_URL}/api/mapbox/reverse-geocode?lat=${lat}&lng=${lng}`);
    return await res.json(); // { address }
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
};

// 🔍 New: Search locations (autocomplete-style)
export const searchLocations = async (query: string) => {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(`${BASE_URL}/api/mapbox/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Search request failed: ${res.status}`);
    
    const data = await res.json();
    // Expected: [{ id, name, coords }]
    return data;
  } catch (err) {
    console.error('Search location error:', err);
    return [];
  }
};
