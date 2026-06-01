import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Toast, Button } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing, ThemePresets, ThemeOptions } from '../theme';
import QRCode from 'react-native-qrcode-svg';
import { useStore } from '../store/useStore';
import { generateQrToken } from '../services/api';
import { useNfc } from '../hooks/useNfc';

export default function SecurityScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { user, themeChoice, setThemeChoice } = useStore();
  const theme = ThemePresets[themeChoice];
  const [privacySettings, setPrivacySettings] = useState({
    twoFactor: true,
    biometric: true,
    dataSharing: false,
    marketingEmails: false,
    activityLog: true,
  });
  const [qrValue, setQrValue] = useState<string>('');
  const nfc = useNfc();

  // Request server-signed QR token and refresh every 60s
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await generateQrToken(user?.id || 'anon');
        if (mounted && res?.token) setQrValue(res.token);
      } catch (e) {
        console.warn('Failed to generate QR token', e);
      }
    }
    load();
    const id = setInterval(load, 60000);
    return () => { mounted = false; clearInterval(id); };
  }, [user?.id]);

  const handleToggle = (key: string) => {
    setPrivacySettings({ ...privacySettings, [key]: !privacySettings[key as keyof typeof privacySettings] });
    toastRef.current?.show({
      message: 'Setting updated',
      type: 'success',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ HEADER ═══ */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.primary }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ MY MEDICAL ID (QR) ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Medical ID</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrValue}
                  size={150}
                  color={theme.primary}
                  backgroundColor={theme.surface}
                />
                <Text style={styles.qrText}>
                  Show this QR code to healthcare providers to grant them temporary access to your medical records.
                </Text>
                <Button
                  label="Generate New ID"
                  variant="outline"
                  onPress={async () => {
                    try {
                      const res = await generateQrToken(user?.id || 'anon');
                      if (res?.token) setQrValue(res.token);
                      toastRef.current?.show({ message: 'New Medical ID generated', type: 'success' });
                    } catch (e) {
                      toastRef.current?.show({ message: 'Failed to generate ID', type: 'danger' });
                    }
                  }}
                  style={{ marginTop: Spacing.md, width: '100%' }}
                />
                {nfc.available && (
                  <Button
                    label="Write to NFC"
                    variant="primary"
                    onPress={async () => {
                      try {
                        await nfc.start();
                        await nfc.writeToken(qrValue);
                        toastRef.current?.show({ message: 'QR token written to NFC', type: 'success' });
                      } catch (e) {
                        toastRef.current?.show({ message: 'NFC write failed', type: 'danger' });
                      }
                    }}
                    style={{ marginTop: Spacing.sm, width: '100%' }}
                  />
                )}
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ SECURITY SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDesc}>Extra security for your account</Text>
                </View>
                <Switch
                  value={privacySettings.twoFactor}
                  onValueChange={() => handleToggle('twoFactor')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.twoFactor ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Biometric Authentication</Text>
                  <Text style={styles.settingDesc}>Fingerprint or face ID</Text>
                </View>
                <Switch
                  value={privacySettings.biometric}
                  onValueChange={() => handleToggle('biometric')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.biometric ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDesc}>Update your account password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>
        </View>

        {/* ═══ PRIVACY SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Share My Data</Text>
                  <Text style={styles.settingDesc}>Help improve healthcare research</Text>
                </View>
                <Switch
                  value={privacySettings.dataSharing}
                  onValueChange={() => handleToggle('dataSharing')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.dataSharing ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.settingItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Marketing Emails</Text>
                  <Text style={styles.settingDesc}>Receive tips and special offers</Text>
                </View>
                <Switch
                  value={privacySettings.marketingEmails}
                  onValueChange={() => handleToggle('marketingEmails')}
                  trackColor={{ false: Colors.neutral300, true: Colors.success + '50' }}
                  thumbColor={privacySettings.marketingEmails ? Colors.success : Colors.neutral400}
                />
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ APP THEME SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Theme</Text>
          <Text style={styles.sectionSubtitle}>Choose a palette based on your care style.</Text>
          {ThemeOptions.map((option) => {
            const preset = ThemePresets[option.id];
            const isSelected = option.id === themeChoice;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                activeOpacity={0.8}
                onPress={() => {
                  setThemeChoice(option.id);
                  toastRef.current?.show({ message: `${option.title} theme selected`, type: 'success' });
                }}
              >
                <View style={styles.themeRow}>
                  <View style={[styles.themeSwatch, { backgroundColor: preset.primary }]} />
                  <View style={styles.themeMeta}>
                    <Text style={styles.themeTitle}>{option.title}</Text>
                    <Text style={styles.themeDesc}>{option.description}</Text>
                    <Text style={styles.themeRecommendation}>{option.recommendation}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isSelected ? theme.primary : Colors.neutral400}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ═══ DATA SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('DataPrivacy')}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="document-text" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <Text style={styles.settingDesc}>How we protect your data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Activity Log</Text>
                  <Text style={styles.settingDesc}>Review your account activity</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.dangerLight }]}> 
                  <Ionicons name="trash" size={20} color={Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Delete Account</Text>
                  <Text style={styles.settingDesc}>Permanently delete all data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },

  // ═══ HEADER ═══
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },

  // ═══ SECTIONS ═══
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginBottom: Spacing.md,
  },
  themeCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  themeCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  themeSwatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
  },
  themeMeta: {
    flex: 1,
  },
  themeTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  themeDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.xs,
  },
  themeRecommendation: {
    fontSize: FontSize.label,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // ═══ CARDS ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },

  // ═══ QR CODE ═══
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  qrText: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 20,
  },

  // ═══ SETTING ITEMS ═══
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  settingDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
  },
});
