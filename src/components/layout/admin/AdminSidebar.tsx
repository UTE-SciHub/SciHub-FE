import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  FileText,
  FileSignature,
  DollarSign,
  Users,
  Settings,
  BarChart2,
  LogOut,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const sidebarItems = [
  {
    title: "Bảng điều khiển",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Thông báo",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    title: "Quản lý đề tài",
    href: "/admin/topics",
    icon: FileText,
  },
  {
    title: "Quản lý hợp đồng",
    href: "/admin/contracts",
    icon: FileSignature,
  },
  {
    title: "Quản lý tài chính",
    href: "/admin/finance",
    icon: DollarSign,
  },
  {
    title: "Báo cáo thống kê",
    href: "/admin/reports",
    icon: BarChart2,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Cài đặt hệ thống",
    href: "/admin/settings",
    icon: Settings,
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <motion.aside
      initial={{ width: collapsed ? 70 : 256 }}
      animate={{ width: collapsed ? 70 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-white border-r z-40 pt-14 shadow-sm"
    >
      <nav className="p-2 space-y-1 h-[calc(100vh-8rem)] overflow-y-auto">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-md transition-all duration-300",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100",
                collapsed && "justify-center px-2"
              )
            }
            title={collapsed ? item.title : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <motion.span
              initial={{ opacity: collapsed ? 0 : 1 }}
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className={`overflow-hidden whitespace-nowrap ${
                collapsed ? "w-0" : "w-auto"
              }`}
            >
              {item.title}
            </motion.span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full border-t bg-white">
        <button
          onClick={onToggle}
          className="flex justify-center items-center w-full text-gray-700 hover:text-primary-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
