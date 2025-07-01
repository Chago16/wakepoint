const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const MAPBOX_TOKEN = 'pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw';

const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

// 📍 Forward Geocode (Text → Coordinates)
const forwardGeocode = async (req, res) => {
  const { query } = req.query;

  try {
    const response = await geocodingClient
      .forwardGeocode({
        query,
        limit: 1,
      })
      .send();

    const result = response.body.features[0];
    res.json({ coords: result.center, place: result.place_name });
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
};

// 🔁 Reverse Geocode (Coordinates → Address)
const reverseGeocode = async (req, res) => {
  const { lat, lng } = req.query;
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  console.log('Parsed:', latNum, lngNum);

  try {
    const response = await geocodingClient
      .reverseGeocode({
        query: [lngNum, latNum],
        limit: 1,
      })
      .send();

    const result = response.body.features[0];
    const cleanedName = result.place_name.replace(/,?\s*Philippines$/, '');
    res.json({ address: cleanedName });

  } catch (err) {
    console.error('Reverse error:', err);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
};

const searchLocations = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 3) {
    return res.status(400).json({ error: 'Query too short' });
  }

  try {
    const response = await geocodingClient
      .forwardGeocode({
        query,
        autocomplete: true,
        limit: 5,
        types: ['place', 'address', 'poi'], // Optional: filter result types
        countries: ['PH'], // Optional: limit to Philippines
      })
      .send();

    const features = response.body.features.map((f) => ({
      id: f.id,
      name: f.place_name.replace(/,\s*Philippines$/, ''),
      coords: f.center,
    }));

    res.json(features);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
};

module.exports = {
  forwardGeocode,
  reverseGeocode,
  searchLocations, // ✅ add this
};
