/**
 * app.config.js — replaces app.json
 * Reads environment variables and injects them as Expo constants.
 * Use: GEMINI_API_KEY=xxx npx expo start
 */
module.exports = {
  expo: {
    name: 'MediChain SL',
    slug: 'medichain-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon1.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon-clean.png',
      resizeMode: 'contain',
      backgroundColor: '#000728',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.medichain.patient',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000728',
      },
      package: 'com.medichain.patient',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-image-picker',
        {
          photosPermission: 'MediChain needs access to your photos to upload medical reports.',
          cameraPermission: 'MediChain needs camera access to capture medical documents.',
        },
      ],
    ],
    extra: {
      // Injected at build time from environment variables
      geminiApiKey: process.env.GEMINI_API_KEY ?? '',
      hyperledgerGatewayUrl: process.env.HYPERLEDGER_GATEWAY_URL ?? 'http://localhost:3001',
      apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000/api',
    },
  },
};
