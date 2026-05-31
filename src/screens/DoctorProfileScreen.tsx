import React, { useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Badge, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing, ThemePresets } from '../theme';
import { useStore } from '../store/useStore';
import { formatLeone } from '../utils/currency';

export default function DoctorProfileScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { themeChoice } = useStore();
  const theme = ThemePresets[themeChoice];
  
  const doctor = route.params?.doctor;

  const handleBookAppointment = () => {
    if (!doctor) {
      toastRef.current?.show({
        message: 'Doctor details are unavailable.',
        type: 'error',
      });
      return;
    }
    toastRef.current?.show({
      message: `Appointment with ${doctor.name} booked!`,
      type: 'success',
    });
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  if (!doctor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <StatusBar style="light" />
        <Text style={styles.emptyTitle}>Doctor information is unavailable.</Text>
        <Button
          label="Go Back"
          variant="primary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: Spacing.lg }}
        />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => toastRef.current?.show({ message: 'Profile link copied!', type: 'success' })}>
            <Ionicons name="share-social" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ═══ DOCTOR CARD ═══ */}
        <View style={styles.section}>
          <Card style={styles.flatCard}>
            <CardBody>
            <View style={styles.doctorHeader}>
              <Image
                source={{ uri: doctor.avatar }}
                style={styles.largeAvatar}
              />
              <View style={styles.doctorHeaderContent}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.specialty}>{doctor.specialty}</Text>
                <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={18} color={Colors.warning} />
                  <Text style={styles.rating}>{doctor.rating}</Text>
                  <Text style={styles.reviews}>({doctor.reviews})</Text>
                </View>
                <Text style={styles.experience}>{doctor.experience}</Text>
              </View>
            </View>
          </CardBody>
        </Card>
        </View>

        {/* ═══ QUICK INFO ═══ */}
        <View style={styles.section}>
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: theme.primaryLight }]}> 
                    <MaterialCommunityIcons name="clock-outline" size={20} color={theme.primary} />
                  </View>
                  <Text style={styles.infoLabel}>Availability</Text>
                  <Text style={styles.infoValue}>{doctor.availability}</Text>
                </View>
                <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: theme.successLight }]}> 
                    <Ionicons name="cash" size={20} color={theme.success} />
                  </View>
                  <Text style={styles.infoLabel}>Consultation Fee</Text>
                  <Text style={[styles.infoValue, { color: theme.primaryDark }]}>{formatLeone(doctor.price)}</Text>
                </View>
              </View>
            </CardBody>
          </Card>
        </View>

        {/* ═══ BIO ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              <Text style={styles.bioText}>{doctor.bio}</Text>
            </CardBody>
          </Card>
        </View>

        {/* ═══ EDUCATION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              {doctor.education?.map((edu: string, index: number) => (
                <View key={index}>
                  <View style={styles.educationItem}>
                    <MaterialCommunityIcons
                      name="school"
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.educationText}>{edu}</Text>
                  </View>
                  {index < doctor.education.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </CardBody>
          </Card>
        </View>

        {/* ═══ CERTIFICATIONS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              {doctor.certifications?.map((cert: string, index: number) => (
                <View key={index}>
                  <View style={styles.certItem}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={Colors.success}
                    />
                    <Text style={styles.certText}>{cert}</Text>
                  </View>
                  {index < doctor.certifications.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </CardBody>
          </Card>
        </View>

        {/* ═══ LANGUAGES ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.languagesContainer}>
                {doctor.languages?.map((lang: string, index: number) => (
                  <Badge
                    key={index}
                    variant="primary"
                  >
                    {lang}
                  </Badge>
                ))}
              </View>
            </CardBody>
          </Card>
        </View>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>

      {/* ═══ BOTTOM BAR ═══ */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          label="Book Appointment"
          variant="primary"
          size="large"
          onPress={handleBookAppointment}
        />
      </View>

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
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ═══ DOCTOR CARD ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },
  doctorHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.lg,
  },
  doctorHeaderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  specialty: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginBottom: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  rating: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  reviews: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
  },
  experience: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    fontWeight: FontWeight.medium,
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

  // ═══ INFO GRID ═══
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    textAlign: 'center',
  },

  // ═══ BIO ═══
  bioText: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    lineHeight: 22,
  },

  // ═══ EDUCATION ═══
  educationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  educationText: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    fontWeight: FontWeight.medium,
  },

  // ═══ CERTIFICATIONS ═══
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  certText: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    fontWeight: FontWeight.medium,
  },

  // ═══ DIVIDER ═══
  divider: {
    height: 1,
    backgroundColor: Colors.neutral200,
  },

  // ═══ LANGUAGES ═══
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    textAlign: 'center',
    marginHorizontal: Spacing.lg,
  },

  // ═══ BOTTOM BAR ═══
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
});
