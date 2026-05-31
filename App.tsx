import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useDatabaseInit } from './src/hooks/useDatabaseInit';

/**
 * App shell — waits for SQLite to open and load data before rendering the
 * navigator.  Shows a premium loading screen in the interim so there's no
 * flash of empty / stale state.
 */
export default function App() {
  const isDbReady = useDatabaseInit();

  if (!isDbReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <View style={styles.logoRing}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
          <Text style={styles.splashTitle}>MediChain SL</Text>
          <Text style={styles.splashSub}>Preparing secure vault and patient data…</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000728',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  splashSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
});
