import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, ImageBackground, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';



export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const scrollRef = useRef<ScrollView>(null);
  const cards = [0, 1, 2]; // previous, current, upcoming

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / 282); // 270 width + 12 margin
    setCurrentIndex(index);
  };

  return (
    <ImageBackground
        source={require('@/assets/images/dashboardBG.png')} //wakepoint-splash-image   dashboardBG
        style={styles.background}
        resizeMode="cover">
    <ParallaxScrollView
      headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
      headerImage={<></>}
      contentContainerStyle={{ flexGrow: 1 }}
      >
        

        <ThemedView style={styles.topContainer}>
          <ThemedView style={styles.headerContainer}>
            <ThemedView style={styles.welcomeContainer}>
              <ThemedText type="subtitle1">Welcome</ThemedText>
              <ThemedText type="subtitle2">Name,</ThemedText>
            </ThemedView>
            <ThemedText type="defaultSemiBold">We are here to wake you up </ThemedText>
          </ThemedView>
          <TouchableOpacity onPress={() => console.log('Logout')} style={{ marginTop: 5 }}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={28} color="black" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.currentContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripScrollContainer}
            style={styles.tripScroll}
            snapToInterval={287}
            decelerationRate="fast"
            snapToAlignment="start"
            bounces={false}
            onMomentumScrollEnd={handleScrollEnd}
            onLayout={() => {
              scrollRef.current?.scrollTo({ x: 287, animated: false }); // Scroll to active card once
            }}
          >
            {[1, 2, 3].map((_, i) => {
              const isActive = i === 1;

              // dynamic title
              let tripLabel = 'Current Trip';
              if (!isActive) tripLabel = i === 0 ? 'Previous Checkpoint' : 'Upcoming Checkpoint';

              return (
                <View
                  key={i}
                  style={[styles.tripCard, isActive && styles.activeTripCard]}>
                  
                  <ThemedText type="defaultSemiBold" style={isActive ? styles.activeTripText : undefined}>
                    {tripLabel}
                  </ThemedText>

                  {isActive ? (
                    <View style={styles.justifyContainer}>
                      <ThemedText type="option" style={styles.activeTripText}>
                        Est: 00 hr 00 mins
                      </ThemedText>
                      <ThemedText type="option" style={styles.activeTripText}>
                        00km away
                      </ThemedText>
                    </View>
                  ) : (
                    <View style={{ height: 22 }} /> // keeps the spacing even when not active
                  )}

                  {/* ✅ Always reserve space for progress bar, but only show if active */}
                  <View style={styles.progressBarWrapper}>
                    {isActive ? (
                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: '45%' }]} />
                      </View>
                    ) : (
                      <View style={{ height: 20 }} /> // placeholder for layout consistency
                    )}
                  </View>

                  <View style={styles.justifyContainer}>
                    <View style={styles.endpointLeft}>
                      <ThemedText
                        type="default"
                        numberOfLines={2}
                        style={[styles.endpointText, isActive && styles.activeTripText]}>
                        Origin
                      </ThemedText>
                    </View>
                    <View style={styles.endpointRight}>
                      <ThemedText
                        type="default"
                        numberOfLines={2}
                        style={[
                          styles.endpointText,
                          isActive && styles.activeTripText,
                          { textAlign: 'right' },
                        ]}>
                        Destination
                      </ThemedText>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {cards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </ThemedView>

        <View style={styles.containerSeparator} />

        <ThemedView style={styles.middleContainer}>
          <ThemedText type="titleSmall">Quick Options</ThemedText>
          <ThemedView style={styles.optionsContainer}>

            <TouchableOpacity onPress={() => router.push('/(route-alarms)/choose')} style={styles.optionButton}>
              <Image
                source={require('@/assets/images/quick-icon-1.png')} 
                style={styles.optionImage}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>Set{'\n'}Trip Alarm</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/gps-window/main-gps')} style={styles.optionButton}>
              <Image
                source={require('@/assets/images/quick-icon-2.png')} 
                style={styles.optionImage}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>Go to{'\n'}Current Trip</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/history')} style={styles.optionButton}>
              <Image
                source={require('@/assets/images/quick-icon-3.png')} 
                style={styles.optionImage}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>View{'\n'}Trip History</ThemedText>
            </TouchableOpacity>

          </ThemedView>
        </ThemedView>

        <View style={styles.containerSeparator} />

        <ThemedView style={styles.bottomContainer}>
          <ThemedText type="titleSmall">Recent Trips</ThemedText>
                    {[1, 2, 3].map((_, i) => (
                      <View key={i} style={styles.tripContainer}>
                        <View style={styles.trip}>
                          <ThemedText type="option">Starting point</ThemedText>
                          <ThemedText type="option">to Destination</ThemedText>
                        </View>
                        <ThemedText type="option">00/00/0000</ThemedText>
                      </View>
                    ))}
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
    paddingLeft: 32,
    paddingRight: 32,
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
    paddingLeft: 32,
    paddingRight: 32,
    gap: 8,
  },

  tripScroll: {
    marginHorizontal: -32, // negate the background padding (match padding: 32 in ImageBackground)
  },

  tripScrollContainer: {
    paddingHorizontal: 16,
    gap: 8,
    paddingLeft: 40,
    paddingRight: 32,
  },
  activeTripCard: {
    backgroundColor: '#145E4D',
    color: 'white',
  },
  activeTripText: {
    color: 'white',
  },
  justifyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  endpointLeft: {
    maxWidth: '48%',
    minHeight: 36, // ≈ 2 lines of text height
    justifyContent: 'flex-start',
  },

  endpointRight: {
    maxWidth: '48%',
    minHeight: 36,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },

  endpointText: {
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  progressBarWrapper: {
    marginVertical: 0,
  },
  progressBarBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A69DDA',
    borderRadius: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 3,
  },
  dot: {
    width: 30,
    height: 5,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#145E4D',
    transform: [{ scale: 1 }],
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  tripCard: {
    backgroundColor: '#B6C6C3',
    padding: 16,
    borderRadius: 16,
    width: 270,
    marginRight: 12,
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
    marginBottom: -25, // pulls image into overlap
    top:-29,
    zIndex: 1,
  },
  bottomContainer: {
    flex: 1,
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#ADCE7D',
    padding: 20,
    borderRadius: 20,
    marginLeft: 32,
    marginRight: 32,
    
  },
  tripContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  trip: {
    width: 160,
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  containerSeparator: {
    height: 1,
    backgroundColor: '#ccc', // or any neutral color
    marginVertical: 0,
    opacity: 0.5,             // optional for a softer line
    marginLeft: 32,
    marginRight: 32,
  },
});
