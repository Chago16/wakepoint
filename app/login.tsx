import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
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
    <View style={styles.container}>
      <Text style={styles.title}>Dev Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

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
        <Text style={styles.checkboxLabel}>Keep me logged in</Text>
      </TouchableOpacity>

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    flex: 1
  },
  title: {
    fontSize: 24,
    marginBottom: 24
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 6
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#666',
    marginRight: 8,
    borderRadius: 4
  },
  checkedBox: {
    backgroundColor: '#007bff'
  },
  checkboxLabel: {
    fontSize: 16
  },
  link: {
    marginTop: 16,
    color: '#007bff',
    textAlign: 'center'
  }
});
