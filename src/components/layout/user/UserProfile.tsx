
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserProfile = () => {
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
          <NavLink to="/profile"><UserIcon className='h-4 w-4 mr-2' />Hồ sơ</NavLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <NavLink to="/admin"><LayoutDashboard className='h-4 w-4 mr-2' />Trang quản trị</NavLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-rose-500'><LogOut className='h-4 w-4 mr-2' /> Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
