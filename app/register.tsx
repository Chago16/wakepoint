import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [user_name, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = async () => {
    if (!user_name || !email || !password || !confirm) {
      return Alert.alert('All fields required');
    }

    if (password !== confirm) {
      return Alert.alert('Passwords do not match');
    }

    try {
      console.log("📡 Sending request...");

      const res = await fetch('http://192.168.100.16:3000/auth/register', {
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backCircle}>
            <IconSymbol name="arrow.left.circle" size={20} color="white" />
          </View>
          <ThemedText type="defaultSemiBold" style={{ color: '#145E4D' }}>Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type="title">Register</ThemedText>
        <View style={[styles.sub, { marginBottom: 20 }]}>
          <ThemedText type="defaultSemiBold">Create an account</ThemedText>
          <ThemedText type="default"> within 10 seconds.</ThemedText>
        </View>

        <ThemedText type="titleSmall" style={styles.label}>Username</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={user_name}
          onChangeText={setUsername}
        />

        <ThemedText type="titleSmall" style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
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

        <ThemedText type="titleSmall" style={styles.label}>Confirm Password</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <ThemedText type="button" style={{ color: "white" }}>REGISTER</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 50,
    backgroundColor: '#FAF9F7',
  },
  input: {
    borderColor: '#E3E3E8',
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    fontFamily: 'Quicksand',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#A69DDA',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  },
  label: {
    fontSize: 18
  },
  sub: {
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 10,
  },
  backCircle:{
    backgroundColor: '#145E4D',
    borderRadius: 999,
    padding: 4,
  }
});
