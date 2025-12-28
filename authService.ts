
import { users, addAuditLog, getPermissions } from './db';
import { User, UserRole, ActionType, Permission } from './types';

class AuthService {
  static getRoleLevel(role: UserRole): number {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 4;
      case UserRole.ADMIN: return 3;
      case UserRole.ASSOCIATE: return 2;
      case UserRole.CUSTOMER: return 1;
      default: return 0;
    }
  }

  static login(id: string): User | null {
    const user = users.find(u => u.id === id);
    if (user) {
      addAuditLog({
        actorId: user.id,
        action: 'LOGIN',
        details: `${user.name} logged into the system`,
        timestamp: new Date().toISOString(),
        severity: 'INFO'
      });
      return user;
    }
    return null;
  }

  static hasPermission(actor: User, targetId: string, action: ActionType): boolean {
    if (actor.id === targetId) return true; // Self-access
    
    // Check specific permission records
    const perms = getPermissions();
    const permission = perms.find(p => p.userId === actor.id && p.targetId === targetId);
    
    if (permission?.actions.includes(action)) return true;

    return false;
  }

  /**
   * Evaluates if the actor is authorized to manage the target's permissions
   * based on strict role hierarchy and MANAGE_PERMISSIONS grant.
   */
  static canManagePermissions(actor: User, target: User): boolean {
    const actorRank = this.getRoleLevel(actor.role);
    const targetRank = this.getRoleLevel(target.role);

    // Explicitly deny managing higher or same-level users (except Super Admin managing other Super Admins)
    const isSuperAdmin = actor.role === UserRole.SUPER_ADMIN;
    const isHigherRank = actorRank > targetRank;
    const canManageSameRankSuper = isSuperAdmin && target.role === UserRole.SUPER_ADMIN && actor.id !== target.id;

    if (!isHigherRank && !canManageSameRankSuper) return false;

    // Must also have the explicit permission grant on that target
    return this.hasPermission(actor, target.id, 'MANAGE_PERMISSIONS');
  }

  static getVisibleUsers(actor: User): User[] {
    if (actor.role === UserRole.SUPER_ADMIN) {
        return users.filter(u => u.id !== actor.id);
    }

    const perms = getPermissions();
    const allowedTargetIds = perms
      .filter(p => p.userId === actor.id && p.actions.includes('VIEW'))
      .map(p => p.targetId);
    
    return users.filter(u => allowedTargetIds.includes(u.id));
  }

  /**
   * Enforces strict downward hierarchy for impersonation.
   * Denies self-impersonation, same-level roles (except Super Admins), and higher-level roles.
   */
  static canImpersonate(actor: User, target: User): boolean {
    if (actor.id === target.id) return false;

    const actorRank = this.getRoleLevel(actor.role);
    const targetRank = this.getRoleLevel(target.role);

    const isSuperAdmin = actor.role === UserRole.SUPER_ADMIN;
    const isHigherRank = actorRank > targetRank;
    
    // Rule: Actor must be strictly higher rank than target.
    // Exception: Super Admins can impersonate other Super Admins.
    const isSuperAdminTargetingSuperAdmin = isSuperAdmin && target.role === UserRole.SUPER_ADMIN;

    if (!isHigherRank && !isSuperAdminTargetingSuperAdmin) return false;

    return this.hasPermission(actor, target.id, 'IMPERSONATE');
  }

  static canViewLogs(actor: User): boolean {
    if (actor.role === UserRole.SUPER_ADMIN) return true;
    const perms = getPermissions();
    return perms.some(p => p.userId === actor.id && p.actions.includes('VIEW_LOGS'));
  }
}

export default AuthService;
