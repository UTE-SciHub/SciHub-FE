import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "@/store/userStore";

export const AuthGuard: React.FC = () => {
    const location = useLocation();
    const user = useUserStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
