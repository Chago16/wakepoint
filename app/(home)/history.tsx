import { ImageBackground, StyleSheet, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';

export default function HistoryScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/dashboardBG.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ParallaxScrollView
        headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
        headerImage={<></>}
      >
        {/* Protruding Title */}
        <View style={styles.titleWrapper}>
          <ThemedText type="title">Trip History</ThemedText>
        </View>

        {/* White card container */}
        <View style={styles.cardContainer}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} style={styles.tripCard}>
              <View style={styles.tripTop}>
                <ThemedText type="defaultSemiBold">Starting point</ThemedText>
                <ThemedText type="default">06/14/2025</ThemedText>
              </View>
              <View style={styles.checkpoints}>
                <ThemedText type="default">|  Checkpoint 1</ThemedText>
                <ThemedText type="default">|  Checkpoint 2</ThemedText>
              </View>
              <View style={styles.tripBottom}>
                <ThemedText type="defaultSemiBold">Destination</ThemedText>
                <View style={styles.durationPill}>
                  <ThemedText type="default" style={styles.durationText}>
                    3 hours
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ParallaxScrollView>
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
  titleWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: -18,
    zIndex: 10,
    elevation: 0,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    elevation: 0,
  },
  tripCard: {
    borderWidth: 2,
    borderColor: '#155E54',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  tripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkpoints: {
    marginLeft: 8,
    gap: 2,
  },
  tripBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationPill: {
    backgroundColor: '#155E54',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
