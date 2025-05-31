import React from "react";
import { Link } from "react-router-dom";
import UserAppLogo from "./UserAppLogo";
import UserMainNav from "./UserMainNav";
import UserMobileNav from "./UserMobileNav";
import UserSearch from "./UserSearch";
import UserNotifications from "./UserNotifications";
import UserProfile from "./UserProfile";
import useUserStore from "@/store/userStore";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserHeader = () => {
  const { user } = useUserStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FFF] shadow-sm">
      <div className="container flex h-16 items-center">
        <UserMobileNav />
        <UserAppLogo />
        <UserMainNav />
        <div className="flex items-center ml-auto gap-4">
          <UserSearch />
          <UserNotifications />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Xin chào, {user.name || ""}</span>
              <UserProfile />
            </div>
          ) : (
            <Link to="/login">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;