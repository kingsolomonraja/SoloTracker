# Student Check-In App

A React Native mobile app built with Expo for student attendance tracking with biometric verification and GPS location logging.

## Features

- **Multiple Authentication Options**: 
  - Email/Password authentication
  - Google Sign-In integration
- **Biometric Security**: FaceID/Fingerprint authentication using expo-local-authentication
- **GPS Location Tracking**: Precise location capture using expo-location
- **Firebase Firestore**: Cloud storage for check-in records
- **Clean UI**: Minimalist black and white design
- **Tab Navigation**: Intuitive user interface with multiple screens

## Tech Stack

- React Native with Expo (Managed Workflow)
- TypeScript
- Firebase (Auth + Firestore)
- Google Sign-In
- expo-local-authentication
- expo-location
- react-native-paper
- Lucide React Native (Icons)

## Setup Instructions

### 1. Firebase Configuration

✅ **Firebase configuration is already set up** with your project details:
- Project ID: `studentpunchapp`
- App ID: `1:1097095993421:android:e9b9b4bf38330e5e5ee404`
- Package Name: `com.yourcompany.studentpunch`

**Next steps to complete Firebase setup:**
1. Go to [Firebase Console](https://console.firebase.google.com) → studentpunchapp project
2. Enable **Authentication** with:
   - Email/Password provider
   - Google Sign-In provider
3. For Google Sign-In, you'll need to:
   - Add your app's SHA-1 fingerprint (for Android)
   - Download the updated `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Update the `webClientId` in `services/AuthService.ts` with your actual Web Client ID from Firebase Console
4. Create a **Firestore database** in production mode
5. Add the security rules provided below

### 2. Google Sign-In Setup

**Important:** You need to configure Google Sign-In properly:

1. **Get your Web Client ID:**
   - Go to Firebase Console → Authentication → Sign-in method → Google
   - Copy the Web Client ID
   - Replace `YOUR_WEB_CLIENT_ID` in `services/AuthService.ts` with this value

2. **For Android builds:**
   - Generate SHA-1 fingerprint: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - Add this SHA-1 to Firebase Console → Project Settings → Your Android App

3. **For iOS builds:**
   - Download `GoogleService-Info.plist` from Firebase Console
   - Add it to your iOS project when building

### 3. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checkins/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test the app using Expo Go on your mobile device or iOS/Android simulator

**Note:** Google Sign-In requires a development build and won't work in Expo Go. You'll need to create a development build for testing.

### 5. Building for Production

For production builds, you'll need to create development builds with Expo Dev Client since this app uses native modules:

```bash
expo install expo-dev-client
expo run:ios
expo run:android
```

## App Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation
│   ├── index.tsx            # Punch-in screen
│   ├── history.tsx          # Check-in history
│   └── profile.tsx          # User profile
├── _layout.tsx              # Root layout
├── login.tsx                # Login screen
├── biometric.tsx            # Biometric authentication
└── +not-found.tsx           # 404 screen

contexts/
└── AuthContext.tsx          # Authentication context

services/
├── firebase.ts              # Firebase configuration
├── AuthService.ts           # Authentication service
├── LocationService.ts       # Location handling
└── FirestoreService.ts      # Database operations

components/
└── LoadingSpinner.tsx       # Reusable loading component
```

## Usage

1. **Login**: Choose between:
   - Email and password authentication
   - Google Sign-In (one-tap authentication)
2. **Biometric Auth**: Complete biometric verification (optional)
3. **Check-In**: Tap "Punch In" to record attendance with location
4. **History**: View previous check-ins with timestamps and coordinates
5. **Profile**: Manage account and sign out

## Security Features

- Firebase Authentication with multiple providers (Email/Password, Google)
- Biometric authentication for device-level security
- Firestore security rules to protect user data
- Location permissions requested at runtime
- Encrypted data transmission

## Permissions Required

- **Location**: To capture GPS coordinates during check-in
- **Biometric**: To enable fingerprint/FaceID authentication
- **Internet**: To communicate with Firebase services

## Notes

- Google Sign-In requires a development build (won't work in Expo Go)
- Location tracking is only used during active check-in (no background tracking)
- All user data is stored securely in Firebase Firestore
- Biometric authentication can be skipped if not supported/enrolled
- The app works offline for UI navigation but requires internet for data sync

## Support

For issues related to:
- Firebase setup: Check the Firebase Console and configuration
- Google Sign-In: Ensure proper SHA-1 fingerprint setup and Web Client ID configuration
- Location services: Ensure location permissions are granted
- Biometric auth: Verify device support and enrollment
- Build issues: Refer to Expo documentation for native module setup