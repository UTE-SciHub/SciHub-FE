import type React from "react";
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  List,
  Microscope,
  BookOpen,
  ChevronDown,
  Folder,
  Calendar,
  Building,
  Book,
  FilePlus,
  UserCogIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/service/auth-service";
import Cookies from "js-cookie";
import { toast } from "@/hooks/use-toast";
import useUserStore from "@/store/userStore";
import { Roles } from "@/models/enums/roles.enum";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SidebarItem[];
  allowedRoles: Roles[];
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Bảng điều khiển",
    href: "/admin",
    icon: Home,
    allowedRoles: [Roles.ADMIN, Roles.BGH, Roles.PQLKHHTQT, Roles.BCNKHOA, Roles.TEACHER],
  },
  {
    title: "Báo cáo thống kê",
    href: "/admin/reports",
    icon: BarChart2,
    subItems: [
      { title: "Báo cáo tổng quan", href: "/admin/reports/overview", icon: BarChart2, allowedRoles: [Roles.ADMIN, Roles.BGH] },
      { title: "Báo cáo chi tiết", href: "/admin/reports/details", icon: BarChart2, allowedRoles: [Roles.ADMIN, Roles.BGH] },
      { title: "Báo cáo theo lĩnh vực", href: "/admin/reports/fields", icon: BarChart2, allowedRoles: [Roles.ADMIN, Roles.BGH] },
      { title: "Báo cáo theo loại hình", href: "/admin/reports/types", icon: BarChart2, allowedRoles: [Roles.ADMIN, Roles.BGH] },
    ],
    allowedRoles: [Roles.ADMIN, Roles.BGH],
  },
  {
    title: "Thông báo",
    href: "/admin/announcements",
    icon: Bell,
    allowedRoles: [Roles.ADMIN, Roles.PQLKHHTQT, Roles.TEACHER],
  },
  {
    title: "Quản lý đề tài",
    href: "/admin/topics",
    icon: Folder,
    subItems: [
      { title: "Danh sách đề tài", href: "/admin/topics", icon: List, allowedRoles: [Roles.ADMIN, Roles.PQLKHHTQT, Roles.BCNKHOA, Roles.TEACHER] },
      { title: "Đăng ký đề tài", href: "/admin/topic-proposal", icon: FileText, allowedRoles: [Roles.ADMIN, Roles.PQLKHHTQT, Roles.TEACHER] },
    ],
    allowedRoles: [Roles.ADMIN, Roles.PQLKHHTQT, Roles.BCNKHOA, Roles.TEACHER],
  },
  {
    title: "Danh mục đề tài",
    href: "/admin/categories",
    icon: List,
    allowedRoles: [Roles.ADMIN, Roles.PQLKHHTQT],
  },
  {
    title: "Quản lý hợp đồng",
    href: "/admin/contracts",
    icon: FileSignature,
    allowedRoles: [Roles.ADMIN],
  },
  {
    title: "Quản lý tài chính",
    href: "/admin/finance",
    icon: DollarSign,
    allowedRoles: [Roles.ADMIN, Roles.BGH],
  },
  {
    title: "Quản lý đợt đăng ký",
    href: "/admin/registration",
    icon: Calendar,
    allowedRoles: [Roles.ADMIN, Roles.PQLKHHTQT],
  },
  {
    title: "Quản lý tài khoản",
    href: "/admin/users",
    icon: UserCogIcon,
    allowedRoles: [Roles.ADMIN],
  },
  {
    title: "Danh sách đơn vị",
    href: "/admin/departments",
    icon: Building,
    allowedRoles: [Roles.ADMIN],
  },
  {
    title: "Quản lý lĩnh vực nghiên cứu",
    href: "/admin/research-fields",
    icon: Microscope,
    allowedRoles: [Roles.ADMIN],
  },
  {
    title: "Quản lý loại hình nghiên cứu",
    href: "/admin/research-types",
    icon: Book,
    allowedRoles: [Roles.ADMIN],
  },
  {
    title: "Đăng ký CNDT",
    href: "/admin/registration-cndt",
    icon: FilePlus,
    allowedRoles: [Roles.ADMIN, Roles.TEACHER],
  },
  {
    title: "Danh sách hội đồng",
    href: "/admin/councils",
    icon: Users,
    allowedRoles: [Roles.ADMIN, Roles.TEACHER, Roles.BGH, Roles.PQLKHHTQT, Roles.COUNCIL_MEMBER],
  },
  {
    title: "Cài đặt hệ thống",
    href: "/admin/settings",
    icon: Settings,
    allowedRoles: [Roles.ADMIN, Roles.BGH],
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const roles = (user?.roles || []).map((role: { id: string; name: string }) => role.name);

  const hasAccess = (item: SidebarItem) => {
    return item.allowedRoles.some((role) => roles.includes(role));
  };

  const isParentActive = (item: SidebarItem): boolean => {
    if (location.pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => location.pathname === subItem.href);
    }
    return false;
  };

  // Open submenu automatically when a child route is active
  useEffect(() => {
    const activeParent = sidebarItems.find((item) =>
      item.subItems?.some((subItem) => location.pathname === subItem.href && hasAccess(subItem)),
    );
    if (activeParent && hasAccess(activeParent)) {
      setOpenSubmenu(activeParent.title);
    }
  }, [location.pathname, roles]);

  const toggleSubmenu = (title: string, event: React.MouseEvent) => {
    if (collapsed || !hasAccess(sidebarItems.find((item) => item.title === title)!)) return;

    if (sidebarItems.find((item) => item.title === title)?.subItems) {
      event.preventDefault();
      setOpenSubmenu(openSubmenu === title ? null : title);
    }
  };

  const clearUser = useUserStore((state) => state.clearUser);

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
    <motion.aside
      initial={{ width: collapsed ? 70 : 256 }}
      animate={{ width: collapsed ? 70 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-primary-900 border-r z-40 pt-14 shadow-sm flex flex-col"
    >
      <nav className="p-2 space-y-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-700 scrollbar-track-transparent">
        {sidebarItems
          .filter((item) => hasAccess(item))
          .map((item) => {
            const isActive = isParentActive(item);

            return (
              <div key={item.href} className="relative">
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-100 rounded-full" />}

                {item.subItems ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-md transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-primary-800/60 text-white"
                        : "text-white/90 hover:bg-primary-800/40 hover:text-white",
                      collapsed && "justify-center px-2",
                      isActive && "pl-5",
                    )}
                    onClick={(e) => toggleSubmenu(item.title, e)}
                    title={collapsed ? item.title : undefined}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-100" : "text-white/80")} />
                    <motion.span
                      initial={{ opacity: collapsed ? 0 : 1 }}
                      animate={{ opacity: collapsed ? 0 : 1 }}
                      transition={{ duration: 0.2 }}
                      className={`overflow-hidden whitespace-nowrap ${collapsed ? "w-0" : "w-auto"}`}
                    >
                      {item.title}
                    </motion.span>
                    {item.subItems && !collapsed && (
                      <motion.div
                        animate={{ rotate: openSubmenu === item.title ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-auto"
                      >
                        <ChevronDown className="h-4 w-4 text-white/70" />
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-md transition-all duration-300",
                        isActive
                          ? "bg-primary-800/60 text-white pl-5"
                          : "text-white/90 hover:bg-primary-800/40 hover:text-white",
                        collapsed && "justify-center px-2",
                      )
                    }
                    title={collapsed ? item.title : undefined}
                    end
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-100" : "text-white/80")}
                        />
                        <motion.span
                          initial={{ opacity: collapsed ? 0 : 1 }}
                          animate={{ opacity: collapsed ? 0 : 1 }}
                          transition={{ duration: 0.2 }}
                          className={`overflow-hidden whitespace-nowrap ${collapsed ? "w-0" : "w-auto"}`}
                        >
                          {item.title}
                        </motion.span>
                      </>
                    )}
                  </NavLink>
                )}
                <AnimatePresence>
                  {item.subItems && openSubmenu === item.title && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-8 space-y-1.5 mt-1 mb-1.5"
                    >
                      {item.subItems
                        .filter((subItem) => hasAccess(subItem))
                        .map((subItem) => (
                          <NavLink
                            key={subItem.href}
                            to={subItem.href}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-md transition-all duration-300",
                                isActive
                                  ? "bg-primary-800/60 text-white"
                                  : "text-white/80 hover:bg-primary-800/40 hover:text-white",
                              )
                            }
                            end
                          >
                            {({ isActive }) => (
                              <>
                                <subItem.icon
                                  className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-primary-100" : "text-white/70")}
                                />
                                <span>{subItem.title}</span>
                              </>
                            )}
                          </NavLink>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </nav>

      <div className="mt-auto w-full">
        <div className="mx-2 my-2">
          <div className="border-t border-primary-700/50"></div>
        </div>
        <div className="p-2 pb-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 text-sm font-medium px-3 py-3 rounded-md transition-all duration-300",
              "text-white/90 hover:bg-primary-800/40 hover:text-white",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Đăng xuất" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-white/80" />
            <motion.span
              initial={{ opacity: collapsed ? 0 : 1 }}
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className={`overflow-hidden whitespace-nowrap ${collapsed ? "w-0" : "w-auto"}`}
            >
              Đăng xuất
            </motion.span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;