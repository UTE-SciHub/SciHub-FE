import { NavLink } from "react-router-dom";
import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ collapsed, onToggle }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-4">
          <NavLink to="/admin" className="flex items-center gap-2 mr-16">
            <div className="w-8 h-8 relative">
              <img
                src="/logo/UTE.png"
                alt="UTE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-primary-900">
                UTE-SciHub
              </span>
              <span className="text-[10px] text-muted-foreground">
                Quản trị hệ thống
              </span>
            </div>
          </NavLink>

          <Button
            variant="ghost"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu />
          </Button>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm..." className="pl-8 w-full" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {[
                  {
                    title: "Đăng ký đề tài NCKH cấp Trường năm 2023",
                    desc: "Đợt đăng ký đề tài NCKH cấp Trường năm 2023 đã được mở.",
                    time: "2 giờ trước",
                  },
                  {
                    title: "Hạn nộp báo cáo tiến độ đề tài DT2023-042",
                    desc: "Nhắc nhở: Hạn nộp báo cáo tiến độ đề tài DT2023-042 là 15/09/2023.",
                    time: "3 giờ trước",
                  },
                  {
                    title: "Thông báo họp Hội đồng xét duyệt đề tài",
                    desc: "Hội đồng xét duyệt đề tài sẽ họp vào ngày 20/09/2023.",
                    time: "1 ngày trước",
                  },
                ].map((notification, i) => (
                  <DropdownMenuItem
                    key={i}
                    className="cursor-pointer py-2 px-4"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-sm">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.desc}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-primary text-sm font-medium">
                Xem tất cả thông báo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/">Chuyển sang giao diện người dùng</NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
