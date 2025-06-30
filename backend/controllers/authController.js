// controllers/authController.js

import { Alert } from 'react-native';
import { router } from 'expo-router';
import { BASE_URL } from '@config';

export const handleLogin = async (email, password) => {
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

export const handleRegister = async (user_name, email, password, confirm) => {
  if (!user_name || !email || !password || !confirm) {
    return Alert.alert('All fields required');
  }

  if (password !== confirm) {
    return Alert.alert('Passwords do not match');
  }

  try {
    console.log("📡 Sending request...");

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name, email, password })
    });

    console.log("📬 Got a response, waiting for JSON...");
    const data = await res.json();
    console.log("📦 API response data:", data);

    if (res.ok) {
      Alert.alert('✅ Registration successful');
      router.push('/login');
    } else {
      Alert.alert('❌ ' + data.error);
    }
  } catch (err) {
    console.error('💥 Register error:', err);
    Alert.alert('⚠️ Failed to register');
  }
};