import React, { useRef, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { BlockchainService } from '../services';

export default function DoctorScanScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanLinePosition = useRef(new Animated.Value(0)).current;

  const startScan = () => {
    setIsScanning(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLinePosition, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanLinePosition, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const handleScan = () => {
    toastRef.current?.show({
      message: 'Doctor QR code scanned! Registering on ledger...',
      type: 'success',
    });
    
    // Register doctor access permission on Hyperledger Fabric ledger
    BlockchainService.grantAccess('doctor_smith', 60)
      .then((txHash) => {
        toastRef.current?.show({
          message: 'Access GRANTED and notarized on blockchain!',
          type: 'success',
        });
        setTimeout(() => {
          setIsScanning(false);
          navigation.goBack();
        }, 1500);
      })
      .catch((err) => {
        console.error('Blockchain access grant failed:', err);
        toastRef.current?.show({
          message: 'Ledger update failed. Falling back to local state.',
          type: 'warning',
        });
        setTimeout(() => {
          setIsScanning(false);
          navigation.goBack();
        }, 2000);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ═══ HEADER ═══ */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Doctor ID</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="flashlight" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ═══ SCANNER ═══ */}
      <View style={styles.scannerSection}>
        {isScanning ? (
          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLinePosition.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 280],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <Text style={styles.scanningText}>Scanning...</Text>
            <Button
              label="Scan Complete"
              variant="primary"
              onPress={handleScan}
              style={styles.completeButton}
            />
          </View>
        ) : (
          <View style={styles.readyContainer}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={100}
              color={Colors.neutral300}
            />
            <Text style={styles.readyTitle}>Ready to Scan</Text>
            <Text style={styles.readySubtitle}>
              Position the QR code within the frame
            </Text>
            <Button
              label="Start Scanning"
              variant="primary"
              onPress={startScan}
              style={styles.startButton}
            />
          </View>
        )}
      </View>

      {/* ═══ INFO CARDS ═══ */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How to Scan</Text>

        <Card style={styles.flatCard}>
          <CardBody>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.instructionTitle}>Position QR Code</Text>
                <Text style={styles.instructionDesc}>
                  Hold the doctor's QR code in front of your camera
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.flatCard}>
          <CardBody>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.instructionTitle}>Ensure Good Lighting</Text>
                <Text style={styles.instructionDesc}>
                  Make sure there's enough light to scan the code clearly
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>

        <Card style={styles.flatCard}>
          <CardBody>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.instructionTitle}>Wait for Recognition</Text>
                <Text style={styles.instructionDesc}>
                  The app will automatically detect and verify the QR code
                </Text>
              </View>
            </View>
          </CardBody>
        </Card>
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

  // ═══ SCANNER ═══
  scannerSection: {
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.xl,
  },

  // READY STATE
  readyContainer: {
    alignItems: 'center',
    width: '100%',
  },
  readyTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  readySubtitle: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  startButton: {
    marginTop: Spacing.md,
  },

  // SCANNING STATE
  scannerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 300,
    height: 300,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },

  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },

  scanningText: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.lg,
  },
  completeButton: {
    marginTop: Spacing.lg,
  },

  // ═══ INFO SECTION ═══
  infoSection: {
    paddingHorizontal: Spacing.lg,
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.md,
  },

  flatCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    marginBottom: Spacing.md,
  },

  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  instructionTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  instructionDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
  },
});
