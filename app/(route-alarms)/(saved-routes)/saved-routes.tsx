import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getAddressFromCoordinates } from '@/utils/geocodingService';
import { deleteRoute, getRoutesByUserId } from '@/utils/savedRoutesAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.18;

export default function ChooseScreen() {
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const bottomSpacerAnim = useRef(new Animated.Value(0)).current;
  const heightAnims = useRef<any[]>([]).current;

  useEffect(() => {
    const fetchRoutes = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      const rawRoutes = await getRoutesByUserId(userId);

      const routesWithCheckpointNames = await Promise.all(
        rawRoutes.map(async (route: any) => {
          const checkpointNames = await Promise.all(
            route.checkpoints.map(async (cp: any) => {
              console.log('🧭 Checkpoint:', cp);
              const reverse = await getAddressFromCoordinates(cp.lat, cp.lng);
              return reverse?.address || 'Unnamed';
            })
          );

          return {
            ...route,
            checkpointNames,
          };
        })
      );

      setSavedRoutes(routesWithCheckpointNames);
      heightAnims.splice(0, heightAnims.length, ...routesWithCheckpointNames.map(() => new Animated.Value(1)));
    };

    fetchRoutes();
  }, []);

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

  const handleUseAsAlarm = () => {
  if (selectedIndex !== null) {
    const route = savedRoutes[selectedIndex];
    router.push({
      pathname: '/pretrip-options',
      params: { id: route.saved_route_id },
    });
  }
};


  const handleEdit = () => {
    if (selectedIndex !== null) {
      const route = savedRoutes[selectedIndex];
      router.push({
        pathname: '/(edit-saved)/edit-map-screen',
        params: {
          mode: 'edit',
          id: route.saved_route_id,
        },
      });
    }
  };

  const handleDelete = async () => {
  if (selectedIndex !== null) {
    const route = savedRoutes[selectedIndex];
    try {
      await deleteRoute(route.saved_route_id);
      // Refresh list after delete
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;
      const updatedRoutes = await getRoutesByUserId(userId);
      setSavedRoutes(updatedRoutes);
      setIsLongPressed(false);
      setSelectedIndex(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }
};

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
                <ThemedText type="defaultSemiBold" style={styles.backText}>Back</ThemedText>
              </View>
              <View style={styles.headerTitleContainer}>
                <ThemedText type="titleLarge" style={{ fontSize: 28, color: 'white', lineHeight: 35}}>
                  Saved Routes
                </ThemedText>
                <ThemedText type="subtitle1" style={{ fontSize: 15, color: 'white', lineHeight: 16 }}>
                  Select one to set as alarm
                </ThemedText>
              </View>
            </View>
          ),
        }}
      />
      
      <View style={styles.instructionRow}>
        <View style={styles.exclamationCircle}>
          <ThemedText type="button" style={styles.exclamationMark}>!</ThemedText>
        </View>
        <ThemedText type="button" style={styles.instructionText}>Hold a route to Edit or Delete</ThemedText>
      </View>

      <View style={styles.container}>

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

        <View style={{flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingTop: 30, paddingBottom: 80 }}>
            {savedRoutes.map((route, index) => (
              <Animated.View
                key={route.saved_route_id}
                style={{ overflow: 'hidden', transform: [{ scale: heightAnims[index] }] }}
              >
                <TouchableOpacity
                  onPress={() => !isLongPressed && setSelectedIndex(index)}
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
                  <View>
                    <View style={styles.timelineLine} />

                    {/* FROM */}
                    <View style={styles.checkpoint}>
                      <View style={styles.checkIconCircle} />
                      <View style={styles.checkpointTextBox}>
                        <ThemedText type="defaultSemiBold">
                          {route.from_name || 'Starting Point'}
                        </ThemedText>
                      </View>
                    </View>

                    {/* CHECKPOINTS */}
                    {route.checkpointNames?.map((cpName: string, i: number) => (
                      <View key={i} style={styles.checkpoints}>
                        <View style={styles.line} />
                        <View style={styles.checkpointDot} />
                        <View style={styles.checkpointDetail}>
                          <ThemedText type="default">{cpName}</ThemedText>
                        </View>
                      </View>
                    ))}

                    {/* DESTINATION */}
                    <View style={styles.checkpoint}>
                      <View style={styles.finalPin} />
                      <View style={styles.checkpointTextBox}>
                        <ThemedText type="defaultSemiBold">
                          {route.destination_name || 'Destination'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
            <Animated.View style={{ height: bottomSpacerAnim }} />
          </ScrollView>

          {isLongPressed && selectedIndex !== null && (
  <Animated.View style={[styles.absoluteCard, { transform: [{ scale: cardAnim }] }]}>
    <View style={[styles.tripCard, styles.tripCardSelected]}>
      <View style={{position: 'relative'}}>
        <View style={styles.timelineLine} />

        {/* FROM */}
        <View style={styles.checkpoint}>
          <View style={styles.checkIconCircle} />
          <View style={styles.checkpointTextBox}>
            <ThemedText type="defaultSemiBold">
              {savedRoutes[selectedIndex].from_name || 'Starting Point'}
            </ThemedText>
          </View>
        </View>

        {/* CHECKPOINTS */}
        {savedRoutes[selectedIndex].checkpointNames?.map((cpName: string, i: number) => (
          <View key={i} style={styles.checkpoints}>
            <View style={styles.line} />
            <View style={styles.checkpointDot} />
            <View style={styles.checkpointDetail}>
              <ThemedText type="default">{cpName}</ThemedText>
            </View>
          </View>
        ))}

              {/* DESTINATION */}
              <View style={styles.checkpoint}>
                <View style={styles.finalPin} />
                <View style={styles.checkpointTextBox}>
                  <ThemedText type="defaultSemiBold">
                    {savedRoutes[selectedIndex].destination_name || 'Destination'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      )}


          {/* Bottom bar */}
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
                <ThemedText type="button" style={{ color: 'white' }}>
                  Use as Alarm
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
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
    position: 'relative',
  },
  instructionRow: {
  flexDirection: 'row',
  alignItems: 'center',
  position: 'absolute',
  top: 130,
  left: 0,
  right: 0,
  zIndex: 20,
  backgroundColor: '#CFC8F3',
  paddingVertical: 4,
  paddingHorizontal: 30,
},

exclamationCircle: {
  width: 22,
  height: 22,
  borderRadius: 11,
  borderWidth: 2,
  borderColor: "#444",
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 8,
},

exclamationMark: {
  color: '#444',
  fontSize: 12,
  lineHeight: 12
},

instructionText: {
  fontSize: 12,
  color: '#444',
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
    marginBottom: 20,
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
  timelineLine: {
    position: 'absolute',
    left: 7.3,
    top:13,
    bottom: 20,
    width: 2,
    backgroundColor: '#104E3B',
    zIndex: 999,
    },
  line: {
    position: 'absolute',
    top: 9.8,          
    left: 9,         
    width: 11,        
    height: 2,        
    backgroundColor: '#104E3B',
    zIndex: 999,
  },
  checkpoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius:20,
  },
  checkpoints: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 20,
  },
  checkpointDetail: {
    flex: 1,
  },
  checkIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4.5,
    borderColor: '#104E3B',
    marginRight: 12,
  },
  finalPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#104E3B',
    marginRight: 12,
  },
  checkpointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#104E3B',
    marginRight: 12,
    marginTop: 4,
  },
  checkpointTextBox: {
    flex: 1,
    marginBottom:5,
    paddingRight: 10,
  },
});