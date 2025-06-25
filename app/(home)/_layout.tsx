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
          height: 80,
          paddingTop: 10,
          paddingBottom: 10,
          // Drop shadow at the top
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 15,
          borderTopWidth: 0,
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
              {/* Stroke layer */}
              <View
                style={[
                  styles.plusOutline,
                  {
                    backgroundColor: theme.tabBarBackground,
                  },
                ]}
              />
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
                <IconSymbol name="plus" size={60} color={theme.tabBarBackground} />
              </TouchableOpacity>
              <Text style={[styles.tabLabel, { color: theme.text }]}>Set Alarm</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="doc.text" color={color} />
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
    top: -29,
    position: 'relative',
  },
  plusButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusOutline: {
    position: 'absolute',
    width: 82, // slightly larger than button
    height: 82,
    borderRadius: 41,
    backgroundColor: '#fff',
    zIndex: -1,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: -3,
    fontWeight: Platform.OS === 'android' ? '700' : '600',
  },
});


