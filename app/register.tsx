import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';

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

    const user_id = Date.now().toString(); // simple ID for dev

    try {
      const res = await fetch('http://<your-ip>:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, user_name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('✅ Registration successful');
      } else {
        Alert.alert('❌ ' + data.error);
      }
    } catch (err) {
      Alert.alert('⚠️ Error registering');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dev Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={user_name}
        onChangeText={setUsername}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <Button title="Register" onPress={handleRegister} />
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
  }
});
