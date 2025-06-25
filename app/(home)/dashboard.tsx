import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ImageBackground, Platform, StyleSheet } from 'react-native';


export default function HomeScreen() {
  return (
    <ImageBackground
        source={require('@/assets/images/dashboardBG.png')} //wakepoint-splash-image   dashboardBG
        style={styles.background}
        resizeMode="cover">
    <ParallaxScrollView
      headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
      headerImage={<></>}>

        <ThemedView style={styles.topContainer}>
          <ThemedView style={styles.headerContainer}>
            <ThemedView style={styles.welcomeContainer}>
              <ThemedText type="subtitle1">Welcome</ThemedText>
              <ThemedText type="subtitle2">Name,</ThemedText>
            </ThemedView>
            <ThemedText type="defaultSemiBold">We are here to wake you up </ThemedText>
          </ThemedView>
        </ThemedView>
        

        <ThemedView style={styles.titleContainer}>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle1">Step 1: Try it</ThemedText>
          <ThemedText>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
            Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: 'cmd + d',
                android: 'cmd + m',
                web: 'F12',
              })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle1">Step 2: Explore</ThemedText>
          <ThemedText>
            Tap the Explore tab to learn more about what's included in this starter app.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle1">Step 3: Get a fresh start</ThemedText>
          <ThemedText>
            When you're ready, run <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{' '}
            to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText> directory.
          </ThemedText>
        </ThemedView>
    </ParallaxScrollView>

      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 32,
  },
  topContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 8,
  },
  welcomeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#ADCE7D',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerContainer: {
    flexDirection: 'column',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
});
