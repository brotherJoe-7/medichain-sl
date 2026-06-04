import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../theme';
import { DoctorAuthService } from '../services/doctorAuthService';

export default function DoctorLoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [doctorId, setDoctorId] = useState('doctor_smith');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const toastRef = useRef<any>(null);

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await DoctorAuthService.login(doctorId.trim(), password);
      toastRef.current?.show({ message: 'Doctor login successful', type: 'success' });
      navigation.navigate('DoctorScan');
    } catch (err: any) {
      const message = err?.message || 'Unable to sign in';
      setErrorMessage(message);
      toastRef.current?.show({ message, type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>Doctor Login</Text>
        <Text style={styles.subtitle}>Authenticate with your doctor credentials to verify QR access.</Text>

        <View style={styles.form}> 
          <Text style={styles.label}>Doctor ID</Text>
          <TextInput
            style={styles.input}
            value={doctorId}
            onChangeText={setDoctorId}
            placeholder="doctor_smith"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            secureTextEntry
            editable={!isLoading}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Button
            label={isLoading ? 'Signing in…' : 'Sign in as Doctor'}
            variant="primary"
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
          />

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Return to patient login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  label: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral50,
    color: Colors.neutral900,
  },
  button: {
    marginTop: Spacing.xl,
  },
  secondaryAction: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  errorText: {
    color: Colors.danger,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
