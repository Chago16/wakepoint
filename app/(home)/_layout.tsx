import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs, router } from 'expo-router';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
                  {
                    backgroundColor: theme.tabBarBackground,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => router.push('/(route-alarms)/choose')}
              >
                <Image
                                source={require('@/assets/images/icon.png')} 
                                style={styles.optionImage}
                                resizeMode="contain"
                              />
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
    width: 82,
    height: 82,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    top: 5,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: Platform.OS === 'android' ? '700' : '600',
    marginTop:5,
  },
   optionImage: {
    width: 82,
    height: 82,
    zIndex: 1,
    top: 5,
  },
});


