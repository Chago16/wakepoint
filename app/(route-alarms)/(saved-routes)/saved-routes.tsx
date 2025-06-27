import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.26;

const sampleRoutes = [
  {
    start: 'Home',
    checkpoints: ['Checkpoint A', 'Checkpoint B'],
    destination: 'Office',
  },
  {
    start: 'School',
    checkpoints: ['Checkpoint 1', 'Checkpoint 2'],
    destination: 'Mall',
  },
  {
    start: 'Gym',
    checkpoints: ['Checkpoint X'],
    destination: 'Coffee Shop',
  },
];

export default function ChooseScreen() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const bottomSpacerAnim = useRef(new Animated.Value(0)).current;
  const heightAnims = useRef(sampleRoutes.map(() => new Animated.Value(1))).current;

  const handleUseAsAlarm = () => {
    if (selectedIndex !== null) {
      console.log('Selected Route:', sampleRoutes[selectedIndex]);
      router.push('/pretrip-options');
    }
  };

  const handleEdit = () => {
    console.log('Edit:', sampleRoutes[selectedIndex!]);
    router.push('//(edit-saved)/edit-map-screen?mode=create');
  };

  const handleDelete = () => {
    console.log('Delete:', sampleRoutes[selectedIndex!]);
  };

  const animateHideSelectedCard = (index: number) => {
    Animated.timing(heightAnims[index], {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const resetCardHeights = () => {
    heightAnims.forEach((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start()
    );
  };

  useEffect(() => {
    if (isLongPressed && selectedIndex !== null) {
      animateHideSelectedCard(selectedIndex);
    } else {
      resetCardHeights();
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isLongPressed ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: isLongPressed ? 1 : 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 10,
      }),
      Animated.timing(bottomSpacerAnim, {
        toValue: isLongPressed ? 76 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isLongPressed]);

  return (
    <>
      <Stack.Screen
        options={{
          animation: 'none',
          header: () => (
            <View style={styles.customHeader}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
                  <IconSymbol name="arrow.left.circle" size={20} color="#145E4D" />
                </TouchableOpacity>
                <ThemedText type="button" style={styles.backText}>Back</ThemedText>
              </View>
              <View style={styles.headerTitleContainer}>
                <ThemedText type="titleLarge" style={[styles.headerTitle, { fontSize: 28 }]}>
                  Saved Routes
                </ThemedText>
                <ThemedText type="subtitle1" style={[styles.headerSubtitle, { fontSize: 15 }]}>
                  Select one to set as alarm
                </ThemedText>
              </View>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        <Text style={styles.instructionText}>📌 Hold a route to Edit or Delete</Text>

        {isLongPressed && (
          <TouchableWithoutFeedback
            onPress={() => {
              setIsLongPressed(false);
              setSelectedIndex(null);
            }}
          >
            <Animated.View style={[styles.dimOverlay, { opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>
        )}

        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {sampleRoutes.map((route, index) => (
              <Animated.View
                key={index}
                style={{
                  overflow: 'hidden',
                  height: heightAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 126],
                  }),
                  opacity: heightAnims[index],
                  marginTop: 0,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (!isLongPressed) setSelectedIndex(index);
                  }}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsLongPressed(true);
                    setSelectedIndex(index);
                  }}
                  delayLongPress={1000}
                  activeOpacity={0.9}
                  style={[
                    styles.tripCard,
                    selectedIndex === index && styles.tripCardSelected,
                  ]}
                >
                  <View style={styles.tripTop}>
                    <ThemedText type="defaultSemiBold">Starting point</ThemedText>
                  </View>
                  <View style={styles.checkpoints}>
                    {route.checkpoints.map((cp, i) => (
                      <ThemedText type="default" key={i}>|  {cp}</ThemedText>
                    ))}
                  </View>
                  <View style={styles.tripBottom}>
                    <ThemedText type="defaultSemiBold">Destination</ThemedText>
                    <View style={styles.radioDotOuter}>
                      {selectedIndex === index && <View style={styles.radioDotInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <Animated.View style={{ height: bottomSpacerAnim }} />
          </ScrollView>

          {isLongPressed && selectedIndex !== null && (
            <Animated.View
              style={[
                styles.absoluteCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: cardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.95}
                style={[styles.tripCard, styles.tripCardLongPressed]}
              >
                <View style={styles.tripTop}>
                  <ThemedText type="defaultSemiBold">Starting point</ThemedText>
                </View>
                <View style={styles.checkpoints}>
                  {sampleRoutes[selectedIndex].checkpoints.map((cp, i) => (
                    <ThemedText type="default" key={i}>|  {cp}</ThemedText>
                  ))}
                </View>
                <View style={styles.tripBottom}>
                  <ThemedText type="defaultSemiBold">Destination</ThemedText>
                  <View style={styles.radioDotOuter}>
                    <View style={styles.radioDotInner} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <View style={styles.bottomBar}>
          {isLongPressed ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.useButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.useButton,
                selectedIndex === null && styles.useButtonDisabled,
              ]}
              onPress={handleUseAsAlarm}
              disabled={selectedIndex === null}
            >
              <ThemedText type="button" style={[{ color: 'white' }]}>
                Use as Alarm
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: '#145E4D',
    height: HEADER_HEIGHT,
    paddingTop: 40,
    paddingHorizontal: 25,
    justifyContent: 'flex-start',
    elevation: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 55,
  },
  backCircle: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    padding: 4,
    elevation: 4,
  },
  backText: {
    color: 'white',
    marginLeft: 6,
  },
  headerTitleContainer: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: -10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  instructionText: {
    paddingTop: 12,
    paddingHorizontal: 24,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    zIndex: 20,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 5,
  },
  absoluteCard: {
    position: 'absolute',
    top: 180,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  tripCard: {
    borderWidth: 2,
    borderColor: '#155E54',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    gap: 8,
    backgroundColor: '#fff',
  },
  tripCardSelected: {
    backgroundColor: '#e6f5f2',
    borderColor: '#0C4037',
  },
  tripCardLongPressed: {
    backgroundColor: '#bee4dd',
    borderWidth: 2,
    borderColor: '#064236',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
  radioDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#155E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#155E54',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 200,
  },
  useButton: {
    backgroundColor: '#145E4D',
    borderRadius: 7,
    paddingVertical: 14,
    alignItems: 'center',
  },
  useButtonDisabled: {
    backgroundColor: '#A5C1BA',
  },
  useButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#1C6E5C',
    borderRadius: 7,
    paddingVertical: 14,
    marginRight: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#1C6E5C',
    backgroundColor: 'white',
    borderRadius: 7,
    paddingVertical: 14,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#1C6E5C',
    fontWeight: '600',
    fontSize: 16,
  },
});
