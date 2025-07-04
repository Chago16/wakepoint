import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getTripHistories } from '@/utils/tripHistory'; // added getTripHistories
import { fetchUserName } from '@utils/fetchUserName';
import { clearUserId, getUserId } from '@utils/session'; // added getUserId
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const name = await fetchUserName();
      if (name) {
        setUserName(name);
        console.log('👤 user_name:', name);
      } else {
        console.warn('⚠️ No user name retrieved.');
      }
    };
    getUser();

    const fetchRecentTrips = async () => {
      const userId = await getUserId();
      if (!userId) return;

      try {
        const trips = await getTripHistories(userId);
        if (trips && trips.length > 0) {
          // Sort descending by date_start
          trips.sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
          // Take top 3
          setRecentTrips(trips.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load recent trips:', error);
      }
    };
    fetchRecentTrips();
  }, []);

  const handleLogout = async () => {
    await clearUserId();
    router.replace('/login');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/dashboardBG.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ParallaxScrollView
        headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
        headerImage={<></>}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ThemedView style={styles.topContainer}>
          <ThemedView style={styles.headerContainer}>
            <ThemedView style={styles.welcomeContainer}>
              <ThemedText type="subtitle1">Welcome</ThemedText>
              <ThemedText type="subtitle2">{userName || 'User'},</ThemedText>
            </ThemedView>
            <ThemedText type="defaultSemiBold">
              We are here to wake you up
            </ThemedText>
          </ThemedView>
          <TouchableOpacity onPress={handleLogout} style={{ marginTop: 5 }}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={28}
              color="black"
            />
          </TouchableOpacity>
        </ThemedView>

        {/* 🔁 Replaced current trip scroll with a static image */}
        <ThemedView style={styles.currentContainer}>
          <Image
            source={require('@/assets/images/Title2.png')}
            style={styles.staticTripImage}
          />
        </ThemedView>

        <View style={styles.containerSeparator} />

        <ThemedView style={styles.middleContainer}>
          <ThemedText type="titleSmall">Quick Options</ThemedText>
          <ThemedView style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => router.push('/(route-alarms)/(saved-routes)/saved-routes')}
              style={styles.optionButton}
            >
              <Image
                source={require('@/assets/images/quick-icon-1.png')}
                style={styles.optionImage}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>
                Choose Saved Trip
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(route-alarms)/(create-route)/map-screen?mode=create')}
              style={styles.optionButton}
            >
              <Image
                source={require('@/assets/images/quick-icon-2.png')}
                style={styles.optionImage}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>
                Create A{'\n'}Trip Route
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/history')}
              style={styles.optionButton}
            >
              <Image
                source={require('@/assets/images/quick-icon-3.png')}
                style={styles.optionImage}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>
                View{'\n'}Trip History
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <View style={styles.containerSeparator} />

        <ThemedView style={styles.bottomContainer}>
          <ThemedText type="titleSmall">Recent Trips</ThemedText>
          {recentTrips.length === 0 ? (
            <ThemedText>No recent trips available.</ThemedText>
          ) : (
            recentTrips.map((trip, i) => (
              <View key={i} style={styles.tripContainer}>
                <View style={styles.trip}>
                  <ThemedText
                    type="option"
                    style={styles.tripText}
                    numberOfLines={1} // <-- THIS CLIPS!
                  >
                    {trip.from_name || 'Starting point'}
                  </ThemedText>
                  <ThemedText
                    type="option"
                    style={styles.tripText}
                    numberOfLines={1} // <-- THIS CLIPS!
                  >
                    to {trip.destination_name || 'Destination'}
                  </ThemedText>
                </View>
                <ThemedText
                    type="option"
                    style={styles.tripText}
                    numberOfLines={1} // <-- THIS CLIPS!
                  >
                  {new Date(trip.date_start).toLocaleDateString()}
                </ThemedText>
              </View>
            ))
          )}
        </ThemedView>
      </ParallaxScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 0,
  },
  topContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 29,
    paddingRight: 25,
    paddingTop: 32,
  },
  headerContainer: {
    flexDirection: 'column',
  },
  welcomeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#ADCE7D',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentContainer: {
    paddingHorizontal: 32,
    marginTop: 8,
  },
  staticTripImage: {
    width: 320,
    height: 170,
    marginTop: -30,
    alignSelf: 'center',
  },
  middleContainer: {
    flexDirection: 'column',
    paddingLeft: 32,
    paddingRight: 32,
    marginTop: -5,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 27,
    marginLeft: 9,
    marginRight: 9,
    gap: 5,
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 12,
    width: 80,
    elevation: 8,
  },
  optionImage: {
    width: 58,
    height: 58,
    marginBottom: -25,
    top: -29,
    zIndex: 1,
  },
  bottomContainer: {
    flex: 1,
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#ADCE7D',
    padding: 20,
    borderRadius: 20,
    marginLeft: 18,
    marginRight: 18,
  },
  tripContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  tripText: {
    fontSize: 12.5,
    maxWidth: 160,
    marginBottom: 5,
    overflow: 'hidden',
  },
  trip: {
    width: 160,
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  containerSeparator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 0,
    opacity: 0.5,
    marginLeft: 32,
    marginRight: 32,
  },
});
