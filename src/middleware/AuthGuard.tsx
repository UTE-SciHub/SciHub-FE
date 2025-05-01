import { Navigate, useLocation } from "react-router-dom";
import { Roles } from "@/models/enums/roles.enum";
import useUserStore from "@/store/userStore";

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const location = useLocation();
    const user = useUserStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const roles = (user.roles || []).map((role: { id: string; name: string }) => role.name);

    const hasAdminAccess = roles.includes(Roles.TEACHER) || roles.includes(Roles.ADMIN);

    if (!hasAdminAccess && location.pathname.startsWith("/admin")) {
        return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};