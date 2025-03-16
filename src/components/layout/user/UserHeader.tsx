import React from "react";
import UserAppLogo from "./UserAppLogo";
import UserMainNav from "./UserMainNav";
import UserMobileNav from "./UserMobileNav";
import UserSearch from "./UserSearch";
import UserNotifications from "./UserNotifications";
import UserProfile from "./UserProfile";

const UserHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FFF] bg-background/95 shadow-sm">
      <div className="container flex h-16 items-center">
        <UserMobileNav />
        <UserAppLogo />
        <UserMainNav />
        <div className="flex items-center ml-auto gap-4">
          <UserSearch />
          <UserNotifications />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
