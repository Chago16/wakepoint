import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// If you're using process.env (via `extra` in app config or .env loading)
Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const MapScreen = () => {
  useEffect(() => {
    // Optionally handle map load events here
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
