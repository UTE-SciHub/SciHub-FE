
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileTextIcon,
  Menu,
  Home
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserAppLogo from './UserAppLogo';

const navItems = [
  {
    title: "Trang chủ",
    href: "/",
    icon: Home,
  },
  {
    title: "Đề tài của tôi",
    href: "/my-topics",
    icon: FileTextIcon,
  },
  {
    title: "Danh mục biểu mẫu",
    href: "/template-list",
    icon: FileTextIcon,
  },
];

const UserMobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 pt-6">
          <div className="mb-8 pl-2">
            <UserAppLogo />
          </div>
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 text-sm font-medium transition-colors px-3 py-2 rounded-md
                  ${isActive
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-muted-foreground hover:text-primary-700 hover:bg-primary-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserMobileNav;
