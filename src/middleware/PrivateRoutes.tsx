import useUserStore from "@/store/userStore";
import { Navigate, useLocation } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
    const user = useUserStore((state) => state.user);
    const isAuthenticated = !!user?.id;
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
