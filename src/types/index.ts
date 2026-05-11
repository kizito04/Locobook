import { Timestamp } from 'firebase/firestore';
import { ParsedTransaction } from '../services/geminiService';

export interface Transaction extends ParsedTransaction {
  id: string;
  date: Timestamp;
  userId: string;
  businessId?: string | null;
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Timestamp;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export type ViewType = 'dashboard' | 'history' | 'analytics' | 'settings' | 'editTransaction' | 'businessRegistration' | 'businessHub';
