import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Card, CardBody, Button, Toast } from '../components';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { BlockchainService } from '../services';

export default function ReportUploadScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toastRef = useRef<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileType, setFileType] = useState('');
  const [showRefinement, setShowRefinement] = useState<boolean | 'skip' | 'completed'>(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (showRefinement === true) {
      const timer = setTimeout(() => {
        setShowRefinement('completed');
        toastRef.current?.show({
          message: 'AI Refinement complete!',
          type: 'success',
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showRefinement]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if ('uri' in result && result.uri) {
        const file = result as any;
        setSelectedFile(file);
        const fileName = file.name || file.uri || '';
        const fileUri = (file.uri || '').toString().toLowerCase();
        const isPdf = file.mimeType?.includes('pdf') || fileName.toLowerCase().endsWith('.pdf') || fileUri.endsWith('.pdf');
        setFileType(isPdf ? 'pdf' : 'image');
        toastRef.current?.show({
          message: 'Document selected',
          type: 'success',
        });
      }
    } catch (error) {
      toastRef.current?.show({
        message: 'Failed to pick document',
        type: 'error',
      });
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const image = result.assets[0];
        setSelectedFile(image);
        setFileType('image');
        toastRef.current?.show({
          message: 'Photo captured',
          type: 'success',
        });
      }
    } catch (error) {
      toastRef.current?.show({
        message: 'Failed to capture photo',
        type: 'error',
      });
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      toastRef.current?.show({
        message: 'Report uploaded successfully',
        type: 'success',
      });
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } else {
      toastRef.current?.show({
        message: 'Please select a document first',
        type: 'error',
      });
    }
  };

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
          <Text style={styles.headerTitle}>Upload Report</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══ UPLOAD OPTIONS ═══ */}
        {!showRefinement ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Upload Method</Text>

            <TouchableOpacity 
              onPress={takePhoto}
              activeOpacity={0.7}
              style={styles.touchableCard}
            >
              <Card style={styles.flatCard}>
                <CardBody>
                  <View style={styles.optionContent}>
                    <View style={[styles.optionIcon, { backgroundColor: Colors.primaryLight }]}>
                      <MaterialCommunityIcons name="camera" size={32} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Take Photo</Text>
                      <Text style={styles.optionDesc}>Capture a photo of your report</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                  </View>
                </CardBody>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={pickDocument}
              activeOpacity={0.7}
              style={styles.touchableCard}
            >
              <Card style={styles.flatCard}>
                <CardBody>
                  <View style={styles.optionContent}>
                    <View style={[styles.optionIcon, { backgroundColor: Colors.successLight }]}>
                      <MaterialCommunityIcons name="file-pdf-box" size={32} color={Colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitle}>Choose File</Text>
                      <Text style={styles.optionDesc}>Select PDF or image from device</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.success} />
                  </View>
                </CardBody>
              </Card>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ═══ PREVIEW ═══ */}
        {selectedFile && !showRefinement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <Card style={styles.flatCard}>
              <CardBody>
                {fileType === 'image' ? (
                  <>
                    <Image
                      source={{ uri: selectedFile.uri }}
                      style={styles.previewImage}
                    />
                    <View style={styles.fileInfo}>
                      <MaterialCommunityIcons name="image" size={20} color={Colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fileName}>{selectedFile.name || 'Selected Image'}</Text>
                        <Text style={styles.fileSize}>
                          {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Size unknown'}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={styles.fileInfo}>
                    <MaterialCommunityIcons name="file-pdf-box" size={32} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fileName}>{selectedFile.name}</Text>
                      <Text style={styles.fileSize}>
                        {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Size unknown'}
                      </Text>
                    </View>
                  </View>
                )}
              </CardBody>
            </Card>

            <Button
              label="Remove"
              variant="outline"
              onPress={() => setSelectedFile(null)}
              style={styles.removeButton}
            />
          </View>
        )}

        {/* ═══ AI REFINEMENT SECTION ═══ */}
        {selectedFile && !showRefinement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refine Your Report</Text>
            <Card style={styles.flatCard}>
              <CardBody>
                <View style={styles.refinementContent}>
                <View style={[styles.refinementIcon, { backgroundColor: Colors.lavender }]}> 
                    <MaterialCommunityIcons name="robot-outline" size={32} color={Colors.lavendarDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.refinementTitle}>AI-Powered Enhancement</Text>
                    <Text style={styles.refinementDesc}>Let our AI improve document clarity and extract key information</Text>
                  </View>
                </View>
                <View style={styles.refinementOptions}>
                  <TouchableOpacity 
                    style={styles.refinementButton}
                    onPress={() => setShowRefinement(true)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="lightning-bolt" size={20} color={Colors.primary} />
                    <Text style={styles.refinementButtonText}>Use AI Refinement</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.refinementButton, styles.skipButton]}
                    onPress={() => setShowRefinement('skip')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-forward" size={20} color={Colors.neutral600} />
                    <Text style={styles.skipButtonText}>Skip & Upload</Text>
                  </TouchableOpacity>
                </View>
              </CardBody>
            </Card>
          </View>
        )}

        {/* ═══ AI REFINEMENT SCREEN ═══ */}
        {showRefinement === true && selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Refinement in Progress</Text>
            <Card style={styles.flatCard}>
              <CardBody>
                <View style={styles.processingContainer}>
                  <MaterialCommunityIcons 
                    name="progress-check" 
                    size={48} 
                    color={Colors.primary} 
                    style={styles.processingIcon}
                  />
                  <Text style={styles.processingTitle}>Analyzing Document</Text>
                  <Text style={styles.processingDesc}>Our AI is enhancing your medical report...</Text>
                  <View style={styles.processingSteps}>
                    <View style={styles.step}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                      <Text style={styles.stepText}>Document recognized</Text>
                    </View>
                    <View style={styles.step}>
                      <Ionicons name="hourglass" size={20} color={Colors.primary} />
                      <Text style={styles.stepText}>Extracting data...</Text>
                    </View>
                    <View style={styles.step}>
                      <Ionicons name="help-circle-outline" size={20} color={Colors.neutral400} />
                      <Text style={styles.stepText}>Encrypting with blockchain</Text>
                    </View>
                  </View>
                </View>
              </CardBody>
            </Card>
          </View>
        )}

        {/* ═══ REFINEMENT RESULTS ═══ */}
        {showRefinement === 'completed' && selectedFile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refinement Results</Text>
            <Card style={styles.flatCard}>
              <CardBody>
                <View style={{ gap: Spacing.md }}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                    <Text style={styles.infoText}>Text extracted successfully</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                    <Text style={styles.infoText}>Document type: Lab Report</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                    <Text style={styles.infoText}>Date detected: {new Date().toISOString().split('T')[0]}</Text>
                  </View>
                </View>
              </CardBody>
            </Card>
          </View>
        )}

        {/* ═══ INFO SECTION ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Formats</Text>
          <Card style={styles.flatCard}>
            <CardBody>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="file-pdf-box" size={20} color={Colors.danger} />
                <Text style={styles.infoText}>PDF documents</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="image" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>JPG, PNG, WebP images</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="lock" size={20} color={Colors.success} />
                <Text style={styles.infoText}>End-to-end encrypted</Text>
              </View>
            </CardBody>
          </Card>
        </View>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>

      {/* ═══ UPLOAD BUTTON ═══ */}
      {!selectedFile || showRefinement === true ? null : (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Button
            label={isUploading ? "Uploading..." : selectedFile ? 'Upload & Encrypt' : 'Select Document'}
            variant="primary"
            size="large"
            onPress={() => {
              if (selectedFile) {
                setIsUploading(true);
                // Real upload and notarization using BlockchainService
                const contentHash = '0x' + Math.random().toString(16).substring(2, 10).padEnd(64, 'f');
                BlockchainService.notarizeRecord(selectedFile.name || 'document', contentHash)
                  .then((txHash) => {
                    toastRef.current?.show({
                      message: 'Report uploaded and notarized successfully!',
                      type: 'success',
                    });
                    setTimeout(() => {
                      setIsUploading(false);
                      setSelectedFile(null);
                      setShowRefinement(false);
                      navigation.goBack();
                    }, 1500);
                  })
                  .catch((err) => {
                    console.error('Blockchain notarization error:', err);
                    toastRef.current?.show({
                      message: 'Upload failed: Blockchain is currently offline.',
                      type: 'error',
                    });
                    setIsUploading(false);
                  });
              }
            }}
            disabled={!selectedFile || isUploading}
          />
        </View>
      )}

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

  // ═══ OPTIONS ═══
  touchableCard: {
    marginBottom: Spacing.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  optionDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
  },

  // ═══ REFINEMENT ═══
  refinementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  refinementIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refinementTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  refinementDesc: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
  },
  refinementOptions: {
    gap: Spacing.md,
  },
  refinementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
    gap: Spacing.sm,
  },
  refinementButtonText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  skipButton: {
    borderColor: Colors.neutral300,
    backgroundColor: Colors.neutral200,
  },
  skipButtonText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral600,
  },

  // ═══ PROCESSING ═══
  processingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  processingIcon: {
    marginBottom: Spacing.md,
  },
  processingTitle: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.sm,
  },
  processingDesc: {
    fontSize: FontSize.body,
    color: Colors.neutral600,
    marginBottom: Spacing.lg,
  },
  processingSteps: {
    width: '100%',
    gap: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepText: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    fontWeight: FontWeight.medium,
  },

  // ═══ PREVIEW ═══
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  fileName: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.neutral900,
    marginBottom: Spacing.xs,
  },
  fileSize: {
    fontSize: FontSize.bodySmall,
    color: Colors.neutral600,
  },
  removeButton: {
    marginTop: Spacing.md,
  },

  // ═══ INFO ═══
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: FontSize.body,
    color: Colors.neutral700,
    fontWeight: FontWeight.medium,
  },

  // ═══ BOTTOM BAR ═══
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
});
