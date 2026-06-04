import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
// @ts-ignore - optional native module
let BarCodeScanner: any = null;
try {
  const BarCodeScannerModule = require('expo-barcode-scanner');
  BarCodeScanner = BarCodeScannerModule?.BarCodeScanner ?? null;
} catch (e) {
  console.warn('[Scanner] Failed to load native BarCodeScanner:', e);
}
import { useNfc } from '../hooks/useNfc';
import { Card, CardBody, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { verifyQrToken } from '../services/api';
import { DoctorAuthService } from '../services/doctorAuthService';

export default function DoctorScanScreen() {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const nfc = useNfc();
  const [isScanning, setIsScanning] = useState(false);
  const [isReadingNfc, setIsReadingNfc] = useState(false);
  const [doctorToken, setDoctorToken] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string>('doctor_smith');
  const [loginNeeded, setLoginNeeded] = useState(false);
  const scanLinePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadDoctorAuth = async () => {
      const token = await DoctorAuthService.getToken();
      const id = await DoctorAuthService.getDoctorId();
      setDoctorToken(token);
      if (id) setDoctorId(id);
      setLoginNeeded(!token);
    };
    loadDoctorAuth();
  }, []);

  const handleVerification = async (token: string) => {
    try {
      const res = await verifyQrToken(token, doctorId);
      if (res && res.success) {
        toastRef.current?.show({ message: 'Access granted — payload received', type: 'success' });
        setTimeout(() => navigation.goBack(), 1200);
      } else {
        toastRef.current?.show({ message: 'Verification failed', type: 'danger' });
      }
    } catch (e) {
      toastRef.current?.show({ message: 'Scan verification error', type: 'danger' });
    } finally {
      setIsScanning(false);
      setIsReadingNfc(false);
    }
  };

  const startScan = async () => {
    if (!doctorToken) {
      setLoginNeeded(true);
      toastRef.current?.show({ message: 'Doctor login required for QR verification', type: 'warning' });
      return;
    }

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

    if (nfc.available) {
      setIsReadingNfc(true);
      try {
        const token = await nfc.readToken(15000);
        if (token) {
          await handleVerification(token);
          return;
        }
        toastRef.current?.show({ message: 'No NFC token found, switching to camera fallback', type: 'info' });
      } catch (err) {
        console.warn('NFC read failed:', err);
        toastRef.current?.show({ message: 'NFC read failed, using camera fallback', type: 'warning' });
      } finally {
        setIsReadingNfc(false);
      }
    }
  };

  const handleScan = () => {
    toastRef.current?.show({ message: 'Processing scanned token...', type: 'info' });
  };

  const onBarCodeScanned = async ({ data }: { data: string }) => {
    setIsScanning(false);
    await handleVerification(data);
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
        {loginNeeded ? (
          <View style={[styles.readyContainer, styles.loginPromptContainer]}>
            <MaterialCommunityIcons
              name="shield-lock"
              size={80}
              color={Colors.primary}
            />
            <Text style={styles.readyTitle}>Doctor Login Required</Text>
            <Text style={styles.readySubtitle}>
              Authenticate as a verified doctor before scanning patient NFC/QR tokens.
            </Text>
            <Button
              label="Doctor Login"
              variant="primary"
              onPress={() => navigation.navigate('DoctorLogin')}
              style={styles.startButton}
            />
          </View>
        ) : isScanning ? (
          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              {BarCodeScanner ? (
                <BarCodeScanner
                  onBarCodeScanned={onBarCodeScanned}
                  style={{ width: 300, height: 300 }}
                />
              ) : (
                <View style={styles.webScannerContainer}>
                  <MaterialCommunityIcons name="camera-off" size={48} color={Colors.neutral400} />
                  <Text style={styles.webScannerText}>Camera view is simulated on Web</Text>
                  
                  <TouchableOpacity
                    style={styles.simulateScanBtn}
                    onPress={() => onBarCodeScanned({ data: 'pat_001_mock_session_token' })}
                  >
                    <Text style={styles.simulateScanBtnText}>Simulate Successful Scan</Text>
                  </TouchableOpacity>
                </View>
              )}
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
            <Text style={styles.scanningText}>{isReadingNfc ? 'Reading NFC tag…' : 'Scanning...'}</Text>
            <Button
              label={isReadingNfc ? 'Reading NFC' : 'Cancel Scan'}
              variant="primary"
              onPress={() => setIsScanning(false)}
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
              Position the QR code within the frame or tap to read NFC.
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
  loginPromptContainer: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral200,
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
  webScannerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  webScannerText: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  simulateScanBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  simulateScanBtnText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.bodySmall,
  },
});
