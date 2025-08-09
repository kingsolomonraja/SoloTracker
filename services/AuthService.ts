// services/AuthService.ts
import { auth } from './firebase';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export class AuthService {
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  static async signInWithGoogle(): Promise<User> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'studentpunch',
      native: 'studentpunch://redirect',
    });

    const clientId = Platform.select({
      android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
      ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      default: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const request = new AuthSession.AuthRequest({
      clientId: clientId!,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
      extraParams: { prompt: 'select_account' },
      codeChallenge: undefined,
      codeChallengeMethod: undefined,
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== 'success' || !result.params.id_token) {
      throw new Error('Google Sign-In was cancelled or failed.');
    }

    const credential = GoogleAuthProvider.credential(result.params.id_token);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw new Error(this.getGoogleSignInErrorMessage(error.code));
  }
}


  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  private static getGoogleSignInErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'SIGN_IN_CANCELLED':
        return 'Sign in was cancelled.';
      case 'IN_PROGRESS':
        return 'Sign in is already in progress.';
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        return 'Google Play Services not available.';
      default:
        return 'Google Sign-In failed. Please try again.';
    }
  }
}
