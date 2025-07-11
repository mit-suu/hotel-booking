package net.blwsmartware.booking.validator;

import net.blwsmartware.booking.constant.PredefinedRole;
import org.springframework.stereotype.Component;

@Component("roleValidator")
public class RoleValidator implements PredefinedRole {
    
    public boolean hasRole(String roleName) {
        return roleName != null && (
            roleName.equals(USER_ROLE) || 
            roleName.equals(HOST_ROLE) || 
            roleName.equals(ADMIN_ROLE)
        );
    }
    
    public boolean hasPermission(String userRole, String requiredRole) {
        if (userRole == null || requiredRole == null) return false;
        
        // Phân quyền theo thứ tự: USER < HOST < ADMIN
        switch (userRole) {
            case ADMIN_ROLE:
                return true; // Admin có tất cả quyền
            case HOST_ROLE:
                return requiredRole.equals(USER_ROLE) || requiredRole.equals(HOST_ROLE);
            case USER_ROLE:
                return requiredRole.equals(USER_ROLE);
            default:
                return false;
        }
    }
}
