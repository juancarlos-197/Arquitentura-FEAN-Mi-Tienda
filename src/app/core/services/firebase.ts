import { Injectable, signal } from '@angular/core';
import { FIREBASE_CONFIG } from '../config/firebase.config';

@Injectable({
  providedIn: 'root',
})
export class Firebase {
  readonly config = FIREBASE_CONFIG;
  readonly isConnected = signal<boolean>(true);
  readonly projectId = signal<string>(FIREBASE_CONFIG.projectId);
  readonly syncStatus = signal<'synced' | 'syncing' | 'offline'>('synced');

  simulateNetworkLatency(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 80));
  }

  logAudit(action: string, details: Record<string, unknown>) {
    console.debug(`[Firebase Firestore Audit] ${action}:`, details);
  }
}
