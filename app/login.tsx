import { ThemedText } from '@/components/ThemedText';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BASE_URL } from '@config';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('All fields are required');
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();
      console.log('💬 Raw response:', text);

      try {
        const data = JSON.parse(text);
        if (res.ok) {
          Alert.alert('✅ Login successful');
          router.push('/(home)/dashboard');
        } else {
          Alert.alert('❌ ' + data.error);
        }
      } catch (e) {
        console.error('💥 Failed to parse JSON:', e);
        Alert.alert('⚠️ Server error: invalid response');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      Alert.alert('⚠️ Network or server error');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require('@/assets/images/loginBG.jpg')} // ✅ Make sure path is correct
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Image
            source={require('@/assets/images/Title.png')} 
            style={styles.titleImage}
            resizeMode="contain"/>
          <ThemedText type="title" style={{ marginTop: 250 }}>
            Login
          </ThemedText>
          <ThemedText type="default" style={{ marginBottom: 20 }}>
            Securely login to your account.
          </ThemedText>

          <ThemedText type="titleSmall" style={styles.label}>Email</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <ThemedText type="titleSmall" style={styles.label}>Password</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setKeepLoggedIn(prev => !prev)}
          >
            <View style={[styles.checkbox, keepLoggedIn && styles.checkedBox]} />
            <ThemedText
              style={[styles.checkboxlabel, keepLoggedIn && styles.checkedBoxlabel]}
              type="defaultSemiBold"
            >
              Keep me logged in
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <ThemedText type="button" style={{ color: 'white' }}>LOGIN</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => router.push('/register')}>
            <ThemedText type='default'>Not a member? </ThemedText>
            <ThemedText type='defaultSemiBold'>Register</ThemedText>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 24,
    paddingBottom: 50,
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal:40,
  },
  input: {
    borderColor: '#E3E3E8',
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    fontFamily: 'Quicksand',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#145E4D',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    elevation: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#666',
    marginRight: 8,
    borderRadius: 4,
  },
  checkedBox: {
    backgroundColor: '#A69DDA',
  },
  checkboxlabel: {
    color: '#AFAFAF',
  },
  checkedBoxlabel: {
    color: '#2A3435',
  },
  link: {
    flexDirection: 'row',
    marginTop: 16,
    alignSelf: 'center',
  },
  label: {
    fontSize: 18,
  },
  titleImage: {
    width: 300,
    height: 200,
    marginBottom: 50,
    top: 70,
    position: 'absolute',
    alignSelf: 'center',
  },
});
