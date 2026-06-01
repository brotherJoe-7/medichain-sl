import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, TextInput, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

const FAQS = [
  {
    id: '1',
    category: 'Account & Profile',
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Visit the Login screen and tap "Create Account". Fill in your details, verify your email, and you\'re ready to go!',
      },
      {
        question: 'How do I reset my password?',
        answer: 'On the login screen, tap "Forgot Password", enter your email, and follow the reset link sent to your inbox.',
      },
      {
        question: 'How do I update my profile information?',
        answer: 'Go to Profile > Edit Profile, make your changes, and tap Save. Changes are saved immediately.',
      },
    ],
  },
  {
    id: '2',
    category: 'Medical Records',
    items: [
      {
        question: 'How do I upload medical records?',
        answer: 'Navigate to Records > Upload, select a file or take a photo, and confirm. Records are encrypted end-to-end.',
      },
      {
        question: 'Who can access my records?',
        answer: 'Only you and healthcare providers you authorize can access your records. You control all permissions.',
      },
      {
        question: 'Can I share records with doctors?',
        answer: 'Yes! Use the Share feature in Records to grant temporary access to specific healthcare providers.',
      },
    ],
  },
  {
    id: '3',
    category: 'Appointments',
    items: [
      {
        question: 'How do I book an appointment?',
        answer: 'Go to Explore Doctors, find a doctor you like, and tap "Book Appointment". Select your preferred time slot.',
      },
      {
        question: 'How do I reschedule an appointment?',
        answer: 'In Appointments, find your appointment, tap "Reschedule", and select a new date and time.',
      },
      {
        question: 'Can I cancel an appointment?',
        answer: 'Yes, you can cancel up to 24 hours before the appointment. Go to Appointments > [Your Appointment] > Cancel.',
      },
    ],
  },
  {
    id: '4',
    category: 'Security & Privacy',
    items: [
      {
        question: 'Is my data secure?',
        answer: 'Yes! We use end-to-end encryption, secure servers, and comply with HIPAA and GDPR standards.',
      },
      {
        question: 'How do I enable two-factor authentication?',
        answer: 'Go to Settings > Security > Two-Factor Authentication and follow the setup instructions.',
      },
      {
        question: 'What happens to my data if I delete my account?',
        answer: 'Your account and all associated data will be permanently deleted within 30 days of deletion.',
      },
    ],
  },
];

const FAQItem = ({ question, answer, isExpanded, onPress }: any) => {
  const heightAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ marginBottom: Spacing.md }}
    >
      <View style={styles.faqItemHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Animated.View
          style={[
            styles.chevron,
            {
              transform: [
                {
                  rotate: heightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="chevron-down" size={20} color={Colors.primary} />
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.faqItemContent,
          {
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300],
            }),
            opacity: heightAnim,
          },
        ]}
      >
        <Text style={styles.faqAnswer}>{answer}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function HelpCenterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQS.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

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
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ SEARCH ═══ */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.neutral500} />
            <TextInput
              placeholder="Search help topics..."
              placeholderTextColor={Colors.neutral500}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ═══ QUICK LINKS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.quickLinkItem}>
                <View style={[styles.quickLinkIcon, { backgroundColor: Colors.primaryLight }]}> 
                  <MaterialCommunityIcons name="message-question" size={24} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickLinkTitle}>Contact Support</Text>
                  <Text style={styles.quickLinkDesc}>Get help from our support team</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.quickLinkItem}>
                <View style={[styles.quickLinkIcon, { backgroundColor: Colors.successLight }]}> 
                  <MaterialCommunityIcons name="file-document" size={24} color={Colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickLinkTitle}>Privacy Policy</Text>
                  <Text style={styles.quickLinkDesc}>Learn about your data privacy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>

          <Card style={styles.flatCard}>
            <CardBody>
              <TouchableOpacity style={styles.quickLinkItem}>
                <View style={[styles.quickLinkIcon, { backgroundColor: Colors.warningLight }]}> 
                  <MaterialCommunityIcons name="shield-account" size={24} color={Colors.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickLinkTitle}>Terms of Service</Text>
                  <Text style={styles.quickLinkDesc}>Review our terms and conditions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral400} />
              </TouchableOpacity>
            </CardBody>
          </Card>
        </View>

        {/* ═══ FAQs ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={64}
                color={Colors.neutral300}
              />
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query
              </Text>
            </View>
          ) : (
            filteredFaqs.map((category) => (
              <View key={category.id} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category.category}</Text>
                <Card style={styles.flatCard}>
                  <CardBody>
                    {category.items.map((item, index) => (
                      <View key={index}>
                        <FAQItem
                          question={item.question}
                          answer={item.answer}
                          isExpanded={expandedItems.includes(`${category.id}-${index}`)}
                          onPress={() => toggleExpand(`${category.id}-${index}`)}
                        />
                        {index < category.items.length - 1 && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    ))}
                  </CardBody>
                </Card>
              </View>
            ))
          )}
        </View>

        {/* ═══ CONTACT SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Still Need Help?</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              <Text style={styles.contactTitle}>Contact Our Support Team</Text>
              <Text style={styles.contactDesc}>
                We're here to help! Reach out to us via email or phone.
              </Text>
              <TouchableOpacity style={styles.contactItem}>
                <MaterialCommunityIcons name="email" size={20} color={Colors.primary} />
                <Text style={styles.contactValue}>support@medichain.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem}>
                <Ionicons name="call" size={20} color={Colors.primary} />
                <Text style={styles.contactValue}>1-800-MEDICHAIN</Text>
              </TouchableOpacity>
            </CardBody>
          </Card>
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

  // ═══ CARDS ═══
  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },

  // ═══ QUICK LINKS ═══
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  quickLinkIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  quickLinkDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
  },

  // ═══ FAQs ═══
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  faqQuestion: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    flex: 1,
    marginRight: Spacing.md,
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqItemContent: {
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  faqAnswer: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.neutral200,
  },

  // ═══ CONTACT SECTION ═══
  contactTitle: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  contactDesc: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  contactValue: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
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
