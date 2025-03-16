import React from "react";
import { Outlet } from "react-router-dom";
import UserHeader from "./UserHeader";
import { Toaster } from "@/components/ui/sonner";
import UserFooter from "@/components/layout/user/UserFooter";

const UserLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <UserHeader />
      <main className="flex-1">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
      <UserFooter />
      <Toaster position="top-right" />
    </div>
  );
};

export default UserLayout;
