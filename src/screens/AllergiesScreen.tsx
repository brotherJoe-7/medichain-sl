import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../store/useStore';
import { Button, Card, CardBody, Badge, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing, ThemePresets } from '../theme';
import { Allergy } from '../types';

export default function AllergiesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { allergies, addAllergy, removeAllergy, themeChoice } = useStore();
  const theme = ThemePresets[themeChoice];
  const toastRef = useRef<any>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [newAllergy, setNewAllergy] = useState({
    name: '',
    type: 'Drug' as Allergy['type'],
    severity: 'Low' as Allergy['severity'],
    reaction: '',
  });

  const showForm = () => {
    setIsFormVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const hideForm = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsFormVisible(false);
    });
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.name.trim() || !newAllergy.reaction.trim()) {
      toastRef.current?.show('Missing Fields', 'Please fill in the allergy name and reaction.', 'error');
      return;
    }
    await addAllergy({
      id: Date.now().toString(),
      ...newAllergy,
    });
    setNewAllergy({ name: '', type: 'Drug', severity: 'Low', reaction: '' });
    hideForm();
    toastRef.current?.show('Success', 'Allergy added to your medical profile.', 'success');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove Allergy',
      `Remove "${name}" from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeAllergy(id) },
      ]
    );
  };

  const types: Allergy['type'][] = ['Drug', 'Food', 'Environmental', 'Other'];
  const severities: Allergy['severity'][] = ['Low', 'High', 'Critical'];

  const formTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const overlayOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.surface }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.textBody} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Allergies</Text>
        <TouchableOpacity style={styles.addButton} onPress={showForm}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color={theme.warning} />
          <Text style={styles.infoText}>This information is shared with doctors during secure access sessions.</Text>
        </View>

        {allergies.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-circle-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Allergies Recorded</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to add a known allergy.</Text>
          </View>
        ) : (
          allergies.map((item) => (
            <Card key={item.id} style={styles.allergyCard}>
              <CardBody>
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.severityBadge,
                    item.severity === 'Critical' ? styles.criticalBg :
                    item.severity === 'High' ? styles.highBg : styles.lowBg
                  ]}>
                    <Text style={[
                      styles.severityText,
                      item.severity === 'Critical' ? styles.criticalText :
                      item.severity === 'High' ? styles.highText : styles.lowText
                    ]}>{item.severity}</Text>
                  </View>
                  <Text style={styles.allergyType}>{item.type}</Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.allergyName}>{item.name}</Text>

                <View style={styles.reactionBox}>
                  <Text style={styles.reactionLabel}>Reaction:</Text>
                  <Text style={styles.reactionText}>{item.reaction}</Text>
                </View>
              </CardBody>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Bottom Sheet Overlay */}
      {isFormVisible && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={hideForm}
          />
        </Animated.View>
      )}

      {/* Add Allergy Bottom Sheet */}
      {isFormVisible && (
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: formTranslateY }] }
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Report New Allergy</Text>
            <TouchableOpacity onPress={hideForm}>
              <Ionicons name="close" size={24} color={Colors.neutral900} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
          >
            <Text style={styles.inputLabel}>Allergen Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Penicillin, Peanuts"
              placeholderTextColor="#94A3B8"
              value={newAllergy.name}
              onChangeText={(t) => setNewAllergy({ ...newAllergy, name: t })}
            />

            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.chipRow}>
              {types.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, newAllergy.type === t && styles.chipActive]}
                  onPress={() => setNewAllergy({ ...newAllergy, type: t })}
                >
                  <Text style={[styles.chipText, newAllergy.type === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Severity</Text>
            <View style={styles.chipRow}>
              {severities.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, newAllergy.severity === s && styles.chipActive]}
                  onPress={() => setNewAllergy({ ...newAllergy, severity: s })}
                >
                  <Text style={[styles.chipText, newAllergy.severity === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Reaction / Symptoms *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Hives, Swelling, Difficulty breathing"
              placeholderTextColor="#94A3B8"
              value={newAllergy.reaction}
              onChangeText={(t) => setNewAllergy({ ...newAllergy, reaction: t })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={hideForm}
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <Button
                label="Save Allergy"
                variant="primary"
                onPress={handleAddAllergy}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F1F5F9',
  },
  headerTitle: { fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.neutral900, letterSpacing: -0.5 },
  addButton: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E0F2FE',
  },
  scrollContent: { padding: Spacing.lg },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    alignItems: 'center',
  },
  infoText: { flex: 1, marginLeft: Spacing.md, fontSize: FontSize.body, color: '#92400E', lineHeight: 22, fontWeight: FontWeight.medium },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.neutral900, marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.body, color: Colors.neutral600, marginTop: Spacing.md, textAlign: 'center', lineHeight: 22 },
  allergyCard: {
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.md },
  criticalBg: { backgroundColor: '#FEE2E2' },
  highBg: { backgroundColor: '#FFEDD5' },
  lowBg: { backgroundColor: '#F1F5F9' },
  severityText: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold },
  criticalText: { color: '#EF4444' },
  highText: { color: '#F59E0B' },
  lowText: { color: Colors.neutral600 },
  allergyType: { fontSize: FontSize.bodySmall, color: Colors.neutral600, fontWeight: FontWeight.bold, textTransform: 'uppercase', flex: 1, marginLeft: Spacing.md },
  deleteBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
  },
  allergyName: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.neutral900, marginBottom: Spacing.md },
  reactionBox: { backgroundColor: Colors.primaryLight, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: '#E0F2FE' },
  reactionLabel: { fontSize: FontSize.bodySmall, color: Colors.neutral600, marginBottom: Spacing.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  reactionText: { fontSize: FontSize.body, color: Colors.neutral900, fontWeight: FontWeight.medium, lineHeight: 22 },

  // Bottom Sheet Styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    zIndex: 1000,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral300,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  formTitle: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.neutral900 },
  formContent: {
    paddingHorizontal: Spacing.lg,
  },
  inputLabel: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, color: Colors.neutral600, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  input: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.body,
    color: Colors.neutral900,
    fontWeight: FontWeight.medium,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.body, color: Colors.neutral600, fontWeight: FontWeight.bold },
  chipTextActive: { color: Colors.white },
  formActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
});
