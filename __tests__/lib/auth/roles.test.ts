import {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessRoute,
  getRoleDisplayName,
  isValidRole,
  getHighestRole,
  combinePermissions
} from '@/lib/auth/roles';

describe('User Roles and Permissions', () => {
  describe('ROLE_PERMISSIONS', () => {
    it('should define permissions for all roles', () => {
      expect(ROLE_PERMISSIONS[UserRole.VIEWER]).toBeDefined();
      expect(ROLE_PERMISSIONS[UserRole.USER]).toBeDefined();
      expect(ROLE_PERMISSIONS[UserRole.PRO]).toBeDefined();
      expect(ROLE_PERMISSIONS[UserRole.ADMIN]).toBeDefined();
    });

    it('should have viewer with minimal permissions', () => {
      const viewerPerms = ROLE_PERMISSIONS[UserRole.VIEWER];
      expect(viewerPerms).toContain(Permission.VIEW_PORTFOLIO);
      expect(viewerPerms).not.toContain(Permission.EDIT_PORTFOLIO);
      expect(viewerPerms).not.toContain(Permission.DELETE_PORTFOLIO);
    });

    it('should have user with standard permissions', () => {
      const userPerms = ROLE_PERMISSIONS[UserRole.USER];
      expect(userPerms).toContain(Permission.VIEW_PORTFOLIO);
      expect(userPerms).toContain(Permission.CREATE_PORTFOLIO);
      expect(userPerms).toContain(Permission.EDIT_PORTFOLIO);
      expect(userPerms).toContain(Permission.DELETE_PORTFOLIO);
      expect(userPerms).not.toContain(Permission.USE_AI_FEATURES);
    });

    it('should have pro with enhanced permissions', () => {
      const proPerms = ROLE_PERMISSIONS[UserRole.PRO];
      expect(proPerms).toContain(Permission.USE_AI_FEATURES);
      expect(proPerms).toContain(Permission.CUSTOM_DOMAIN);
      expect(proPerms).toContain(Permission.ANALYTICS);
      expect(proPerms).toContain(Permission.EXPORT_DATA);
    });

    it('should have admin with all permissions', () => {
      const adminPerms = ROLE_PERMISSIONS[UserRole.ADMIN];
      expect(adminPerms).toContain(Permission.MANAGE_USERS);
      expect(adminPerms).toContain(Permission.VIEW_ALL_PORTFOLIOS);
      expect(adminPerms).toContain(Permission.SYSTEM_SETTINGS);
      
      // Admin should have all permissions
      Object.values(Permission).forEach(permission => {
        expect(adminPerms).toContain(permission);
      });
    });

    it('should have hierarchical permissions', () => {
      // Each higher role should include permissions from lower roles
      const viewerPerms = ROLE_PERMISSIONS[UserRole.VIEWER];
      const userPerms = ROLE_PERMISSIONS[UserRole.USER];
      const proPerms = ROLE_PERMISSIONS[UserRole.PRO];
      
      viewerPerms.forEach(perm => {
        expect(userPerms).toContain(perm);
      });
      
      userPerms.forEach(perm => {
        expect(proPerms).toContain(perm);
      });
    });
  });

  describe('hasPermission', () => {
    it('should return true for granted permissions', () => {
      expect(hasPermission(UserRole.USER, Permission.CREATE_PORTFOLIO)).toBe(true);
      expect(hasPermission(UserRole.PRO, Permission.USE_AI_FEATURES)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, Permission.MANAGE_USERS)).toBe(true);
    });

    it('should return false for denied permissions', () => {
      expect(hasPermission(UserRole.VIEWER, Permission.EDIT_PORTFOLIO)).toBe(false);
      expect(hasPermission(UserRole.USER, Permission.USE_AI_FEATURES)).toBe(false);
      expect(hasPermission(UserRole.PRO, Permission.MANAGE_USERS)).toBe(false);
    });

    it('should handle invalid roles', () => {
      expect(hasPermission('INVALID_ROLE' as UserRole, Permission.VIEW_PORTFOLIO)).toBe(false);
    });

    it('should handle undefined role', () => {
      expect(hasPermission(undefined as any, Permission.VIEW_PORTFOLIO)).toBe(false);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow access to public routes', () => {
      expect(canAccessRoute(UserRole.VIEWER, '/')).toBe(true);
      expect(canAccessRoute(UserRole.VIEWER, '/about')).toBe(true);
      expect(canAccessRoute(UserRole.VIEWER, '/pricing')).toBe(true);
    });

    it('should control access to portfolio routes', () => {
      expect(canAccessRoute(UserRole.USER, '/portfolio')).toBe(true);
      expect(canAccessRoute(UserRole.USER, '/portfolio/edit')).toBe(true);
      expect(canAccessRoute(UserRole.VIEWER, '/portfolio/edit')).toBe(false);
    });

    it('should control access to AI routes', () => {
      expect(canAccessRoute(UserRole.PRO, '/ai/enhance')).toBe(true);
      expect(canAccessRoute(UserRole.USER, '/ai/enhance')).toBe(false);
    });

    it('should control access to admin routes', () => {
      expect(canAccessRoute(UserRole.ADMIN, '/admin')).toBe(true);
      expect(canAccessRoute(UserRole.ADMIN, '/admin/users')).toBe(true);
      expect(canAccessRoute(UserRole.PRO, '/admin')).toBe(false);
    });

    it('should control access to analytics routes', () => {
      expect(canAccessRoute(UserRole.PRO, '/analytics')).toBe(true);
      expect(canAccessRoute(UserRole.USER, '/analytics')).toBe(false);
    });

    it('should handle API routes', () => {
      expect(canAccessRoute(UserRole.USER, '/api/portfolio')).toBe(true);
      expect(canAccessRoute(UserRole.PRO, '/api/ai/enhance')).toBe(true);
      expect(canAccessRoute(UserRole.USER, '/api/ai/enhance')).toBe(false);
    });

    it('should handle unknown routes permissively', () => {
      expect(canAccessRoute(UserRole.USER, '/unknown/route')).toBe(true);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return display names for all roles', () => {
      expect(getRoleDisplayName(UserRole.VIEWER)).toBe('Viewer');
      expect(getRoleDisplayName(UserRole.USER)).toBe('User');
      expect(getRoleDisplayName(UserRole.PRO)).toBe('Pro');
      expect(getRoleDisplayName(UserRole.ADMIN)).toBe('Admin');
    });

    it('should handle invalid roles', () => {
      expect(getRoleDisplayName('INVALID' as UserRole)).toBe('Unknown');
    });

    it('should handle undefined', () => {
      expect(getRoleDisplayName(undefined as any)).toBe('Unknown');
    });
  });

  describe('isValidRole', () => {
    it('should validate correct roles', () => {
      expect(isValidRole(UserRole.VIEWER)).toBe(true);
      expect(isValidRole(UserRole.USER)).toBe(true);
      expect(isValidRole(UserRole.PRO)).toBe(true);
      expect(isValidRole(UserRole.ADMIN)).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(isValidRole('INVALID')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole(null as any)).toBe(false);
      expect(isValidRole(undefined as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isValidRole('user')).toBe(false); // Should be 'USER'
      expect(isValidRole('VIEWER')).toBe(true);
    });
  });

  describe('getHighestRole', () => {
    it('should return highest role from array', () => {
      expect(getHighestRole([UserRole.USER, UserRole.PRO])).toBe(UserRole.PRO);
      expect(getHighestRole([UserRole.VIEWER, UserRole.ADMIN, UserRole.USER])).toBe(UserRole.ADMIN);
      expect(getHighestRole([UserRole.USER, UserRole.VIEWER])).toBe(UserRole.USER);
    });

    it('should handle single role', () => {
      expect(getHighestRole([UserRole.PRO])).toBe(UserRole.PRO);
    });

    it('should handle empty array', () => {
      expect(getHighestRole([])).toBe(UserRole.VIEWER);
    });

    it('should ignore invalid roles', () => {
      expect(getHighestRole(['INVALID' as UserRole, UserRole.USER])).toBe(UserRole.USER);
    });

    it('should return VIEWER if all roles invalid', () => {
      expect(getHighestRole(['INVALID1' as UserRole, 'INVALID2' as UserRole])).toBe(UserRole.VIEWER);
    });
  });

  describe('combinePermissions', () => {
    it('should combine permissions from multiple roles', () => {
      const combined = combinePermissions([UserRole.USER, UserRole.PRO]);
      
      expect(combined).toContain(Permission.CREATE_PORTFOLIO); // From USER
      expect(combined).toContain(Permission.USE_AI_FEATURES); // From PRO
    });

    it('should remove duplicates', () => {
      const combined = combinePermissions([UserRole.USER, UserRole.USER]);
      const unique = [...new Set(combined)];
      
      expect(combined.length).toBe(unique.length);
    });

    it('should handle empty array', () => {
      const combined = combinePermissions([]);
      
      expect(combined).toEqual([]);
    });

    it('should handle invalid roles', () => {
      const combined = combinePermissions(['INVALID' as UserRole, UserRole.USER]);
      
      expect(combined).toContain(Permission.CREATE_PORTFOLIO);
      expect(combined.length).toBe(ROLE_PERMISSIONS[UserRole.USER].length);
    });

    it('should return all permissions for admin', () => {
      const combined = combinePermissions([UserRole.VIEWER, UserRole.ADMIN]);
      
      expect(combined).toContain(Permission.MANAGE_USERS);
      expect(combined).toContain(Permission.VIEW_PORTFOLIO);
    });
  });

  describe('Permission hierarchy', () => {
    it('should have consistent permission naming', () => {
      Object.values(Permission).forEach(permission => {
        expect(permission).toMatch(/^[A-Z_]+$/); // All caps with underscores
      });
    });

    it('should not have duplicate permissions in any role', () => {
      Object.values(ROLE_PERMISSIONS).forEach(permissions => {
        const unique = [...new Set(permissions)];
        expect(permissions.length).toBe(unique.length);
      });
    });

    it('should have reasonable permission counts', () => {
      const viewerCount = ROLE_PERMISSIONS[UserRole.VIEWER].length;
      const userCount = ROLE_PERMISSIONS[UserRole.USER].length;
      const proCount = ROLE_PERMISSIONS[UserRole.PRO].length;
      const adminCount = ROLE_PERMISSIONS[UserRole.ADMIN].length;
      
      expect(viewerCount).toBeLessThan(userCount);
      expect(userCount).toBeLessThan(proCount);
      expect(proCount).toBeLessThan(adminCount);
    });
  });
});