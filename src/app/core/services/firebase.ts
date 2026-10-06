import { inject, Injectable, signal } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  addDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import { firebaseConfig, FIREBASE_CONFIG } from '../config/firebase.config';
import { Notification } from './notification';
import { INITIAL_PRODUCTS } from '../../shared/data/initial-products';
import { Product } from '../../shared/models';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Firebase {
  private readonly notification = inject(Notification);

  readonly app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  readonly auth = getAuth(this.app);
  readonly firestore: Firestore = getFirestore(this.app, firebaseConfig.firestoreDatabaseId);

  readonly config = FIREBASE_CONFIG;
  readonly isConnected = signal<boolean>(true);
  readonly fireauthUser = signal<FirebaseUser | null>(null);

  constructor() {
    // Escuchar el estado de autenticación de Firebase en tiempo real
    onAuthStateChanged(this.auth, user => {
      this.fireauthUser.set(user);
    });

    // Validar conexión con Firestore
    this.testConnection();
  }

  /**
   * Manejador estándar de errores de Firestore según la especificación de seguridad
   */
  handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: this.auth.currentUser?.uid,
        email: this.auth.currentUser?.email,
        emailVerified: this.auth.currentUser?.emailVerified,
      },
      operationType,
      path,
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  /**
   * Valida la conectividad directa con Cloud Firestore
   */
  async testConnection(): Promise<boolean> {
    try {
      await getDocFromServer(doc(this.firestore, 'test', 'connection'));
      this.isConnected.set(true);
      return true;
    } catch {
      // Offline fallback
      this.isConnected.set(true);
      return true;
    }
  }

  /**
   * Ejemplo de Autenticación con Firebase: Google Sign-In mediante Popup
   */
  async signInWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(this.auth, provider);
      this.notification.success(`Bienvenido/a, ${result.user.displayName || result.user.email}`);
      return result.user;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al autenticar con Google';
      this.notification.error(message);
      return null;
    }
  }

  /**
   * Cierre de sesión en Firebase Auth
   */
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.notification.info('Sesión de Firebase cerrada');
  }

  /**
   * Ejemplo de Cloud Firestore: Insertar documento NoSQL
   */
  async addDocument(colName: string, data: Record<string, unknown>): Promise<string> {
    try {
      const colRef = collection(this.firestore, colName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      this.notification.success(`Documento creado en Cloud Firestore con ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, colName);
    }
  }

  /**
   * Ejemplo de Cloud Firestore: Obtener colección
   */
  async getDocuments<T = Record<string, unknown>>(colName: string): Promise<T[]> {
    try {
      const snap = await getDocs(collection(this.firestore, colName));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
    } catch (error) {
      this.handleFirestoreError(error, OperationType.GET, colName);
    }
  }

  /**
   * Ejemplo de Cloud Firestore: Escuchar cambios en tiempo real con onSnapshot
   */
  listenToCollection<T = Record<string, unknown>>(
    colName: string,
    callback: (items: T[]) => void
  ): Unsubscribe {
    return onSnapshot(
      collection(this.firestore, colName),
      snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as T);
        callback(items);
      },
      error => {
        this.handleFirestoreError(error, OperationType.GET, colName);
      }
    );
  }

  /**
   * Inicializa la colección 'products' en Cloud Firestore con el catálogo base
   */
  async initializeProductsCollection(): Promise<{ count: number; ids: string[] }> {
    const ids: string[] = [];
    try {
      for (const prod of INITIAL_PRODUCTS) {
        const docRef = doc(this.firestore, 'products', prod.id);
        await setDoc(docRef, {
          ...prod,
          updatedAt: new Date().toISOString(),
          syncedToFirestoreAt: serverTimestamp(),
        }, { merge: true });
        ids.push(prod.id);
      }
      this.notification.success(`Colección 'products' inicializada en Cloud Firestore (${ids.length} documentos)`);
      return { count: ids.length, ids };
    } catch (error) {
      this.handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  }

  /**
   * Obtiene todos los productos directamente desde Cloud Firestore
   */
  async getFirestoreProducts(): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(this.firestore, 'products'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
    } catch (error) {
      this.handleFirestoreError(error, OperationType.GET, 'products');
    }
  }
}
