import React, { useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Badge, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Sarah Wilson is confirmed for tomorrow at 10:30 AM',
    timestamp: 'Today',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    read: false,
  },
  {
    id: '2',
    type: 'medication',
    title: 'Medication Reminder',
    message: 'Take your daily medication: Aspirin 100mg',
    timestamp: 'Yesterday',
    icon: 'pill',
    read: true,
  },
  {
    id: '3',
    type: 'access',
    title: 'Data Access Request',
    message: 'City Hospital is requesting access to your medical records',
    timestamp: '2 days ago',
    icon: 'shield-checkmark',
    read: false,
  },
  {
    id: '4',
    type: 'general',
    title: 'Health Tip',
    message: 'Stay hydrated! Drink at least 8 glasses of water per day',
    timestamp: '3 days ago',
    icon: 'water',
    read: true,
  },
];

export default function NotificationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);

  const handleClearAll = () => {
    toastRef.current?.show({
      message: 'All notifications cleared',
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
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearAll}
          >
            <MaterialCommunityIcons name="check-all" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ═══ NOTIFICATIONS LIST ═══ */}
        <View style={styles.section}>
          {NOTIFICATIONS.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="bell-off-outline"
                size={64}
                color={Colors.neutral300}
              />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>
                You're all caught up! Check back later for updates
              </Text>
            </View>
          ) : (
            NOTIFICATIONS.map((notification) => (
              <Card key={notification.id} style={[styles.flatCard, !notification.read && styles.unreadCard]}>
                <CardBody>
                  <View style={styles.notificationContent}>
                    {/* Avatar or Icon */}
                    {notification.avatar ? (
                      <Image
                        source={{ uri: notification.avatar }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.iconBox, getIconColor(notification.type).bgColor]}>
                        <MaterialCommunityIcons
                          name={(notification.icon || 'bell') as any}
                          size={24}
                          color={getIconColor(notification.type).color}
                        />
                      </View>
                    )}

                    {/* Content */}
                    <View style={styles.contentSection}>
                      <View style={styles.titleRow}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.message} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.timestamp}>{notification.timestamp}</Text>
                    </View>

                    {/* Action */}
                    {notification.type !== 'general' && (
                      <TouchableOpacity
                        style={styles.notifActionButton}
                        onPress={() => {
                          if (notification.type === 'appointment') {
                            toastRef.current?.show({
                              message: 'Navigating to appointments...',
                              type: 'success',
                            });
                            navigation.navigate('Appointments');
                          } else if (notification.type === 'medication') {
                            navigation.navigate('Medications');
                          } else if (notification.type === 'access') {
                            toastRef.current?.show({
                              message: 'Opening access request...',
                              type: 'success',
                            });
                          }
                        }}
                      >
                        <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </CardBody>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      <Toast ref={toastRef} />
    </View>
  );
}

function getIconColor(type: string) {
  switch (type) {
    case 'appointment':
      return { color: Colors.primary, bgColor: { backgroundColor: Colors.primaryLight } };
    case 'medication':
      return { color: Colors.success, bgColor: { backgroundColor: Colors.successLight } };
    case 'access':
      return { color: Colors.warning, bgColor: { backgroundColor: Colors.warningLight } };
    default:
      return { color: Colors.neutral600, bgColor: { backgroundColor: Colors.neutral200 } };
  }
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
  actionButton: {
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

  // ═══ CARDS ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },
  unreadCard: {
    backgroundColor: Colors.primary + '08',
  },

  // ═══ NOTIFICATION CONTENT ═══
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  message: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
  },
  notifActionButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ═══ EMPTY STATE ═══
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    textAlign: 'center',
  },
});
