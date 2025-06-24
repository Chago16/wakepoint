import { router, Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
        name="(home)/dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* Center custom Set Alarm button */}
      <Tabs.Screen
        name="(noop)" // placeholder route, won't match any screen
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: () => (
            <View style={styles.plusWrapper}>
              <TouchableOpacity
                onPress={() => router.push('/choose')}
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
              <Text style={[styles.tabLabel, { color: theme.tabIconDefault }]}>Set Alarm</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="(home)/history"
        options={{
          title: 'History',
          tabBarButton: (props) => <CompactTabButton {...props} />,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  compactButtonWrapper: {
    flex: 0.8,
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
    fontWeight: Platform.OS === 'android' ? '700' : '600',
  },
});
