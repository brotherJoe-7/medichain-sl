import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../theme';
import { useStore } from '../store/useStore';
import { AuthService } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [showPass, setShowPass]      = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  const insets = useSafeAreaInsets();
  const { setUser, setAuthenticated, user } = useStore();
  const toastRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      toastRef.current?.show({
        message: 'Please enter both your email and password.',
        type: 'error',
      });
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!emailOk) {
      toastRef.current?.show({
        message: 'Please enter a valid email address.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      const session = await AuthService.login(trimmedEmail, password);
      const displayName = trimmedEmail === 'patient@medichain.sl'
        ? 'Demo Patient'
        : trimmedEmail.split('@')[0].replace(/[-._]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

      setUser({
        id: session.userId,
        name: displayName,
        email: session.email,
        phone: '',
        bloodType: '',
        weight: '',
        height: '',
      });
      setAuthenticated(true);
    } catch (err: any) {
      toastRef.current?.show({
        message: err?.message ?? 'Incorrect email or password.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemo = () => {
    setEmail('patient@medichain.sl');
    setPassword('password123');
  };

  return (
    <SafeAreaView style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <StatusBar style="light" />
      <LinearGradient colors={[Colors.neutral900, Colors.neutral900]} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: Spacing.lg, paddingBottom: Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons name="dna" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.title}>MediChain <Text style={styles.accent}>SL</Text></Text>
              <Text style={styles.subtitle}>Secure Blockchain Medical Records</Text>
            </View>

            {/* ─── Login Form ─── */}
            <View style={styles.formCard}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.instructionText}>Login to access your medical vault</Text>

              <TouchableOpacity style={styles.demoHint} onPress={autofillDemo}>
                <Text style={styles.demoHintText}>
                  Demo: <Text style={styles.demoBold}>patient@medichain.sl</Text> • <Text style={styles.demoBold}>password123</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputActive]}>
                  <Ionicons name="mail-outline" size={20} color={emailFocused ? Colors.primary : Colors.neutral600} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={Colors.neutral400}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputWrapper, passFocused && styles.inputActive]}>
                  <Ionicons name="lock-closed-outline" size={20} color={passFocused ? Colors.primary : Colors.neutral600} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.neutral400}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.neutral600} />
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                label={isLoading ? '' : 'Secure Login'}
                onPress={handleLogin}
                disabled={isLoading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity>
                  <Text style={styles.signUpText}>Register Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ─── Security Footer ─── */}
            <View style={styles.securityInfo}>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                <Text style={styles.securityText}>AES-256 Encrypted</Text>
              </View>
              <View style={styles.securityBadge}>
                <MaterialCommunityIcons name="link-box" size={16} color={Colors.primary} />
                <Text style={styles.securityText}>Immutable Ledger</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast ref={toastRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.neutral900 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  container: { flex: 1, justifyContent: 'center' },
  
  header: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logoContainer: {
    width: 80, height: 80, borderRadius: Radius.md, 
    backgroundColor: `${Colors.primaryLight}40`,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.primary}30`,
  },
  title: { 
    fontSize: FontSize.h1, 
    fontWeight: FontWeight.bold, 
    color: Colors.white, 
    letterSpacing: -0.5 
  },
  accent: { color: Colors.primary },
  subtitle: { 
    fontSize: FontSize.body, 
    color: Colors.neutral600, 
    marginTop: Spacing.sm 
  },
  
  formCard: {
    backgroundColor: `${Colors.neutral900}B3`,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.white}08`,
  },
  welcomeText: { 
    fontSize: FontSize.h2, 
    fontWeight: FontWeight.bold, 
    color: Colors.white 
  },
  instructionText: { 
    fontSize: FontSize.body, 
    color: Colors.neutral600, 
    marginTop: Spacing.xs, 
    marginBottom: Spacing.lg 
  },
  
  demoHint: {
    backgroundColor: `${Colors.primary}15`,
    padding: Spacing.md, 
    borderRadius: Radius.md, 
    marginBottom: Spacing.lg,
    borderWidth: 1, 
    borderColor: `${Colors.primary}25`,
  },
  demoHintText: { 
    fontSize: FontSize.label, 
    color: Colors.neutral600, 
    textAlign: 'center' 
  },
  demoBold: { color: Colors.primary, fontWeight: FontWeight.bold },

  inputGroup: { marginBottom: Spacing.lg },
  label: { 
    fontSize: FontSize.label, 
    fontWeight: FontWeight.bold, 
    color: Colors.neutral200, 
    marginBottom: Spacing.xs 
  },
  labelRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  forgotText: { 
    fontSize: FontSize.body, 
    color: Colors.primary, 
    fontWeight: FontWeight.bold 
  },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.neutral900,
    borderRadius: Radius.lg, 
    paddingHorizontal: Spacing.md, 
    height: 44,
    borderWidth: 1.5, 
    borderColor: Colors.neutral600,
  },
  inputActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.neutral900 
  },
  input: { 
    flex: 1, 
    marginLeft: Spacing.md, 
    color: Colors.white, 
    fontSize: FontSize.body 
  },
  
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: Spacing.lg, 
    gap: Spacing.sm 
  },
  footerText: { 
    color: Colors.neutral600, 
    fontSize: FontSize.body 
  },
  signUpText: { 
    color: Colors.primary, 
    fontSize: FontSize.body, 
    fontWeight: FontWeight.bold 
  },

  securityInfo: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: Spacing.xxxl, 
    gap: Spacing.lg 
  },
  securityBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.xs 
  },
  securityText: { 
    fontSize: FontSize.label, 
    color: Colors.neutral600, 
    fontWeight: FontWeight.bold 
  },
});

