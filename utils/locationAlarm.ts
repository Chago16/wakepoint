import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

const TASK_NAME = 'location-alarm-task';

let targetCoords: { latitude: number; longitude: number };
let triggered = false;

export function startLocationAlarm(target: { latitude: number; longitude: number }, radius = 50) {
  targetCoords = target;
  triggered = false;

  Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 5,
    deferredUpdatesInterval: 1000,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Location Alarm Active',
      notificationBody: 'We are monitoring your location.',
    },
  });
}

export function stopLocationAlarm() {
  Location.hasStartedLocationUpdatesAsync(TASK_NAME).then((started) => {
    if (started) {
      Location.stopLocationUpdatesAsync(TASK_NAME);
    }
  });
}

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error || !data) return;

  const { locations } = data as any;
  const { latitude, longitude } = locations[0].coords;

  const distance = getDistance(latitude, longitude, targetCoords.latitude, targetCoords.longitude);
  if (distance <= 50 && !triggered) {
    triggered = true;

    Notifications.scheduleNotificationAsync({
      content: {
        title: 'You’ve arrived!',
        body: 'You have reached your destination.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });

    stopLocationAlarm();
  }
});

// Utility to compute distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Earth radius in m
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
