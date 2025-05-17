import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, User, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/service/auth-service";
import Cookies from "js-cookie";
import useUserStore from "@/store/userStore";
import { toast } from "@/components/ui/use-toast";

const UserProfile = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const roles = user?.roles || [];
  const isStudentOnly = roles.length === 1 && roles[0].name === "STUDENT";

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get("access-token");
      if (accessToken) {
        await logout(accessToken);
      }

      Cookies.remove("access-token", { secure: true, sameSite: "Strict" });
      Cookies.remove("refresh-token", { secure: true, sameSite: "Strict" });
      clearUser();

      toast({
        title: "Thông báo",
        description: "Đăng xuất thành công!",
        variant: "success",
        duration: 2000,
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Thông báo",
        description: "Đăng xuất thất bại. Vui lòng thử lại.",
        variant: "error",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <NavLink to="/profile">
            <UserIcon className="h-4 w-4 mr-2" /> Hồ sơ
          </NavLink>
        </DropdownMenuItem>
        {!isStudentOnly && (
          <DropdownMenuItem asChild>
            <NavLink to="/admin">
              <LayoutDashboard className="h-4 w-4 mr-2" /> Trang quản trị
            </NavLink>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-rose-500" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
