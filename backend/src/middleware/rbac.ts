/**
 * Role-Based Access Control (RBAC) System
 * 
 * Manages user roles and permissions
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// User roles
export enum Role {
  ADMIN = 'admin',
  TEAM_MANAGER = 'team_manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
  GUEST = 'guest'
}

// Resource types
export enum Resource {
  TASKS = 'tasks',
  TEAMS = 'teams',
  USERS = 'users',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  BILLING = 'billing',
  AUDIT_LOGS = 'audit_logs',
  ADMIN = 'admin'
}

// Actions
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage'
}

/**
 * Permission matrix: defines what each role can do
 * Format: { resource: { action: [roles that can perform] } }
 */
export const PERMISSIONS = {
  [Resource.TASKS]: {
    [Action.CREATE]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.READ]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN, Role.VIEWER],
    [Action.UPDATE]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.DELETE]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.MANAGE]: [Role.TEAM_MANAGER, Role.ADMIN]
  },

  [Resource.TEAMS]: {
    [Action.CREATE]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.READ]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.UPDATE]: [Role.TEAM_MANAGER, Role.ADMIN],
    [Action.DELETE]: [Role.TEAM_MANAGER, Role.ADMIN],
    [Action.MANAGE]: [Role.ADMIN]
  },

  [Resource.USERS]: {
    [Action.CREATE]: [Role.ADMIN],
    [Action.READ]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN], // Can read own + team members
    [Action.UPDATE]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN], // Can update own
    [Action.DELETE]: [Role.ADMIN],
    [Action.MANAGE]: [Role.ADMIN]
  },

  [Resource.ANALYTICS]: {
    [Action.READ]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.MANAGE]: [Role.ADMIN]
  },

  [Resource.SETTINGS]: {
    [Action.READ]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.UPDATE]: [Role.MEMBER, Role.TEAM_MANAGER, Role.ADMIN],
    [Action.MANAGE]: [Role.ADMIN]
  },

  [Resource.BILLING]: {
    [Action.READ]: [Role.MEMBER, Role.ADMIN],
    [Action.UPDATE]: [Role.MEMBER, Role.ADMIN],
    [Action.MANAGE]: [Role.ADMIN]
  },

  [Resource.AUDIT_LOGS]: {
    [Action.READ]: [Role.ADMIN],
    [Action.MANAGE]: [Role.ADMIN]
  },

  [Resource.ADMIN]: {
    [Action.CREATE]: [Role.ADMIN],
    [Action.READ]: [Role.ADMIN],
    [Action.UPDATE]: [Role.ADMIN],
    [Action.DELETE]: [Role.ADMIN],
    [Action.MANAGE]: [Role.ADMIN]
  }
};

/**
 * Check if user can perform action on resource
 */
export function canUserPerform(
  userRole: Role,
  resource: Resource,
  action: Action
): boolean {
  const resourcePermissions = PERMISSIONS[resource];
  
  if (!resourcePermissions) {
    logger.warn('Unknown resource', { resource });
    return false;
  }

  const allowedRoles = resourcePermissions[action];
  
  if (!allowedRoles) {
    logger.warn('Unknown action', { resource, action });
    return false;
  }

  return allowedRoles.includes(userRole);
}

/**
 * Authorize middleware - checks if user has permission
 */
export const authorize = (resource: Resource, action: Action) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const userRole: Role = user.role || Role.GUEST;
    const hasPermission = canUserPerform(userRole, resource, action);

    if (!hasPermission) {
      logger.warn('Authorization denied', {
        userId: user.id,
        role: userRole,
        resource,
        action,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
        errorCode: 403
      });
    }

    // Permission granted, continue
    (req as any).hasPermission = true;
    next();
  };
};

/**
 * Authorize specific team actions
 * Checks if user is member of the team
 */
export const authorizeTeamAction = (resource: Resource, action: Action) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const teamId = req.params.teamId || req.body.teamId;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED'
      });
    }

    // Check basic permission
    const userRole: Role = user.role || Role.GUEST;
    if (!canUserPerform(userRole, resource, action)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN'
      });
    }

    // Check team membership if needed
    if (teamId && userRole === Role.MEMBER) {
      // TODO: Verify user is member of team
      // const isMember = await TeamMember.findOne({ teamId, userId: user.id });
      // if (!isMember) return res.status(403).json({ error: 'Not team member' });
    }

    next();
  };
};

/**
 * Authorize resource ownership
 * Checks if user owns the resource
 */
export const authorizeResourceOwner = (resource: Resource) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const resourceId = req.params.id;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED'
      });
    }

    // Admin can access any resource
    if (user.role === Role.ADMIN) {
      return next();
    }

    // Check ownership based on resource type
    let owner = null;

    if (resource === Resource.TASKS) {
      // TODO: Verify user owns the task
      // const task = await Task.findById(resourceId);
      // owner = task?.userId;
    } else if (resource === Resource.TEAMS) {
      // TODO: Verify user owns or manages the team
      // const team = await Team.findById(resourceId);
      // owner = team?.ownerId;
    }

    if (owner !== user.id) {
      logger.warn('Resource owner check failed', {
        userId: user.id,
        resourceId,
        resource
      });

      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not own this resource'
      });
    }

    next();
  };
};

/**
 * Role-based middleware that requires specific role
 */
export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(user.role)) {
      logger.warn('Role check failed', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: roles
      });

      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): object {
  const permissions: any = {};

  for (const [resource, actions] of Object.entries(PERMISSIONS)) {
    permissions[resource] = {};
    for (const [action, allowedRoles] of Object.entries(actions)) {
      permissions[resource][action] = (allowedRoles as Role[]).includes(role);
    }
  }

  return permissions;
}

/**
 * Get permissions for current user request
 */
export const getMyPermissions = (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED'
    });
  }

  const permissions = getPermissionsForRole(user.role as Role);

  res.json({
    success: true,
    data: {
      role: user.role,
      permissions
    }
  });
};

/**
 * RBAC middleware - combines auth + authorization
 */
export const rbac = (resource: Resource, action: Action) => {
  return [authorize(resource, action)];
};

/**
 * Check permission helper
 */
export function checkPermission(userRole: Role, resource: Resource, action: Action): boolean {
  return canUserPerform(userRole, resource, action);
}

/**
 * Assert permission (throws if not allowed)
 */
export function assertPermission(userRole: Role, resource: Resource, action: Action): void {
  if (!canUserPerform(userRole, resource, action)) {
    throw new Error(`Permission denied: ${userRole} cannot ${action} ${resource}`);
  }
}
