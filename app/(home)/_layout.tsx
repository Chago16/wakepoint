import { Tabs, router } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { HapticTab } from '@/components/HapticTab';
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
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.tabBarBackground,
          height: 70,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="noop"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: () => (
            <View style={styles.plusWrapper}>
              <TouchableOpacity
                onPress={() => router.push('/(route-alarms)/choose')}
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
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
