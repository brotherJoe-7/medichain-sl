import React, { useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../store/useStore';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { Toast } from '../components';

export default function MedicationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { medications, updateMedicationStatus } = useStore();

  const handleMarkTaken = async (id: string, name: string) => {
    await updateMedicationStatus(id, 'taken');
    toastRef.current?.show({ message: `${name} marked as taken`, type: 'success' });
  };

  const handleMarkSkipped = async (id: string, name: string) => {
    await updateMedicationStatus(id, 'skipped');
    toastRef.current?.show({ message: `${name} marked as skipped`, type: 'info' });
  };

  const handleAddMed = () => {
    navigation.navigate('AddMedication');
  };

  const pendingCount = medications.filter(m => m.status === 'pending').length;
  const takenCount = medications.filter(m => m.status === 'taken').length;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.neutral900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Medicines</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMed}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary card */}
        {medications.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryText}>Today's Progress</Text>
              <Text style={styles.timeText}>{takenCount}/{medications.length}</Text>
              {/* BUG FIX #4: med.frequency now exists on the type */}
              <Text style={styles.medName}>{medications[0]?.name} • {medications[0]?.frequency || medications[0]?.dosage}</Text>
            </View>
            <TouchableOpacity style={styles.remindBtn}>
              <Ionicons name="notifications" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Active Medications</Text>
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={48} color={Colors.neutral300} />
            <Text style={styles.emptyStateText}>No active medications found.</Text>
          </View>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={styles.medCard}>
              <View style={[styles.iconBox, {
                backgroundColor: med.status === 'taken' ? Colors.successLight :
                  med.status === 'skipped' ? Colors.dangerLight : Colors.primaryLight
              }]}>
                <MaterialCommunityIcons
                  name="pill"
                  size={28}
                  color={med.status === 'taken' ? Colors.success : med.status === 'skipped' ? Colors.danger : Colors.primary}
                />
              </View>
              <View style={styles.medInfo}>
                <Text style={styles.medTitle}>{med.name}</Text>
                {/* BUG FIX #4: Safely renders frequency with fallback */}
                <Text style={styles.medSubtitle}>{med.dosage} • {med.frequency || 'As directed'}</Text>
                <Text style={styles.medTime}>🕐 {med.time}</Text>
                <View style={styles.tagRow}>
                  <View style={[styles.tag, {
                    backgroundColor: med.status === 'taken' ? Colors.successLight :
                      med.status === 'skipped' ? Colors.dangerLight : Colors.primaryLight
                  }]}>
                    <Text style={[styles.tagText, {
                      color: med.status === 'taken' ? Colors.success :
                        med.status === 'skipped' ? Colors.danger : Colors.primary
                    }]}>
                      {med.status === 'taken' ? '✓ Taken' : med.status === 'skipped' ? '✕ Skipped' : '⏳ Pending'}
                    </Text>
                  </View>
                </View>
              </View>
              {med.status === 'pending' && (
                <View style={styles.actionBtns}>
                  <TouchableOpacity
                    style={styles.takeBtn}
                    onPress={() => handleMarkTaken(med.id, med.name)}
                  >
                    <Ionicons name="checkmark" size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skipBtn}
                    onPress={() => handleMarkSkipped(med.id, med.name)}
                  >
                    <Ionicons name="close" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.refillCard}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
          <Text style={styles.refillText}>Request Refill</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
  },
  headerTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xxxl },
  summaryCard: {
    backgroundColor: Colors.neutral900,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  summaryInfo: { flex: 1 },
  summaryText: { color: Colors.neutral500, fontSize: FontSize.body, marginBottom: Spacing.xs },
  timeText: { color: Colors.white, fontSize: FontSize.h1, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  medName: { color: Colors.primary, fontSize: FontSize.body, fontWeight: FontWeight.medium },
  remindBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.neutral900, marginBottom: Spacing.md },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral200,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  medInfo: { flex: 1 },
  medTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.neutral900, marginBottom: Spacing.xs },
  medSubtitle: { fontSize: FontSize.bodySmall, color: Colors.neutral600, marginBottom: Spacing.xs },
  medTime: { fontSize: FontSize.bodySmall, color: Colors.neutral500, marginBottom: Spacing.sm },
  tagRow: { flexDirection: 'row' },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
  },
  tagText: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.medium },
  actionBtns: { flexDirection: 'column', gap: Spacing.sm },
  takeBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.danger + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyStateText: { fontSize: FontSize.body, color: Colors.neutral500, marginTop: Spacing.lg },
  refillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  refillText: { marginLeft: Spacing.md, fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.primary },
});
