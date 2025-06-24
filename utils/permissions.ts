import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

export async function requestLocationPermissions(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "Location Permission Required",
      "To use this feature, please tap 'Allow all the time' when asked for location access.\n\nIf you deny or select a different option, some features may not work correctly.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            console.warn("⚠️ User canceled permission request.");
            resolve(false);
          }
        },
        {
          text: "Continue",
          onPress: async () => {
            console.log("🔍 Requesting foreground location permission...");
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            console.log("📍 Foreground permission status:", foregroundStatus);

            if (foregroundStatus !== 'granted') {
              console.warn("❌ Foreground permission not granted.");
              showFallbackAlert();
              resolve(false);
              return;
            }

            console.log("🕵️ Requesting background location permission...");
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            console.log("🎯 Background permission status:", backgroundStatus);

            const granted = foregroundStatus === 'granted' && backgroundStatus === 'granted';
            console.log("✅ Permissions granted:", granted);

            if (!granted) {
              showFallbackAlert();
            }

            resolve(granted);
          }
        }
      ]
    );
  });
}

function showFallbackAlert() {
  Alert.alert(
    "Incomplete Permission",
    "You didn't allow 'All the time' access. Please go to app settings and manually allow full location access.",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings();
        }
      }
    ]
  );
}
