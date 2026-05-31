import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { useStore } from '../store/useStore';
import { Toast, Button } from '../components';

export default function AddMedicationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const { addMedication } = useStore();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      toastRef.current?.show({ message: 'Please enter medication name', type: 'danger' });
      return;
    }

    const med = {
      id: 'med_' + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      dosage: dosage.trim() || 'As prescribed',
      frequency: frequency.trim() || 'As directed',
      time: time.trim() || '',
      status: 'pending' as const,
    };

    try {
      await addMedication(med as any);
      toastRef.current?.show({ message: 'Medication added', type: 'success' });
      navigation.goBack();
    } catch (e) {
      toastRef.current?.show({ message: 'Failed to add medication', type: 'danger' });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.neutral900} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Medication</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="e.g., Amoxicillin" style={styles.input} />

        <Text style={styles.label}>Dosage</Text>
        <TextInput value={dosage} onChangeText={setDosage} placeholder="e.g., 500mg" style={styles.input} />

        <Text style={styles.label}>Frequency</Text>
        <TextInput value={frequency} onChangeText={setFrequency} placeholder="e.g., Twice daily" style={styles.input} />

        <Text style={styles.label}>Time</Text>
        <TextInput value={time} onChangeText={setTime} placeholder="e.g., 08:00 AM" style={styles.input} />

        <Button label="Add Medication" variant="primary" onPress={handleSubmit} style={{ marginTop: Spacing.lg }} />
      </View>

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  backBtn: { width: 44, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral200 },
  title: { flex: 1, textAlign: 'center', fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.neutral900 },
  form: { paddingHorizontal: Spacing.lg },
  label: { fontSize: FontSize.bodySmall, color: Colors.neutral600, marginTop: Spacing.md, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.neutral200 },
});
