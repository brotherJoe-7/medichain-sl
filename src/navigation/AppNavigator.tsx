import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RecordsScreen from '../screens/RecordsScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExploreDoctorsScreen from '../screens/ExploreDoctorsScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import DoctorProfileScreen from '../screens/DoctorProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import LoginScreen from '../screens/LoginScreen';
import SecurityScreen from '../screens/SecurityScreen';
import ReportUploadScreen from '../screens/ReportUploadScreen';
import DoctorScanScreen from '../screens/DoctorScanScreen';
import AllergiesScreen from '../screens/AllergiesScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import DataPrivacyScreen from '../screens/DataPrivacyScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { useStore } from '../store/useStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Records') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar-check' : 'calendar-blank-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25, // Increased bottom margin to prevent collision with OS nav bar/home indicator
          left: Spacing.lg,
          right: Spacing.lg,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          borderRadius: Radius.xl,
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // Auth-gated navigation: always starts at Login if not authenticated
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth screens
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // App screens — only accessible when authenticated
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ExploreDoctors" component={ExploreDoctorsScreen} />
            <Stack.Screen name="Medications" component={MedicationsScreen} />
            <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="ReportUpload" component={ReportUploadScreen} />
            <Stack.Screen name="DoctorScan" component={DoctorScanScreen} />
            <Stack.Screen name="Allergies" component={AllergiesScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="DataPrivacy" component={DataPrivacyScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

