import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const CompactTabButton = (props: any) => (
    <View style={styles.compactButtonWrapper}>
      <HapticTab {...props} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: theme.tabBarBackground,
            height: 70,
            paddingBottom: 10,
          },
          android: {
            backgroundColor: theme.tabBarBackground,
            height: 70,
            paddingBottom: 10,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarButton: (props) => <CompactTabButton {...props} />,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="test"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: ({ onPress, accessibilityState }) => {
            const focused = accessibilityState?.selected;
            const labelColor = focused
              ? theme.tabIconSelected
              : theme.tabIconDefault;

            return (
              <View style={styles.plusWrapper}>
                <TouchableOpacity
                  onPress={onPress}
                  style={[
                    styles.plusButton,
                    {
                      backgroundColor: theme.text,
                      borderColor: theme.tabBarBackground,
                    },
                  ]}
                >
                  <Text style={[styles.plusText, { color: theme.tabBarBackground }]}>+</Text>
                </TouchableOpacity>

                {/* Match label styling of other tabs */}
                <Text style={[styles.tabLabel, { color: Text }]}>Set Alarm</Text>
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Explore',
          tabBarButton: (props) => <CompactTabButton {...props} />,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  compactButtonWrapper: {
    flex: 0.8, // reduce space taken by side tabs
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -20,
  },
  plusButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontFamily: 'QuicksandBold',
    fontSize: 64,
    marginTop: -25,
  },
  tabLabel: {
  fontSize: 10,
  lineHeight: 16,
  textAlign: 'center',
  marginTop: -3,
  fontWeight: Platform.OS === 'android' ? '700' : '600', // match native boldness
  },
});
