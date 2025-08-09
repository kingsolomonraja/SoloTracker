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
  doc
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

export class FirestoreService {
  private static readonly COLLECTION_NAME = 'checkins';

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

  static async deleteCheckIn(checkInId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, this.COLLECTION_NAME, checkInId));
    } catch (error) {
      console.error('Firestore delete error:', error);
      throw new Error('Failed to delete check-in.');
    }
  }
}
