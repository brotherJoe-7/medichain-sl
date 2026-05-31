import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image, Animated, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, CardBody, Toast } from '../components';
import TabBarSpacer from '../components/TabBarSpacer';

import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { AuthService } from '../services/authService';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { user, setUser, logout, themeChoice } = useStore();

  const isProfileIncomplete = !user || !user.name || !user.email || !user.phone || !user.bloodType || !user.weight || !user.height;
  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'P';
  const selectedThemeLabel = themeChoice.charAt(0).toUpperCase() + themeChoice.slice(1);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    weight: user?.weight || '',
    height: user?.height || '',
    bloodType: user?.bloodType || '',
    phone: user?.phone || '',
  });

  const slideAnimRef = useRef(new Animated.Value(600)).current;
  const overlayOpacityRef = useRef(new Animated.Value(0)).current;

  const showForm = () => {
    setEditedInfo({
      name: user?.name || '',
      email: user?.email || '',
      weight: user?.weight || '',
      height: user?.height || '',
      bloodType: user?.bloodType || '',
      phone: user?.phone || '',
    });
    setShowEditForm(true);

    Animated.parallel([
      Animated.timing(slideAnimRef, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacityRef, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideForm = () => {
    Animated.parallel([
      Animated.timing(slideAnimRef, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacityRef, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowEditForm(false);
    });
  };

  const handleLogout = () => {
    toastRef.current?.show({
      message: 'Are you sure you want to logout?',
      type: 'info',
      duration: 0,
      action: {
        label: 'Logout',
        onPress: async () => {
          await AuthService.logout();
          logout();
        },
      },
    });
  };

  const handleSaveProfile = () => {
    if (!editedInfo.name.trim()) {
      toastRef.current?.show({
        message: 'Name cannot be empty.',
        type: 'error',
      });
      return;
    }

    setUser({
      ...user!,
      name: editedInfo.name.trim(),
      email: editedInfo.email.trim(),
      weight: editedInfo.weight,
      height: editedInfo.height,
      bloodType: editedInfo.bloodType,
      phone: editedInfo.phone,
    });

    hideForm();
    toastRef.current?.show({
      message: 'Profile updated successfully.',
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
        {/* ═══ HEADER SECTION ═══ */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <View style={{ width: 44 }} />
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={showForm}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ═══ PROFILE INFO CARD ═══ */}
        <View style={styles.section}>
          <Card style={[styles.flatCard, styles.profileCard]}>
            <CardBody>
              <View style={styles.profileContent}>
                <View style={styles.avatarContainer}>
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                  )}
                  <View style={styles.onlineBadge} />
                </View>

                <Text style={styles.profileName}>{user?.name || 'Your Health Profile'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'Email not set'}</Text>
                <Text style={styles.profilePhone}>{user?.phone || 'Add your phone number'}</Text>

                <View style={styles.profileBadges}>
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>Patient</Text>
                  </View>
                  <View style={[styles.profileBadge, styles.profileBadgeSecondary]}>
                    <Text style={[styles.profileBadgeText, styles.profileBadgeSecondaryText]}>Verified</Text>
                  </View>
                </View>

                <Text style={styles.profileSummary}>
                  Secure health access with personalized records and verified care history.
                </Text>
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ HEALTH METRICS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          {isProfileIncomplete && (
            <Card style={[styles.flatCard, styles.profilePromptCard]}>
              <CardBody>
                <Text style={styles.profilePromptTitle}>Finish your profile</Text>
                <Text style={styles.profilePromptText}>
                  Complete a few details so your care plan stays personalized and accurate.
                </Text>
                <Button
                  label="Update Profile"
                  variant="primary"
                  onPress={showForm}
                  style={styles.profilePromptButton}
                />
              </CardBody>
            </Card>
          )}
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Blood Type</Text>
                  <Text style={styles.metricValue}>{user?.bloodType || '—'}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Weight</Text>
                  <Text style={styles.metricValue}>{user?.weight || '—'}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Height</Text>
                  <Text style={styles.metricValue}>{user?.height || '—'}</Text>
                </View>
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ MEDICAL INFORMATION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <TouchableOpacity
            style={styles.flatMenuItem}
            onPress={() => navigation.navigate('Allergies')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.dangerLight }]}>
              <MaterialCommunityIcons name="alert-decagram-outline" size={22} color={Colors.danger} />
            </View>
            <Text style={styles.flatMenuText}>Allergies</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flatMenuItem}
            onPress={() => navigation.navigate('Medications')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.successLight }]}>
              <MaterialCommunityIcons name="pill" size={22} color={Colors.success} />
            </View>
            <Text style={styles.flatMenuText}>Active Medications</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
          </TouchableOpacity>
        </View>

        {/* ═══ APP SETTINGS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <TouchableOpacity
            style={styles.flatMenuItem}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.flatMenuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flatMenuItem}
            onPress={() => navigation.navigate('Security')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.lavender }]}> 
              <Ionicons name="color-palette-outline" size={22} color={Colors.lavendarDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.flatMenuText}>Theme & Appearance</Text>
              <Text style={styles.themeInfoText}>Current: {selectedThemeLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flatMenuItem}
            onPress={() => navigation.navigate('Security')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.lavender }]}> 
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.lavendarDark} />
            </View>
            <Text style={styles.flatMenuText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flatMenuItem}
            onPress={showForm}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: Colors.primaryLight }]}> 
              <Ionicons name="create-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.flatMenuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
          </TouchableOpacity>
        </View>

        {/* ═══ LOGOUT BUTTON ═══ */}
        <View style={styles.section}>
          <Button
            label="Logout"
            variant="danger"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={20} color={Colors.white} />}
          />
        </View>

        <TabBarSpacer />
      </ScrollView>

      {/* ═══ EDIT FORM BOTTOM SHEET ═══ */}
      {showEditForm && (
        <Animated.View
          style={[
            styles.bottomSheetOverlay,
            { opacity: overlayOpacityRef },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={hideForm}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            transform: [{ translateY: slideAnimRef }],
            display: showEditForm ? 'flex' : 'none',
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bottomSheetContent}
        >
          <View style={[styles.dragHandle, { marginTop: insets.bottom }]} />

          <ScrollView
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.formTitle}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.neutral400}
                value={editedInfo.name}
                onChangeText={(t) => setEditedInfo({ ...editedInfo, name: t })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.neutral400}
                value={editedInfo.email}
                onChangeText={(t) => setEditedInfo({ ...editedInfo, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={Colors.neutral400}
                value={editedInfo.phone}
                onChangeText={(t) => setEditedInfo({ ...editedInfo, phone: t })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Blood Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., O+, AB-"
                placeholderTextColor={Colors.neutral400}
                value={editedInfo.bloodType}
                onChangeText={(t) => setEditedInfo({ ...editedInfo, bloodType: t })}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  placeholderTextColor={Colors.neutral400}
                  value={editedInfo.weight}
                  onChangeText={(t) => setEditedInfo({ ...editedInfo, weight: t })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Height"
                  placeholderTextColor={Colors.neutral400}
                  value={editedInfo.height}
                  onChangeText={(t) => setEditedInfo({ ...editedInfo, height: t })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.formActions, { paddingBottom: insets.bottom + Spacing.lg, flexDirection: 'row' }]}>
            <Button
              label="Cancel"
              variant="ghost"
              onPress={hideForm}
              style={{ flex: 1 }}
            />
            <Button
              label="Save Changes"
              variant="primary"
              onPress={handleSaveProfile}
              style={{ flex: 1 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

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
  editHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
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

  // ═══ FLAT CARDS ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
  },

  // ═══ PROFILE SECTION ═══
  profileCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.neutral600,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  profilePhone: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  profileBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryLight,
  },
  profileBadgeSecondary: {
    backgroundColor: Colors.successLight,
  },
  profileBadgeText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  profileBadgeSecondaryText: {
    color: Colors.successDark,
  },
  profileSummary: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  profilePromptCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  profilePromptTitle: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  profilePromptText: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral700,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  profilePromptButton: {
    alignSelf: 'flex-start',
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  themeInfoText: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
    marginTop: Spacing.xs,
  },

  // ═══ METRICS ═══
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexBasis: '30%',
    minWidth: 90,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metricLabel: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  metricValue: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  metricDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.neutral200,
    marginHorizontal: Spacing.md,
  },

  // ═══ MENU ITEMS ═══
  flatMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral200,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  flatMenuText: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },

  // ═══ BOTTOM SHEET ═══
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.neutral900 + '80',
    zIndex: 10,
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    zIndex: 11,
    maxHeight: '90%',
  },
  bottomSheetContent: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  formScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  formTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.body,
    color: Colors.neutral900,
    fontWeight: FontWeight.medium,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputGroupHalf: {
    flex: 1,
  },
  formActions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral200,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
