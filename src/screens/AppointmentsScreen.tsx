import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Animated, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, CardBody, Badge, Toast } from '../components';
import TabBarSpacer from '../components/TabBarSpacer';
import { useStore } from '../store/useStore';

import { Colors, FontSize, FontWeight, Radius, Spacing, ThemePresets } from '../theme';

export default function AppointmentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { appointments, updateAppointmentStatus, themeChoice } = useStore();
  const theme = ThemePresets[themeChoice];
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');

  const upcomingAppointments = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
  const displayedAppointments = activeTab === 'Upcoming' ? upcomingAppointments : pastAppointments;

  const handleReschedule = (id: string) => {
    toastRef.current?.show({
      message: 'Reschedule feature coming soon',
      type: 'info',
    });
  };

  const handleCancel = async (id: string) => {
    await updateAppointmentStatus(id, 'cancelled');
    toastRef.current?.show({
      message: 'Appointment cancelled',
      type: 'info',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ HEADER ═══ */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.primary }]}>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toastRef.current?.show({ message: 'Book new appointment', type: 'info' })}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ═══ TABS ═══ */}
        <View style={[styles.tabsContainer, { backgroundColor: theme.surface }]}> 
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Upcoming' && { borderColor: theme.primary }]}
            onPress={() => setActiveTab('Upcoming')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Upcoming' && { color: theme.primary },
              ]}
            >
              Upcoming
            </Text>
            {activeTab === 'Upcoming' && <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Past' && { borderColor: theme.primary }]}
            onPress={() => setActiveTab('Past')}
          >
            <Text
              style={[styles.tabText, activeTab === 'Past' && { color: theme.primary }]}
            >
              Past
            </Text>
            {activeTab === 'Past' && <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
        </View>

        {/* ═══ APPOINTMENTS LIST ═══ */}
        <View style={styles.section}>
          {displayedAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={64}
                color={Colors.neutral300}
              />
              <Text style={styles.emptyTitle}>No {activeTab} Appointments</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any {activeTab.toLowerCase()} appointments scheduled
              </Text>
              {activeTab === 'Upcoming' && (
                <Button
                  label="Book Appointment"
                  variant="primary"
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('ExploreDoctors')}
                />
              )}
            </View>
          ) : (
            displayedAppointments.map((appointment) => (
              <Card key={appointment.id} style={styles.flatCard}>
                <CardBody>
                  {/* Appointment summary */}
                  <View style={styles.appointmentHeader}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{appointment.status.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                      <Text style={styles.doctorSpec}>{appointment.specialty}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.phoneButton}
                      onPress={() =>
                        toastRef.current?.show({
                          message: 'Call feature coming soon',
                          type: 'info',
                        })
                      }
                    >
                      <MaterialCommunityIcons
                        name="phone-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Details */}
                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={Colors.neutral600}
                      />
                      <Text style={styles.detailText}>
                        {appointment.date} at {appointment.time}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  {activeTab === 'Upcoming' && (
                    <View style={styles.actionButtons}>
                      <Button
                        label="Reschedule"
                        variant="ghost"
                        size="small"
                        onPress={() => handleReschedule(appointment.id)}
                        style={{ flex: 1, marginRight: Spacing.sm }}
                      />
                      <Button
                        label="Cancel"
                        variant="danger"
                        size="small"
                        onPress={() => handleCancel(appointment.id)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </View>

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

  // ═══ TABS ═══
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
  tab: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.neutral600,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
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

  // ═══ APPOINTMENT CONTENT ═══
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  doctorAvatar: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
  },
  statusBadge: {
    backgroundColor: Colors.neutral100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  statusBadgeText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
    color: Colors.neutral700,
    textTransform: 'uppercase',
  },
  doctorName: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  doctorSpec: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.sm,
  },
  phoneButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.neutral50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ═══ DETAILS ═══
  detailsSection: {
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.neutral900,
  },

  // ═══ ACTIONS ═══
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
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
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    marginTop: Spacing.lg,
  },
});
