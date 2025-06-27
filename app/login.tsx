import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // login logic here...
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
  link: {
    marginTop: 16,
    color: '#007bff',
    textAlign: 'center'
  }
});
