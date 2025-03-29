import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "@/components/layout/admin/AdminFooter";
import useUserStore from "@/store/userStore";
import { getCurrentUsers } from "@/service/user-service";
import Cookies from "js-cookie";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const token = Cookies.get("access-token");
    if (token) {
      getCurrentUsers({ token }).then((res) => {
        if (res.status === 200 || res.code == 1000) {
          setUser(res.data);
        }
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AdminHeader collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex flex-1">
        <AdminSidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <main
          className={`px-6 py-4 overflow-auto transition-all duration-300 ${collapsed
            ? "ml-[70px] w-[calc(100%-70px)]"
            : "ml-64 w-[calc(100%-256px)]"
            }`}
        >
          <Outlet />
        </main>
      </div>
      <AdminFooter />
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminLayout;
