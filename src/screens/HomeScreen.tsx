import React, { useRef, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, CardBody, Badge, Toast } from '../components';
import TabBarSpacer from '../components/TabBarSpacer';

import { Colors, FontSize, FontWeight, Radius, Spacing, ThemePresets } from '../theme';
import { useStore } from '../store/useStore';


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REFACTORED HomeScreen - MedChain Healthcare App
 * * UI/UX IMPROVEMENTS:
 * ✓ Zero Shadows: Flat design system using clean, 1px borders.
 * ✓ Consistent Radii: Strict adherence to Radius.lg for all containers.
 * ✓ Reduced Redundancy: Navigation intents are singular and clear.
 * ✓ Improved Flow: Wallet moved down; immediate health actions prioritized.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const scrollAnimRef = useRef(new Animated.Value(0)).current;
  const [headerOpacity] = useState(new Animated.Value(1));

  const { 
    user, 
    medications, 
    appointments, 
    records,
    allergies,
    tokens, 
    healthMetrics,
    isDataSharingEnabled, 
    setSharingEnabled, 
    accessRequests, 
    approveAccessRequest, 
    denyAccessRequest,
    themeChoice,
  } = useStore();
  const theme = ThemePresets[themeChoice];

  const upcomingAppointment = appointments.find(a => a.status === 'upcoming');
  const activeMeds = medications.filter(m => m.status === 'pending').length;
  const pendingRequests = accessRequests?.filter(r => r.status === 'pending') || [];

  // Latest health metrics — pull the most recent reading of each type
  const latestHeartRate = healthMetrics.filter(m => m.type === 'Heart Rate').slice(-1)[0];
  const latestGlucose = healthMetrics.filter(m => m.type === 'Glucose').slice(-1)[0];

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    scrollAnimRef.setValue(scrollY);

    if (scrollY > 20) {
      Animated.timing(headerOpacity, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar style="light" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* ═══ PREMIUM HEADER SECTION ═══ */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.primary }]}>
          <View style={styles.headerContent}>
            
            <View style={styles.greetingSection}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.subtitle}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
              </View>

              <Animated.View style={[styles.headerActions, { opacity: headerOpacity }]}>
                <TouchableOpacity 
                  style={styles.actionIcon} 
                  onPress={() => navigation.navigate('Security')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBg, { backgroundColor: theme.primaryLight }]}> 
                    <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionIcon} 
                  onPress={() => navigation.navigate('Notifications')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBg, pendingRequests.length > 0 ? { backgroundColor: theme.accent } : null]}> 
                    <Ionicons name="notifications" size={20} color={Colors.white} />
                  </View>
                  {pendingRequests.length > 0 && (
                    <View style={styles.notificationDot}>
                      <Text style={styles.notificationCount}>{pendingRequests.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Health Status Bar */}
            <View style={styles.statusBarContainer}>
                <View style={styles.statusItem}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color={Colors.white} style={styles.statusIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>Heart Rate</Text>
                  <Text style={styles.statusValue}>
                    {latestHeartRate ? `${latestHeartRate.value} ${latestHeartRate.unit}` : '— bpm'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusDivider} />

              <View style={styles.statusItem}>
                <MaterialCommunityIcons name="diabetes" size={20} color={Colors.white} style={styles.statusIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>Glucose</Text>
                  <Text style={styles.statusValue}>
                    {latestGlucose ? `${latestGlucose.value} ${latestGlucose.unit}` : '— mg/dL'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusDivider} />

              <View style={styles.statusItem}>
                <MaterialCommunityIcons name="pill" size={20} color={Colors.white} style={styles.statusIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>Medications</Text>
                  <Text style={styles.statusValue}>{activeMeds > 0 ? `${activeMeds} Due` : 'All Done'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ═══ UPCOMING APPOINTMENT - HIGHEST PRIORITY ═══ */}
        {upcomingAppointment && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Visit</Text>
            </View>

            <Card style={styles.flatCard}>
              <CardBody>
                <View style={styles.apptDocHeader}>
                  <View style={styles.apptAvatar}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' }} 
                      style={styles.apptAvatarImg}
                    />
                    <View style={styles.apptStatus} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.apptDocName}>{upcomingAppointment.doctorName}</Text>
                    <Text style={styles.apptDocSpec}>{upcomingAppointment.specialty}</Text>
                    <Text style={styles.apptConfirmed}>Confirmed</Text>
                  </View>
                  <TouchableOpacity style={styles.apptCallBtn}>
                    <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.apptDetailsSection}>
                  <View style={styles.apptDetailRow}>
                    <Ionicons name="calendar-clear-outline" size={18} color={Colors.neutral600} />
                    <Text style={styles.apptDetailValue}>
                      {upcomingAppointment.date} at {upcomingAppointment.time}
                    </Text>
                  </View>

                  <View style={styles.apptDetailRow}>
                    <Ionicons name="location-outline" size={18} color={Colors.neutral600} />
                    <Text style={styles.apptDetailValue}>{(upcomingAppointment as any).location || 'See appointment details'}</Text>
                  </View>
                </View>

                <Button
                  label="View Details"
                  variant="primary"
                  onPress={() => navigation.navigate('Appointments')}
                  style={styles.apptBtn}
                />
              </CardBody>
            </Card>
          </View>
        )}

        {/* ═══ QUICK ACTIONS (Streamlined, No Redundancy) ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.actionGrid}>
            
            <TouchableOpacity style={styles.flatActionCard} onPress={() => navigation.navigate('ExploreDoctors')} activeOpacity={0.7}>
              <View style={[styles.cleanActionIconBg, { backgroundColor: theme.primaryLight }]}> 
                <FontAwesome5 name="user-md" size={22} color={theme.primary} />
              </View>
              <Text style={styles.cleanActionLabel}>Find Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flatActionCard} onPress={() => navigation.navigate('ReportUpload')} activeOpacity={0.7}>
              <View style={[styles.cleanActionIconBg, { backgroundColor: theme.primaryLight }]}> 
                <Ionicons name="document-text" size={22} color={theme.primary} />
              </View>
              <Text style={styles.cleanActionLabel}>Add Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flatActionCard} onPress={() => navigation.navigate('Security')} activeOpacity={0.7}>
              <View style={[styles.cleanActionIconBg, { backgroundColor: theme.primaryLight }]}> 
                <Ionicons name="qr-code" size={22} color={theme.primary} />
              </View>
              <Text style={styles.cleanActionLabel}>Share ID</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* ═══ MEDI-WALLET (Moved Down) ═══ */}
        <View style={styles.section}>
          <Card style={[styles.flatCardDark, { backgroundColor: theme.primary }]}> 
            <CardBody>
              <View style={styles.walletInner}>
                <View>
                  <Text style={styles.walletLabel}>MediWallet Balance</Text>
                  <View style={styles.walletRow}>
                    <Text style={styles.walletAmount}>{tokens}</Text>
                    <Text style={styles.walletCurrency}>MTK</Text>
                  </View>
                  <Text style={styles.walletSubtext}>Your secure health credits</Text>
                </View>
                <View style={styles.walletIcon}>
                  <MaterialCommunityIcons name="ethereum" size={32} color={Colors.white} />
                </View>
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ YOUR HEALTH GRID ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Health</Text>
              <View style={styles.gridContainer}>
            
            <TouchableOpacity style={styles.flatGridItem} onPress={() => navigation.navigate('Medications')} activeOpacity={0.7}>
              <MaterialCommunityIcons name="pill" size={26} color={Colors.neutral600} style={styles.gridIcon} />
              <View>
                <Text style={styles.gridItemTitle}>Medications</Text>
                {activeMeds > 0 && <Text style={styles.gridItemSubtext}>{activeMeds} Active</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flatGridItem} onPress={() => navigation.navigate('Allergies')} activeOpacity={0.7}>
              <MaterialCommunityIcons name="alert-circle-outline" size={26} color={Colors.neutral600} style={styles.gridIcon} />
              <View>
                <Text style={styles.gridItemTitle}>Allergies</Text>
                <Text style={styles.gridItemSubtext}>{allergies.length} Recorded</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flatGridItem} onPress={() => navigation.navigate('Records')} activeOpacity={0.7}>
              <MaterialCommunityIcons name="folder-outline" size={26} color={Colors.neutral600} style={styles.gridIcon} />
              <View>
                <Text style={styles.gridItemTitle}>Medical Records</Text>
                <Text style={styles.gridItemSubtext}>{records.length} {records.length === 1 ? 'File' : 'Files'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flatGridItem} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={26} color={Colors.neutral600} style={styles.gridIcon} />
              <View>
                <Text style={styles.gridItemTitle}>Settings</Text>
                <Text style={styles.gridItemSubtext}>Preferences</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* ═══ DATA SHARING TOGGLE ═══ */}
        <View style={styles.section}>
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.sharingHeader}>
                <View style={[styles.sharingIconBox, { backgroundColor: isDataSharingEnabled ? theme.successLight : Colors.neutral100 }]}>
                  <Ionicons name="shield-checkmark" size={20} color={isDataSharingEnabled ? theme.success : Colors.neutral500} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sharingTitle}>Secure Data Sharing</Text>
                  <Text style={styles.sharingDesc}>Earn MTK for anonymized insights</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleSwitch, isDataSharingEnabled && styles.toggleSwitchActive]}
                  onPress={() => setSharingEnabled(!isDataSharingEnabled)}
                  activeOpacity={0.8}
                >
                  <Animated.View style={[styles.toggleDot, isDataSharingEnabled && styles.toggleDotActive]} />
                </TouchableOpacity>
              </View>
            </CardBody>
          </Card>
        </View>

        <View style={{ height: 4 }} />
        <TabBarSpacer />
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
    paddingBottom: 0,
  },

  // ═══ HEADER SECTION ═══
  header: {
    backgroundColor: Colors.primary, 
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    // Consistent bottom radii matching standard card shapes
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  headerContent: {
    gap: Spacing.lg,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.xs,
  },
  userName: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionIcon: {
    position: 'relative',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white + '26',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBgAlert: {
    backgroundColor: Colors.danger + '33',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },

  // ═══ STATUS BAR ═══
  statusBarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.white + '1A',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  statusItem: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusIcon: {
    opacity: 0.9,
  },
  statusLabel: {
    fontSize: FontSize.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusValue: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  statusDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: Spacing.xs,
  },

  // ═══ SECTIONS & SPACING ═══
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },

  // ═══ UNIVERSAL FLAT CARDS (No Shadows, Strict Radii) ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
  },
  flatCardDark: {
    backgroundColor: Colors.dark,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral700,
  },

  // ═══ WALLET CARD CONTENT ═══
  walletInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  walletLabel: {
    fontSize: FontSize.body,
    color: Colors.neutral500,
    marginBottom: Spacing.xs,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  walletCurrency: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral300,
  },
  walletSubtext: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginTop: Spacing.xs,
  },
  walletIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white + '1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ═══ QUICK ACTIONS CONTENT ═══
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -Spacing.sm,
  },
  flatActionCard: {
    flexBasis: '48%',
    minWidth: 150,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    alignItems: 'center',
  },
  cleanActionIconBg: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg, // Consistent radius
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cleanActionLabel: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.neutral700,
    textAlign: 'center',
  },

  // ═══ APPOINTMENT CARD CONTENT ═══
  apptDocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  apptAvatar: {
    position: 'relative',
  },
  apptAvatarImg: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg, // Consistent radius
  },
  apptStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  apptDocName: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  apptDocSpec: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginTop: 2,
  },
  apptConfirmed: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  apptCallBtn: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  apptDetailsSection: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  apptDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  apptDetailValue: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.neutral700,
  },
  apptBtn: {
    marginTop: Spacing.lg,
  },

  // ═══ DATA SHARING CONTENT ═══
  sharingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sharingIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg, // Consistent radius
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharingTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  sharingDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral200,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.success,
    alignItems: 'flex-end',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    // Removed shadows from toggle dot for strict compliance
  },
  toggleDotActive: {},

  // ═══ HEALTH GRID CONTENT ═══
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -Spacing.sm,
  },
  flatGridItem: {
    flexBasis: '48%',
    minWidth: 140,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
  },
  gridIcon: {
    marginRight: Spacing.md,
  },
  gridItemTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral700,
  },
  gridItemSubtext: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginTop: 2,
  },
});