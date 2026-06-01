const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude problematic nested node_modules directories and optional native modules
config.resolver.blockList = [
  ...config.resolver.blockList || [],
  /backend\/api\/node_modules\/.*/,
  /node_modules\/pkcs11js\/src\/.*/,
  /node_modules\/react-native-nfc-manager\/src\/NfcTech\/.*Android\.js$/,
];

module.exports = config;
