/**
 * TabBarSpacer — Renders bottom clearance + a subtle branded footer
 * below scrollable content in tab screens, so the last item is never
 * hidden behind the floating bottom navigation bar.
 *
 * Usage: Drop <TabBarSpacer /> as the last child of any tab-screen ScrollView.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';

// Tab bar height (65) + floating bottom (insets + 4 or 16) + breathing room
const TAB_BAR_HEIGHT = 65;
const EXTRA_PADDING = 16;

export default function TabBarSpacer() {
  const insets = useSafeAreaInsets();
  const bottomClearance = TAB_BAR_HEIGHT + (insets.bottom > 0 ? insets.bottom + 4 : 16) + EXTRA_PADDING;

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomClearance }]}>
      {/* Subtle divider */}
      <View style={styles.divider} />

      {/* Brand footer */}
      <View style={styles.footer}>
        <MaterialCommunityIcons name="shield-lock" size={14} color={Colors.neutral400} />
        <Text style={styles.footerText}>MediChain SL</Text>
        <View style={styles.dot} />
        <Text style={styles.footerText}>Powered by Hyperledger Fabric</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral200,
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: Colors.neutral400,
    letterSpacing: 0.3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.neutral300,
  },
});
