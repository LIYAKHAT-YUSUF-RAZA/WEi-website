import { useAuth } from '../context/AuthContext';

/**
 * PermissionGuard component to conditionally render content based on manager permissions
 * @param {string|string[]} permission - Single permission string or array of permissions (any match grants access)
 * @param {ReactNode} children - Content to render if permission is granted
 * @param {ReactNode} fallback - Optional content to render if permission is denied
 */
const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { user, hasPermission, hasFullAccess } = useAuth();

  // If user has full access, render children
  if (hasFullAccess) {
    return <>{children}</>;
  }

  // If no user or not a manager, don't render
  if (!user || user.role !== 'manager') {
    return <>{fallback}</>;
  }

  // Handle array of permissions (any one matches)
  if (Array.isArray(permission)) {
    const hasAnyPermission = permission.some(perm => {
      if (perm === 'fullAccess') return hasFullAccess;
      return hasPermission(perm);
    });
    return hasAnyPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Handle single permission
  if (permission === 'fullAccess') {
    return hasFullAccess ? <>{children}</> : <>{fallback}</>;
  }

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
