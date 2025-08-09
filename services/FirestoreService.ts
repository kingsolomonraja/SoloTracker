// services/FirestoreService.ts

import { firestore, FieldValue } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

export interface CheckInData {
  userId: string;
  email?: string;
  timestamp?: Date;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CheckInRecord extends CheckInData {
  id: string;
}

export interface UserProfile {
  name: string;
  email?: string;
}

export class FirestoreService {
  private static readonly COLLECTION_NAME = 'checkins';

  // ✅ Save Check-in
  static async saveCheckIn(checkInData: CheckInData): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, this.COLLECTION_NAME), {
        ...checkInData,
        timestamp: FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Firestore save error:', error);
      throw new Error('Failed to save check-in.');
    }
  }

  // ✅ Get Check-in History
  static async getCheckIns(userId: string): Promise<CheckInRecord[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as CheckInData),
        timestamp: docSnap.data().timestamp?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error('Firestore fetch error:', error);
      throw new Error('Failed to load check-in history.');
    }
  }

  // ✅ Delete Check-in
  static async deleteCheckIn(checkInId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, this.COLLECTION_NAME, checkInId));
    } catch (error) {
      console.error('Firestore delete error:', error);
      throw new Error('Failed to delete check-in.');
    }
  }

  // ✅ Save or Update User Profile
  static async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(firestore, 'users', userId), profile, { merge: true });
    } catch (error) {
      console.error('Firestore user profile save error:', error);
      throw new Error('Failed to save user profile.');
    }
  }

  // ✅ Get User Profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(firestore, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Firestore get profile error:', error);
      throw new Error('Failed to load user profile.');
    }
  }
}
