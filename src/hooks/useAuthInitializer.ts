import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import useUserStore from "@/store/userStore";
import { UserService } from "@/service/user-service";

export const useAuthInitializer = () => {
    const setUser = useUserStore((state) => state.setUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const token = Cookies.get("access-token");
            if (token) {
                try {
                    const res = await UserService.getCurrentUsers({ token });
                    if (res.status === 200 || res.data.code === 1000) {
                        setUser(res.data);
                    }
                } catch (err) {
                    console.error("Failed to load user", err);
                }
            }
            setLoading(false);
        };
        init();
    }, [setUser]);

    return { loading };
};
