import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Badge, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing, ThemePresets } from '../theme';
import { useStore } from '../store/useStore';
import { formatLeone } from '../utils/currency';

const SPECIALTIES = ['All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedic'];

export default function ExploreDoctorsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { themeChoice } = useStore();
  const theme = ThemePresets[themeChoice];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const doctors: any[] = [];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = (doctorName: string) => {
    toastRef.current?.show({
      message: `Appointment with ${doctorName} booked!`,
      type: 'success',
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Doctor</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ SEARCH BAR ═══ */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, specialties..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ═══ SPECIALTY FILTER ═══ */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtiesScroll}
          >
            {SPECIALTIES.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.specialtyChip,
                  selectedSpecialty === specialty && styles.activeSpecialtyChip,
                ]}
                onPress={() => setSelectedSpecialty(specialty)}
              >
                <Text
                  style={[
                    styles.specialtyText,
                    selectedSpecialty === specialty && styles.activeSpecialtyText,
                  ]}
                >
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ═══ DOCTORS LIST ═══ */}
        <View style={styles.section}>
          {filteredDoctors.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="doctor"
                size={64}
                color={Colors.neutral300}
              />
              <Text style={styles.emptyTitle}>No Doctors Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredDoctors.map((doctor) => (
              <Card key={doctor.id} style={styles.flatCard}>
                <CardBody>
                  <TouchableOpacity
                    style={styles.doctorCard}
                    onPress={() => navigation.navigate('DoctorProfile', { doctor })}
                    activeOpacity={0.7}
                  >
                    {/* Doctor Info */}
                    <View style={styles.doctorHeader}>
                      <Image
                        source={{ uri: doctor.avatar }}
                        style={styles.doctorAvatar}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <View style={styles.ratingRow}>
                          <MaterialCommunityIcons name="star" size={16} color={Colors.warning} />
                          <Text style={styles.rating}>{doctor.rating}</Text>
                          <Text style={styles.reviews}>({doctor.reviews} reviews)</Text>
                        </View>
                      </View>
                      <Text style={[styles.price, { color: theme.primaryDark }]}>{formatLeone(doctor.price)}</Text>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="briefcase" size={16} color={Colors.neutral600} />
                        <Text style={styles.detailText}>{doctor.experience}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color={Colors.neutral600} />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {doctor.availability}
                        </Text>
                      </View>
                    </View>

                    {/* Book Button */}
                    <Button
                      label="Book Appointment"
                      variant="primary"
                      size="small"
                      onPress={() => handleBookAppointment(doctor.name)}
                      style={styles.bookButton}
                    />
                  </TouchableOpacity>
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

  // ═══ SEARCH ═══
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.body,
    color: Colors.neutral900,
  },

  // ═══ FILTER ═══
  filterSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  specialtiesScroll: {
    gap: Spacing.sm,
  },
  specialtyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    backgroundColor: Colors.white,
  },
  activeSpecialtyChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specialtyText: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.neutral600,
  },
  activeSpecialtyText: {
    color: Colors.white,
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

  // ═══ DOCTOR CARD ═══
  doctorCard: {
    gap: Spacing.md,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
  },
  doctorName: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  doctorSpecialty: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rating: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
  },
  reviews: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral500,
  },
  price: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  // ═══ DETAILS ═══
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral200,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.neutral200,
  },
  detailText: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    fontWeight: FontWeight.medium,
  },

  // ═══ BUTTON ═══
  bookButton: {
    marginTop: Spacing.md,
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
