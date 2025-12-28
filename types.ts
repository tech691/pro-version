
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ASSOCIATE = 'ASSOCIATE',
  CUSTOMER = 'CUSTOMER' // Now represents a "Family Account"
}

export enum AssetType {
  STOCKS = 'Stocks',
  FIXED_DEPOSITS = 'Fixed Deposits',
  MUTUAL_FUNDS = 'Mutual Funds',
  BONDS = 'Bonds',
  PPF = 'PPF',
  LIFE_INSURANCE = 'Life Insurance',
  TERM_INSURANCE = 'Term Insurance'
}

export type ActionType = 'VIEW' | 'EDIT' | 'DELETE' | 'MANAGE_PERMISSIONS' | 'IMPERSONATE' | 'VIEW_LOGS';

export interface Permission {
  id: string;
  userId: string;       // Actor ID
  targetId: string;     // Family Account ID or System Resource
  actions: ActionType[];
}

export interface User {
  id: string;
  name: string; // Family Name (e.g., "Isabella Family")
  role: UserRole;
  email: string;
  assignedTo?: string; // Associate ID
}

export interface FamilyMember {
  id: string;
  familyId: string; // Links to User.id (CUSTOMER)
  name: string;
  relationship: string;
}

export interface Asset {
  id: string;
  familyId: string;
  memberId: string; // ID of the specific family member
  type: AssetType;
  value: number;
  details: Record<string, any>;
  lastUpdated: string;
}

export interface Document {
  id: string;
  familyId: string;
  memberId: string;
  category: AssetType | 'ID_PROOF' | 'TAX_FORMS';
  fileName: string;
  fileSize: string;
  uploadDate: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actingAsId?: string; // ID of the family account being impersonated
  targetId?: string;
  action: string;
  details: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface AuthState {
  currentUser: User | null;
  actingUser: User | null;
  isImpersonating: boolean;
}
