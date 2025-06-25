import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';


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
          <TouchableOpacity onPress={() => console.log('Logout')} style={{ marginTop: 5 }}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={28} color="black" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="titleSmall">Current Trip</ThemedText>
        </ThemedView>

        <ThemedView style={styles.middleContainer}>
          <ThemedText type="titleSmall">Quick Options</ThemedText>
          <ThemedView style={styles.optionsContainer}>

            <TouchableOpacity onPress={() => console.log('Logout')} style={styles.optionButton}>
              <Image
                source={require('@/assets/images/quick-icon-1.png')} 
                style={{ width: 58, height: 58, marginBottom: 4 }}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>Set{'\n'}Trip Alarm</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Logout')} style={styles.optionButton}>
              <Image
                source={require('@/assets/images/quick-icon-2.png')} 
                style={{ width: 58, height: 58, marginBottom: 4 }}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>Go to{'\n'}Current Trip</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => console.log('Logout')} style={styles.optionButton}>
              <Image
                source={require('@/assets/images/quick-icon-3.png')} 
                style={{ width: 58, height: 58, marginBottom: 4 }}
                resizeMode="contain"
              />
              <ThemedText type="option" style={{ textAlign: 'center' }}>View{'\n'}Trip History</ThemedText>
            </TouchableOpacity>

          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="titleSmall">Recent Trips</ThemedText>
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
  middleContainer: {
    flexDirection: 'column',
  },
  optionsContainer: {
     flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 5,
    
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 12,
    width: 80, 
    elevation: 10,
  },

  headerContainer: {
    flexDirection: 'column',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
});
