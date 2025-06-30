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
    res.json({ address: result.place_name });
  } catch (err) {
    console.error('Reverse error:', err);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
};


module.exports = {
  forwardGeocode,
  reverseGeocode,
};
