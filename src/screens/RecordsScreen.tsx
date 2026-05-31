import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, Dimensions, Linking, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LineChart } from 'react-native-chart-kit';
import { useStore } from '../store/useStore';
import { Button, Card, CardBody, Toast } from '../components';
import TabBarSpacer from '../components/TabBarSpacer';

import { Colors, FontSize, FontWeight, Radius, Spacing, ThemePresets } from '../theme';
import { Record as MedicalRecord } from '../types';

const { width } = Dimensions.get('window');

const TYPE_META: { [key: string]: { color: string; bg: string; icon: string } } = {
  Laboratory:  { color: Colors.primaryDark, bg: Colors.primaryLight, icon: 'test-tube' },
  Radiology:   { color: Colors.lavendarDark, bg: Colors.lavender, icon: 'radioactive' },
  General:     { color: Colors.success, bg: Colors.successLight, icon: 'clipboard-pulse' },
  Prescription:{ color: Colors.warning, bg: Colors.warningLight, icon: 'pill' },
  Referral:    { color: Colors.danger, bg: Colors.dangerLight, icon: 'account-arrow-right' },
  Other:       { color: Colors.neutral600, bg: Colors.neutral100, icon: 'file-document' },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META['Other'];
}

export default function RecordsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { records, healthMetrics, removeRecord, themeChoice } = useStore();
  const theme = ThemePresets[themeChoice];
  const toastRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeTab, setActiveTab]       = useState<'List' | 'Analytics'>('List');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const showDetail = (record: MedicalRecord) => {
    setSelectedRecord(record);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const hideDetail = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setSelectedRecord(null);
    });
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || r.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const glucoseData = healthMetrics.filter(m => m.type === 'Glucose');

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Remove this record permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        removeRecord(id);
        hideDetail();
      }},
    ]);
  };

  const handleOpenFile = (fileUri?: string) => {
    if (!fileUri) {
      Alert.alert('No File', 'This record has no attached file.');
      return;
    }
    Linking.openURL(fileUri).catch(() =>
      Alert.alert('Cannot Open', 'Unable to open this file on your device.')
    );
  };

  const detailTranslateY = slideAnim.interpolate({
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

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.primary }]}>
        <View>
          <Text style={styles.headerTitle}>Medical Vault</Text>
          <Text style={styles.headerSub}>{records.length} records secured</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ReportUpload')}
        >
          <Ionicons name="add" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}> 
        {(['List', 'Analytics'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && { color: theme.surface }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'List' ? (
          <>
            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={theme.textMuted} />
              <TextInput
                placeholder="Search records, doctors..."
                style={styles.searchInput}
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {['All', 'Laboratory', 'General', 'Radiology', 'Prescription'].map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterText, activeFilter === f && { color: theme.surface }]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="file-search-outline" size={72} color={theme.primary} />
                <Text style={styles.emptyTitle}>No records found</Text>
                <Text style={styles.emptySubtitle}>Tap + to upload your first medical document</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('ReportUpload')}>
                  <Text style={styles.emptyBtnText}>Upload Report</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredRecords.map(record => {
                const meta = getTypeMeta(record.type);
                return (
                  <TouchableOpacity
                    key={record.id}
                    style={[styles.recordCard]}
                    onPress={() => showDetail(record)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                      <MaterialCommunityIcons name={meta.icon as any} size={24} color={meta.color} />
                    </View>
                    <View style={styles.recordInfo}>
                      <View style={styles.recordHeaderRow}>
                        <Text style={styles.recordTitle} numberOfLines={1}>{record.title}</Text>
                        {record.notarized && (
                          <View style={styles.notarizedBadge}>
                            <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
                          </View>
                        )}
                      </View>
                      <Text style={styles.recordDoctor}>{record.doctor}</Text>
                      <View style={styles.recordMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: meta.bg }]}>
                          <Text style={[styles.typeBadgeText, { color: meta.color }]}>{record.type}</Text>
                        </View>
                        <Text style={styles.recordDate}>{record.date}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : (
          /* Analytics Tab */
          <View style={styles.analyticsContainer}>
            {glucoseData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Glucose Trend (Last 7 Days)</Text>
                <LineChart
                  data={{
                    labels: glucoseData.map(m => m.date.split('-')[2]),
                    datasets: [{ data: glucoseData.map(m => m.value), color: () => Colors.primaryDark, strokeWidth: 3 }],
                  }}
                  width={width - 60}
                  height={200}
                  chartConfig={{
                    backgroundColor: Colors.white, backgroundGradientFrom: Colors.white, backgroundGradientTo: Colors.white,
                    decimalPlaces: 0,
                    color: (o = 1) => Colors.primaryDark,
                    labelColor: (o = 1) => Colors.textMuted,
                    propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.primaryDark },
                  }}
                  bezier
                  style={{ borderRadius: 12 }}
                />
                <View style={styles.chartSummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Average</Text>
                    <Text style={styles.summaryValue}>
                      {(glucoseData.reduce((s, m) => s + m.value, 0) / glucoseData.length).toFixed(1)} mg/dL
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Status</Text>
                    <Text style={[styles.summaryValue, { color: Colors.success }]}>Stable</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Records</Text>
                    <Text style={styles.summaryValue}>{records.length}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.metricsGrid}>
              {[
                { icon: 'heart-pulse', color: Colors.danger, label: 'Heart Rate', value: '72 bpm' },
                { icon: 'water', color: Colors.primary, label: 'Hydration', value: '1.8 L' },
                { icon: 'thermometer', color: Colors.warning, label: 'Temperature', value: '36.6 °C' },
                { icon: 'lungs', color: Colors.lavendarDark, label: 'SpO2', value: '98%' },
              ].map(m => (
                <View key={m.label} style={styles.metricCard}>
                  <MaterialCommunityIcons name={m.icon as any} size={28} color={m.color} />
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.insightCard, { backgroundColor: Colors.warningLight, borderColor: Colors.warningLight }]}>
              <Ionicons name="bulb" size={26} color={Colors.warning} />
              <View style={styles.insightContent}>
                <Text style={[styles.insightTitle, { color: Colors.warningDark }]}>AI Health Insight</Text>
                <Text style={[styles.insightText, { color: Colors.warningDark }]}>
                  Your glucose is stable. A 20-minute morning walk can help maintain this trend and improve cardiovascular health.
                </Text>
              </View>
            </View>
          </View>
        )}
        <TabBarSpacer />
      </ScrollView>

      {/* Bottom Sheet Overlay */}
      {selectedRecord && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={hideDetail}
          />
        </Animated.View>
      )}

      {/* Record Detail Bottom Sheet */}
      {selectedRecord && (
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: detailTranslateY }] }
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle} numberOfLines={2}>{selectedRecord.title}</Text>
            <TouchableOpacity onPress={hideDetail} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons name="close" size={24} color={Colors.neutral600} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.detailContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
          >
            {(() => {
              const meta = getTypeMeta(selectedRecord.type);
              return (
                <>
                  {/* Category Banner */}
                  <View style={[styles.detailBanner, { backgroundColor: meta.bg }]}>
                    <MaterialCommunityIcons name={meta.icon as any} size={28} color={meta.color} />
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Text style={[styles.detailType, { color: meta.color }]}>{selectedRecord.type}</Text>
                      {selectedRecord.notarized && (
                        <View style={styles.notarizedPill}>
                          <Ionicons name="shield-checkmark" size={12} color={Colors.success} />
                          <Text style={styles.notarizedText}>Verified</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Details Grid */}
                  <View style={styles.detailGrid}>
                    {[
                      { label: 'Doctor', value: selectedRecord.doctor, icon: 'person-outline' },
                      { label: 'Date', value: selectedRecord.date, icon: 'calendar-outline' },
                      { label: 'Hospital', value: selectedRecord.hospital, icon: 'business-outline' },
                    ].map((row, idx) => (
                      <View key={idx} style={styles.detailItem}>
                        <View style={styles.detailItemIcon}>
                          <Ionicons name={row.icon as any} size={18} color={Colors.primary} />
                        </View>
                        <View>
                          <Text style={styles.detailItemLabel}>{row.label}</Text>
                          <Text style={styles.detailItemValue}>{row.value || '—'}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {selectedRecord.hash && (
                    <View style={styles.hashBox}>
                      <Text style={styles.hashLabel}>Blockchain Hash</Text>
                      <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
                        {selectedRecord.hash}
                      </Text>
                    </View>
                  )}

                  {selectedRecord.aiInsights && (
                    <View style={styles.aiBox}>
                      <View style={styles.aiHeader}>
                        <MaterialCommunityIcons name="brain" size={20} color={Colors.warning} />
                        <Text style={styles.aiTitle}>AI Analysis</Text>
                      </View>
                      <Text style={styles.aiText}>{selectedRecord.aiInsights}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.detailActions}>
                    <Button
                      label="Close"
                      variant="ghost"
                      onPress={hideDetail}
                      style={{ flex: 1, marginRight: Spacing.sm }}
                    />
                    <Button
                      label="View Document"
                      variant="primary"
                      onPress={() => handleOpenFile(selectedRecord.fileUri)}
                      style={{ flex: 1 }}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.deleteLink}
                    onPress={() => handleDelete(selectedRecord.id)}
                  >
                    <Text style={styles.deleteLinkText}>Delete Record</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </ScrollView>
        </Animated.View>
      )}

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral50 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
  },
  headerTitle: { fontSize: FontSize.h2, fontWeight: FontWeight.bold, color: Colors.neutral900, letterSpacing: -0.5 },
  headerSub: { fontSize: FontSize.bodySmall, color: Colors.neutral600, marginTop: Spacing.xs, fontWeight: FontWeight.medium },
  addButton: {
    backgroundColor: Colors.primary, width: 44, height: 44,
    borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  tab: { 
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, marginRight: Spacing.md,
    backgroundColor: Colors.neutral100,
  },
  activeTab: { backgroundColor: Colors.neutral900 },
  tabText: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.neutral600 },
  activeTabText: { color: Colors.white },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 0 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.lg, marginBottom: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.neutral200,
  },
  searchInput: { flex: 1, marginLeft: Spacing.md, fontSize: FontSize.body, color: Colors.neutral900, fontWeight: FontWeight.medium },
  filterRow: { marginBottom: Spacing.lg },
  filterChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.xl,
    backgroundColor: Colors.white, marginRight: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.neutral200,
  },
  activeFilter: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.neutral600, fontWeight: FontWeight.bold, fontSize: FontSize.bodySmall },
  activeFilterText: { color: Colors.white, fontWeight: FontWeight.bold },
  recordCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.lg,
    marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.neutral200,
  },
  iconBox: { width: 52, height: 52, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.neutral900, marginBottom: Spacing.xs },
  recordDoctor: { fontSize: FontSize.body, color: Colors.neutral600, marginBottom: Spacing.md, fontWeight: FontWeight.medium },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  typeBadge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.md },
  typeBadgeText: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  recordDate: { fontSize: FontSize.bodySmall, color: Colors.neutral500, fontWeight: FontWeight.medium },
  notarizedBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.successLight,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm,
  },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: Spacing.lg },
  recordHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  emptyTitle: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.neutral600, marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.body, color: Colors.neutral500, textAlign: 'center', marginTop: Spacing.md },
  emptyBtn: {
    marginTop: Spacing.xl, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md, borderRadius: Radius.lg,
  },
  emptyBtnText: { color: Colors.white, fontWeight: FontWeight.bold, fontSize: FontSize.body },
  analyticsContainer: {},
  chartCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.lg,
    borderWidth: 1.5, borderColor: Colors.neutral200,
  },
  chartTitle: { fontSize: FontSize.h4, fontWeight: FontWeight.bold, color: Colors.neutral900, marginBottom: Spacing.lg },
  chartSummary: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.neutral100,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.bodySmall, color: Colors.neutral600, fontWeight: FontWeight.medium, marginBottom: Spacing.sm },
  summaryValue: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.neutral900 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  metricCard: {
    width: (width - 64) / 2, backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.neutral200,
  },
  metricLabel: { fontSize: FontSize.bodySmall, color: Colors.neutral600, marginTop: Spacing.md, marginBottom: Spacing.sm, fontWeight: FontWeight.medium },
  metricValue: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.neutral900 },
  insightCard: {
    flexDirection: 'row', backgroundColor: Colors.warningLight, borderRadius: Radius.lg,
    padding: Spacing.lg, alignItems: 'flex-start',
    borderWidth: 1.5, borderColor: Colors.warningLight,
  },
  insightContent: { flex: 1, marginLeft: Spacing.lg },
  insightTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.warningDark, marginBottom: Spacing.sm },
  insightText: { fontSize: FontSize.body, color: Colors.warningDark, lineHeight: 22, fontWeight: FontWeight.regular },

  // Bottom Sheet
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  backdrop: { flex: 1 },
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
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailTitle: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.neutral900, flex: 1, marginRight: Spacing.md },
  detailContent: { paddingHorizontal: Spacing.lg },
  detailBanner: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.lg,
  },
  detailType: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.xs },
  notarizedPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.md, gap: Spacing.xs,
  },
  notarizedText: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, color: Colors.success },
  detailGrid: { marginBottom: Spacing.lg },
  detailItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral100,
  },
  detailItemIcon: {
    width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, marginTop: 2,
  },
  detailItemLabel: { fontSize: FontSize.bodySmall, color: Colors.neutral600, fontWeight: FontWeight.medium },
  detailItemValue: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.neutral900, marginTop: Spacing.xs },
  hashBox: {
    backgroundColor: Colors.neutral50, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1.5, borderColor: Colors.neutral200,
  },
  hashLabel: { fontSize: FontSize.bodySmall, color: Colors.neutral600, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  hashValue: { fontSize: FontSize.bodySmall, color: Colors.neutral900, fontFamily: 'monospace' },
  aiBox: {
    backgroundColor: Colors.successLight, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1.5, borderColor: Colors.successLight,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  aiTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.success, marginLeft: Spacing.md },
  aiText: { fontSize: FontSize.body, color: Colors.success, lineHeight: 22, fontWeight: FontWeight.regular },
  detailActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl, marginBottom: Spacing.md },
  deleteLink: { alignItems: 'center', paddingVertical: Spacing.md },
  deleteLinkText: { color: Colors.danger, fontWeight: FontWeight.bold, fontSize: FontSize.body },
});
