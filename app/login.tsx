import { ThemedText } from '@/components/ThemedText';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { handleLogin } from '@controllers/authController';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require('@/assets/images/loginBG.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Image
            source={require('@/assets/images/Title.png')}
            style={styles.titleImage}
            resizeMode="contain"
          />
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

          <TouchableOpacity style={styles.button} onPress={() => handleLogin(email, password)}>
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
    paddingHorizontal: 40,
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
