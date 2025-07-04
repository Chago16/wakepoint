import { ThemedText } from '@/components/ThemedText';
import { getUserId } from '@/utils/session'; // adjust path if needed
import { getTripHistories } from '@/utils/tripHistory'; // adjust path if needed
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';


export default function HistoryScreen() {
  const [tripHistory, setTripHistory] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      const userId = await getUserId();
      if (!userId) return;

      try {
        const trips = await getTripHistories(userId);
        setTripHistory(trips);
      } catch (error) {
        console.error('Failed to load trip history:', error);
      }
    }
    fetchHistory();
  }, []);

  function formatDuration(seconds) {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  }


  return (
    <ImageBackground
      source={require('@/assets/images/dashboardBG.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleWrapper}>
          <ThemedText type="titleSmall">Trip History</ThemedText>
        </View>

        <View style={styles.cardContainer}>
          {tripHistory.length === 0 ? (
            <ThemedText>No trip history available.</ThemedText>
          ) : (
            tripHistory.map((route, index) => (
              <View key={index} style={styles.tripCard}>
                <View style={styles.timelineLine} />

                <View style={styles.checkpoint}>
                  <View style={styles.checkIconCircle} />
                  <View style={styles.checkpointTextBox}>
                    <ThemedText type="defaultSemiBold" style={styles.fromNameText}>
                      {route.from_name || 'Start'}
                    </ThemedText>
                    <ThemedText type="default" style={styles.dateText}>
                      {new Date(route.date_start).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.checkpoint}>
                  <View style={styles.line} />
                  <View style={styles.finalPin} />
                  <View style={styles.checkpointTextBox}>
                    <ThemedText type="defaultSemiBold">
                      {route.destination_name || 'Destination'}
                    </ThemedText>
                  </View>
                  <View style={styles.durationPill}>
                    <ThemedText type="default" style={styles.durationText}>
                      {formatDuration(route.duration)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    height: '100%',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  titleWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: -15,
    zIndex: 10,
    elevation: 0,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderTopLeftRadius: 0,
    padding: 16,
    gap: 16,
    elevation: 3,
    paddingTop: 20,
    marginTop: 15,
  },
  tripCard: {
    borderWidth: 2,
    borderColor: '#155E54',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 30,
    bottom: 30,
    width: 2,
    backgroundColor: '#104E3B',
    zIndex: 10,
  },
  
  line: {
    position: 'absolute',
    top: 20,
    left: 0,
    bottom: 0,
    width: 10, // thinner width
    backgroundColor: 'white',
    zIndex: 10,
  },
  checkpoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
  },
  checkIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4.5,
    borderColor: '#104E3B',
    marginRight: 12,
    marginTop: 4,
  },
  finalPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#104E3B',
    marginRight: 12,
    marginTop: 4,
  },
  checkpointTextBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight: 10,
    alignItems: 'center',
  },
  fromNameText: {
    width: 150,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  checkpoints: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 20,
  },
  checkpointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#104E3B',
    marginRight: 12,
    marginTop: 4,
  },
  checkpointDetail: {
    flex: 1,
  },
  durationPill: {
    backgroundColor: '#155E54',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  durationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
