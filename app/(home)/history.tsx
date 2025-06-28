import { ThemedText } from '@/components/ThemedText';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

const sampleRoutes = [
  {
    date: '06/14/2025',
    start: 'Home',
    checkpoints: ['Checkpoint A', 'Checkpoint B'],
    destination: 'Office',
    duration: '3 hours',
  },
  {
    date: '06/10/2025',
    start: 'School',
    checkpoints: ['Checkpoint 1', 'Checkpoint 2'],
    destination: 'Mall',
    duration: '2 hours',
  },
  {
    date: '06/01/2025',
    start: 'Gym',
    checkpoints: ['Checkpoint X'],
    destination: 'Coffee Shop',
    duration: '1 hour',
  },
];

export default function HistoryScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/dashboardBG.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Protruding Title */}
        <View style={styles.titleWrapper}>
          <ThemedText type="title">Trip History</ThemedText>
        </View>

        {/* Route Cards */}
        <View style={styles.cardContainer}>
          {sampleRoutes.map((route, index) => (
            <View key={index} style={styles.tripCard}>
              <View style={styles.timelineLine} />

              {/* Starting Point */}
              <View style={styles.checkpoint}>
                <View style={styles.checkIconCircle} />
                <View style={styles.checkpointTextBox}>
                  <ThemedText type="defaultSemiBold">
                    {route.start}
                  </ThemedText>
                  <ThemedText type="default" style={styles.dateText}>
                    {route.date}
                  </ThemedText>
                </View>
              </View>

              {/* Checkpoints */}
              {route.checkpoints.map((cp, i) => (
                <View key={i} style={styles.checkpoints}>
                  <View style={styles.line} />
                  <View style={styles.checkpointDot} />
                  <View style={styles.checkpointDetail}>
                    <ThemedText type="default">{cp}</ThemedText>
                  </View>
                </View>
              ))}

              {/* Destination */}
              <View style={styles.checkpoint}>
                <View style={styles.finalPin} />
                <View style={styles.checkpointTextBox}>
                  <ThemedText type="defaultSemiBold">
                    {route.destination}
                  </ThemedText>
                </View>
                <View style={styles.durationPill}>
                  <ThemedText type="default" style={styles.durationText}>
                    {route.duration}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
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
    elevation: 0,
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
  line: {
    position: 'absolute',
    top: 9.8,
    left: 9,
    width: 11,
    height: 2,
    backgroundColor: '#104E3B',
    zIndex: 10,
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
