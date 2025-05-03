import { Navigate, useLocation } from "react-router-dom";
import { Roles } from "@/models/enums/roles.enum";
import useUserStore from "@/store/userStore";

interface RoleGuardProps {
    children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children }) => {
    const location = useLocation();
    const user = useUserStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const roles = (user.roles || []).map((role: { id: string; name: string }) => role.name);

    const isAdminPage = location.pathname.startsWith("/admin");
    const hasAdminAccess = roles.length > 0 && !roles.includes(Roles.STUDENT);

    if (isAdminPage && !hasAdminAccess) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};