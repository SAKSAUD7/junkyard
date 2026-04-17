/**
 * PermissionGuard — conditionally renders children based on RBAC permission.
 *
 * Usage:
 *   <PermissionGuard permission="can_manage_vendors">
 *     <EditButton />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission="can_manage_roles" fallback={<AccessDenied />}>
 *     <RolesPage />
 *   </PermissionGuard>
 */
import { usePermissions } from '../../contexts/PermissionContext'

export default function PermissionGuard({ permission, fallback = null, children }) {
    const { hasPermission, permissionsLoaded } = usePermissions()

    if (!permissionsLoaded) return null
    if (!hasPermission(permission)) return fallback

    return children
}
