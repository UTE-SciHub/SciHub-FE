import React from "react";
import { NavLink } from "react-router-dom";
import {
  FileTextIcon,
  ClipboardCheckIcon,
  FileSignatureIcon,
  GanttChartIcon,
  CheckCircleIcon,
  ArchiveIcon,
} from "lucide-react";

const navItems = [
  {
    title: "Trang chủ",
    href: "/",
  },
  {
    title: "Đăng ký đề tài",
    href: "/topic-registration",
    icon: FileTextIcon,
  },
];

const UserMainNav = () => {
  return (
    <nav className="hidden md:flex flex-1 justify-center items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors px-1 py-1.5 
            ${
              isActive
                ? "text-primary-600 border-b-2 border-primary-500"
                : "text-muted-foreground hover:text-primary-700"
            }`
          }
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default UserMainNav;
