const axios = require('axios');

const getDirections = async (req, res) => {
  console.log('📍 directionsController HIT');
  try {
    const { from, to, waypoints = [] } = req.body;

    const allPoints = [from, ...waypoints, to];
    const coordinatesStr = allPoints.map(coord => coord.join(',')).join(';');
    const radiusesStr = allPoints.map(() => '25').join(';'); // Snap within 25m

    const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesStr}`, {
      params: {
        access_token: 'pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw',
        geometries: 'geojson',
        overview: 'full',
        steps: false,
        radiuses: radiusesStr
      }
    });

    const route = response.data.routes[0];
    res.json({
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to get directions' });
  }
};

module.exports = { getDirections };
