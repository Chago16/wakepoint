import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, AppState, AppStateStatus } from 'react-native';
import Mapbox, { Camera } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { requestLocationPermissions } from '@utils/permissions';

Mapbox.setAccessToken('pk.eyJ1Ijoid2FrZXBvaW50IiwiYSI6ImNtYnp2NGx1YjIyYXYya3BxZW83Z3ppN3EifQ.uLuWroM_W-fqiE-nTHL6tw');

const MapScreen = () => {
  const [centerCoordinate, setCenterCoordinate] = useState([120.9842, 14.5995]); // Manila default
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  // 🔄 Recheck permissions on app resume
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔁 App resumed. Rechecking location permissions...');
        const fg = await Location.getForegroundPermissionsAsync();
        const bg = await Location.getBackgroundPermissionsAsync();
        const granted = fg.status === 'granted' && bg.status === 'granted';
        console.log('📦 Recheck result:', granted);
        setLocationGranted(granted);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    (async () => {
      console.log('Requesting permissions...');
      const granted = await requestLocationPermissions();
      console.log('Permissions granted:', granted);

      if (granted) {
        setLocationGranted(true);
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setCenterCoordinate([longitude, latitude]);
      } else {
        console.warn('Location permission denied');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
        compassEnabled={true}
        scaleBarEnabled={true}
        onDidFinishLoadingMap={() => setMapReady(true)}
      >
        <Camera
          centerCoordinate={centerCoordinate}
          zoomLevel={14}
          animationMode="flyTo"
          animationDuration={1000}
        />
        {mapReady && locationGranted && (
          <Mapbox.UserLocation visible={true} />
        )}
      </Mapbox.MapView>
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
