
import { User, UserRole, Asset, Document, AuditLog, AssetType, Permission, ActionType, FamilyMember } from './types';

// Users are now Admins, Associates, or "Family Accounts"
export const users: User[] = [
  { id: 'a', name: 'Alice', role: UserRole.SUPER_ADMIN, email: 'alice@wealthguard.com' },
  { id: 'b', name: 'Bob', role: UserRole.ADMIN, email: 'bob@wealthguard.com' },
  { id: 'c', name: 'Charlie', role: UserRole.ADMIN, email: 'charlie@wealthguard.com' },
  { id: 'd', name: 'David', role: UserRole.ASSOCIATE, email: 'david@wealthguard.com' },
  { id: 'e', name: 'Eve', role: UserRole.ASSOCIATE, email: 'eve@wealthguard.com' },
  // Customer Families
  { id: 'f_acc', name: 'Frank Family', role: UserRole.CUSTOMER, email: 'frank@client.com', assignedTo: 'd' },
  { id: 'g_acc', name: 'Grace Family', role: UserRole.CUSTOMER, email: 'grace@client.com', assignedTo: 'd' },
  { id: 'h_acc', name: 'Henry Family', role: UserRole.CUSTOMER, email: 'henry@client.com', assignedTo: 'e' },
  { id: 'i_acc', name: 'Isabella Family', role: UserRole.CUSTOMER, email: 'isabella@client.com', assignedTo: 'e' },
  { id: 'j_acc', name: 'Jack Family', role: UserRole.CUSTOMER, email: 'jack@client.com', assignedTo: 'e' },
];

export let familyMembers: FamilyMember[] = [
  // Isabella's Family
  { id: 'i_1', familyId: 'i_acc', name: 'Isabella', relationship: 'Primary' },
  { id: 'w', familyId: 'i_acc', name: 'William', relationship: 'Spouse' },
  { id: 'x', familyId: 'i_acc', name: 'Xavier', relationship: 'Child' },
  { id: 'y', familyId: 'i_acc', name: 'Yara', relationship: 'Child' },
  { id: 'z', familyId: 'i_acc', name: 'Zoe', relationship: 'Parent' },
  // Frank's Family (Single)
  { id: 'f_1', familyId: 'f_acc', name: 'Frank', relationship: 'Primary' },
];

let permissions: Permission[] = [];

// Initialize default permissions based on hierarchy
users.forEach(user => {
  if (user.role === UserRole.SUPER_ADMIN) {
    users.forEach(target => {
      if (user.id !== target.id) {
        permissions.push({
          id: `p-${user.id}-${target.id}`,
          userId: user.id,
          targetId: target.id,
          actions: ['VIEW', 'EDIT', 'DELETE', 'MANAGE_PERMISSIONS', 'IMPERSONATE', 'VIEW_LOGS']
        });
      }
    });
  } else if (user.role === UserRole.ADMIN) {
    users.forEach(target => {
      if (target.role === UserRole.ASSOCIATE || target.role === UserRole.CUSTOMER) {
        permissions.push({
          id: `p-${user.id}-${target.id}`,
          userId: user.id,
          targetId: target.id,
          actions: ['VIEW', 'EDIT', 'IMPERSONATE']
        });
      }
    });
  } else if (user.role === UserRole.ASSOCIATE) {
    users.filter(u => u.assignedTo === user.id).forEach(target => {
      permissions.push({
        id: `p-${user.id}-${target.id}`,
        userId: user.id,
        targetId: target.id,
        actions: ['VIEW', 'IMPERSONATE']
      });
    });
  }
});

let assets: Asset[] = [
  { id: '1', familyId: 'f_acc', memberId: 'f_1', type: AssetType.STOCKS, value: 50000, details: { symbol: 'AAPL', quantity: 100 }, lastUpdated: '2024-03-20' },
  { id: '2', familyId: 'i_acc', memberId: 'i_1', type: AssetType.MUTUAL_FUNDS, value: 120000, details: { fund: 'Blue Chip Fund', units: 500 }, lastUpdated: '2024-03-21' },
  { id: '3', familyId: 'i_acc', memberId: 'w', type: AssetType.BONDS, value: 45000, details: { issuer: 'US Gov', rate: '4.5%' }, lastUpdated: '2024-03-22' },
];

let documents: Document[] = [
  { id: 'd1', familyId: 'i_acc', memberId: 'i_1', category: AssetType.MUTUAL_FUNDS, fileName: 'statement_march.pdf', fileSize: '1.2MB', uploadDate: '2024-03-20' },
];

let auditLogs: AuditLog[] = [];

export const getAssets = () => [...assets];
export const addAsset = (asset: Asset) => { assets.push(asset); };
export const deleteAsset = (id: string) => { assets = assets.filter(a => a.id !== id); };

export const getDocuments = () => [...documents];
export const addDocument = (doc: Document) => { documents.push(doc); };

export const getFamilyMembers = (familyId?: string) => familyId ? familyMembers.filter(m => m.familyId === familyId) : [...familyMembers];
export const addFamilyMember = (member: FamilyMember) => { familyMembers.push(member); };
export const deleteFamilyMember = (id: string) => { familyMembers = familyMembers.filter(m => m.id !== id); };

export const getAuditLogs = () => [...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
export const addAuditLog = (log: Omit<AuditLog, 'id'>) => {
  const newLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
  auditLogs.push(newLog);
};

export const getPermissions = () => [...permissions];
export const updatePermission = (userId: string, targetId: string, actions: ActionType[]) => {
  const idx = permissions.findIndex(p => p.userId === userId && p.targetId === targetId);
  if (idx > -1) {
    permissions[idx].actions = actions;
  } else {
    permissions.push({ id: `p-${userId}-${targetId}`, userId, targetId, actions });
  }
};
