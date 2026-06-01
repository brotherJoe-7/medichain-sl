/**
 * src/theme/index.ts — MedChain Design System v1.0
 * 
 * Complete design token system for MediChain SL app
 * All screens should import from this file and use these tokens exclusively
 * 
 * Usage:
 * import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../theme';
 */

export const Colors = {
  // Primary — Core brand color (MediChain Flat Blue)
  primary:       '#3B82F6',
  primaryDark:   '#2563EB',
  primaryLight:  '#DBEAFE',
  primaryMid:    '#93C5FD',

  // Accent — Lime green for CTAs (use sparingly on dark backgrounds only)
  accent:        '#BFFF00',
  accentLight:   '#F5FFB3',

  // Success / Teal — Positive states, verifications
  success:       '#1D9E75',
  successDark:   '#0F6E56',
  successLight:  '#E1F5EE',
  successBorder: '#9FE1CB',

  // Warning / Amber — Caution, pending states
  warning:       '#EF9F27',
  warningDark:   '#854F0B',
  warningLight:  '#FAEEDA',
  warningBorder: '#F5D89F',

  // Danger / Red — Errors, destructive actions, revoked states
  danger:        '#E24B4A',
  dangerDark:    '#A32D2D',
  dangerLight:   '#FCEBEB',
  dangerBorder:  '#F09595',

  // Semantic surface tones
  lavender:      '#E6E0F8',   // Blockchain, AI, advanced features
  lavendarDark:  '#3C3489',
  mint:          '#EAF7EB',   // Health, wellness, vitality

  // Neutrals — Grayscale foundation
  neutral900:    '#1A1A1A',   // Primary text, headings, strong emphasis
  neutral700:    '#374151',   // Dark body text
  neutral600:    '#6B7280',   // Muted text, labels, placeholders, secondary content
  neutral500:    '#9CA3AF',   // Placeholder, disabled text
  neutral400:    '#B0B7C3',   // Subtle text, borders
  neutral300:    '#D1D5DB',   // Light borders, dividers
  neutral200:    '#E5E7EB',   // Borders, dividers, subtle separators
  neutral100:    '#F3F4F6',   // Input backgrounds, ghost button bg, hover states
  neutral50:     '#F9FAFB',   // Page/screen background, card containers

  // Aliases for readability
  white:         '#FFFFFF',
  dark:          '#1A1A1A',
  textBody:      '#374151',   // Slightly lighter than 900 for body copy
  textMuted:     '#6B7280',
  border:        '#E5E7EB',
  bg:            '#F9FAFB',
};

/**
 * Font size scale — follows iOS/Material guidelines
 * Use these values exclusively; do not hard-code sizes
 */
export const FontSize = {
  h1:        28,    // Large headings (screen titles)
  h2:        22,    // Secondary headings (section headers)
  h3:        18,    // Tertiary headings (card titles)
  h4:        15,    // Quaternary headings (list item titles)
  bodyLarge: 15,    // Large body text
  body:      13,    // Standard body text (most common)
  bodySmall: 12,    // Small body text, secondary info
  caption:   11,    // Captions, hints, metadata
  label:     10,    // Labels, badges, small UI text
};

/**
 * Font weight scale
 * CRITICAL: Maximum weight is 500 ('bold' in MedChain)
 * Never use 600, 700, or 'bold' (which usually means 700)
 * This is a key visual distinction of the design system
 */
export const FontWeight = {
  bold:     '500' as const,   // Used for headings, labels, emphasis (max weight)
  medium:   '500' as const,   // Alias for bold (semantic clarity)
  regular:  '400' as const,   // Default weight for body text
};

/**
 * Border radius scale — create visual hierarchy through rounded corners
 */
export const Radius = {
  sm:   12,      // Small elements, input fields
  md:   16,      // Most cards, buttons, inputs
  lg:   24,      // Larger cards, promoted elements
  xl:   32,      // Extra large cards (elevated state)
  pill: 999,     // Fully rounded (chips, badges, pill buttons)
};

/**
 * Spacing scale — 4px base unit
 * Always use these values; never use arbitrary spacing
 * Ensures grid alignment and visual harmony
 */
export const Spacing = {
  xs:   4,       // Minimal spacing (between icon + text in badge)
  sm:   8,       // Small gap (between list items)
  md:   12,      // Medium gap (card internal padding)
  lg:   16,      // Large gap (screen horizontal padding, main gaps)
  xl:   24,      // Extra large gap (section separation)
  xxl:  32,      // Very large gap (screen sections)
  xxxl: 48,      // Maximum gap (page top padding, major sections)
};

/**
 * Shadow system — subtle depth without being heavy
 * Use Shadow.card for all cards; Shadow.strong for modals/overlays
 */
export const Shadow = {
  card: {
    shadowColor:   '#1A1A1A',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.05,       // Very subtle
    shadowRadius:  4,
    elevation:     1,          // Android equivalent
  },
  strong: {
    shadowColor:   '#1A1A1A',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,       // Slightly more pronounced for dialogs
    shadowRadius:  10,
    elevation:     3,
  },
};

