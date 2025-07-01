const axios = require('axios');

const getRoute = async (req, res) => {
  try {
    const { from, to, waypoints = [] } = req.body;

    // Combine coordinates: from → waypoints → to
    const allPoints = [from, ...waypoints, to];
    const coordinatesStr = allPoints.map(coord => coord.join(',')).join(';');

    // Radiuses for snapping (set all to 25 meters for example)
    const radiusesStr = allPoints.map(() => '25').join(';');

    const response = await axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/' + coordinatesStr, {
      params: {
        access_token: process.env.MAPBOX_API_KEY,
        geometries: 'geojson',
        overview: 'full',
        steps: false,
        radiuses: radiusesStr
      }
    });

    const route = response.data.routes[0];
    res.json({ geometry: route.geometry, distance: route.distance, duration: route.duration });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to get route' });
  }
};

module.exports = { getRoute };
