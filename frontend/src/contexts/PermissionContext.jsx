import { createContext, useContext, useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import { api } from '../services/api'

const PermissionContext = createContext({})

// Default: no permissions (safe fallback)
const EMPTY_PERMISSIONS = {
    can_manage_cms: false,
    can_manage_vendors: false,
    can_manage_leads: false,
    can_manage_ads: false,
    can_manage_blog: false,
    can_manage_messages: false,
    can_manage_yard_submissions: false,
    can_manage_settings: false,
    can_manage_roles: false,
    can_view_only: false,
}

export function PermissionProvider({ children }) {
    const { user, isAuthenticated, isAdmin } = useContext(AuthContext)
    const [permissions, setPermissions] = useState(EMPTY_PERMISSIONS)
    const [roleName, setRoleName] = useState(null)
    const [roleColor, setRoleColor] = useState(null)
    const [permissionsLoaded, setPermissionsLoaded] = useState(false)

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setPermissions(EMPTY_PERMISSIONS)
            setPermissionsLoaded(false)
            return
        }

        // Superusers bypass all RBAC — grant everything
        if (isAdmin || user.is_superuser) {
            const allPerms = Object.fromEntries(
                Object.keys(EMPTY_PERMISSIONS).map(k => [k, k === 'can_view_only' ? false : true])
            )
            setPermissions(allPerms)
            setRoleName('Superuser')
            setRoleColor('#ef4444')
            setPermissionsLoaded(true)
            return
        }

        // Fetch role permissions from /api/rbac/me/
        api.rbac.getMyPermissions()
            .then(data => {
                setPermissions(data.permissions || EMPTY_PERMISSIONS)
                setRoleName(data.role_name)
                setRoleColor(data.role_color)
            })
            .catch(() => {
                // If endpoint fails (e.g. not a staff member yet), use empty permissions
                setPermissions(EMPTY_PERMISSIONS)
            })
            .finally(() => setPermissionsLoaded(true))
    }, [user, isAuthenticated])

    const hasPermission = (permission) => {
        if (user?.is_superuser) return true
        return !!permissions[permission]
    }

    const canAccess = (module) => {
        if (user?.is_superuser) return true
        if (permissions.can_view_only) return true  // view-only can read all modules
        return !!permissions[`can_manage_${module}`]
    }

    return (
        <PermissionContext.Provider value={{
            permissions,
            roleName,
            roleColor,
            permissionsLoaded,
            hasPermission,
            canAccess,
        }}>
            {children}
        </PermissionContext.Provider>
    )
}

export function usePermissions() {
    return useContext(PermissionContext)
}

export { PermissionContext }