/**
 * Component preset styles — reusable across the app
 */
export const Components = {
  // Button heights
  buttonHeight: 44,
  buttonSmallHeight: 34,

  // Input field height
  inputHeight: 44,

  // Top tab bar height
  headerHeight: 56,

  // Bottom tab bar height
  tabBarHeight: 64,

  // Card borders
  cardBorder: {
    borderWidth: 0.5,
    borderColor: Colors.border,
  },

  // Card base style
  cardBase: {
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
  },

  // Input base style
  inputBase: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    height: 44,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.body,
    color: Colors.neutral900,
  },

  // List separator
  separator: {
    height: 0.5,
    backgroundColor: Colors.border,
  },
};

/**
 * Status badge presets — combine bg + text color pairs
 */
export const BadgePresets = {
  verified: {
    backgroundColor: Colors.successLight,
    color: Colors.successDark,
  },
  active: {
    backgroundColor: Colors.successLight,
    color: Colors.successDark,
  },
  pending: {
    backgroundColor: Colors.warningLight,
    color: Colors.warningDark,
  },
  warning: {
    backgroundColor: Colors.warningLight,
    color: Colors.warningDark,
  },
  revoked: {
    backgroundColor: Colors.dangerLight,
    color: Colors.dangerDark,
  },
  danger: {
    backgroundColor: Colors.dangerLight,
    color: Colors.dangerDark,
  },
  blockchain: {
    backgroundColor: Colors.lavender,
    color: Colors.lavendarDark,
  },
  primary: {
    backgroundColor: Colors.primaryLight,
    color: Colors.primaryDark,
  },
  onChain: {
    backgroundColor: Colors.neutral900,
    color: Colors.white,
  },
  expired: {
    backgroundColor: Colors.neutral100,
    color: Colors.neutral600,
  },
};

export type ThemeKey = 'classic' | 'pediatric' | 'wellness' | 'senior';

export interface ThemePalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  warning: string;
  warningLight: string;
  lavender: string;
  lavendarDark: string;
  background: string;
  surface: string;
  cardBackground: string;
  textBody: string;
  textMuted: string;
  border: string;
}

export const ThemePresets: Record<ThemeKey, ThemePalette> = {
  classic: {
    primary: Colors.primary,
    primaryDark: Colors.primaryDark,
    primaryLight: Colors.primaryLight,
    accent: Colors.accent,
    success: Colors.success,
    successLight: Colors.successLight,
    danger: Colors.danger,
    dangerLight: Colors.dangerLight,
    warning: Colors.warning,
    warningLight: Colors.warningLight,
    lavender: Colors.lavender,
    lavendarDark: Colors.lavendarDark,
    background: Colors.bg,
    surface: Colors.white,
    cardBackground: Colors.white,
    textBody: Colors.textBody,
    textMuted: Colors.textMuted,
    border: Colors.border,
  },
  pediatric: {
    primary: '#10B981',
    primaryDark: '#047857',
    primaryLight: '#D1FAE5',
    accent: '#8B5CF6',
    success: '#0F766E',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    lavender: '#E0F2FE',
    lavendarDark: '#0E7490',
    background: '#F8FDFA',
    surface: '#FFFFFF',
    cardBackground: '#FFFFFF',
    textBody: '#1F2937',
    textMuted: '#4B5563',
    border: '#D1D5DB',
  },
  wellness: {
    primary: '#EC4899',
    primaryDark: '#BE185D',
    primaryLight: '#FCE7F3',
    accent: '#FBBF24',
    success: '#16A34A',
    successLight: '#DCFCE7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    lavender: '#FCE7F3',
    lavendarDark: '#9D174D',
    background: '#FFF5F7',
    surface: '#FFFFFF',
    cardBackground: '#FFFFFF',
    textBody: '#1F2937',
    textMuted: '#6B7280',
    border: '#EDE9FE',
  },
  senior: {
    primary: '#0EA5E9',
    primaryDark: '#0369A1',
    primaryLight: '#DBEAFE',
    accent: '#14B8A6',
    success: '#15803D',
    successLight: '#DCFCE7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    lavender: '#E0F2FE',
    lavendarDark: '#0C4A6E',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    cardBackground: '#FFFFFF',
    textBody: '#0F172A',
    textMuted: '#475569',
    border: '#CBD5E1',
  },
};

export const ThemeOptions = [
  {
    id: 'classic' as const,
    title: 'Classic Blue',
    description: 'Balanced medical palette for all users.',
    recommendation: 'Best for general use',
  },
  {
    id: 'pediatric' as const,
    title: 'Pediatric Care',
    description: 'Soft greens and blues suited for younger patients.',
    recommendation: 'Recommended for children',
  },
  {
    id: 'wellness' as const,
    title: 'Wellness Mode',
    description: 'A warmer, uplifting palette for women and wellness visits.',
    recommendation: 'Great for every day health checks',
  },
  {
    id: 'senior' as const,
    title: 'Senior Care',
    description: 'Calm contrast and clear readability for mature users.',
    recommendation: 'Recommended for older adults',
  },
];

export default {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  Shadow,
  Components,
  BadgePresets,
};
