import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
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
];

const UserNotifications = () => {
  return (
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
          {notifications.map((notification, i) => (
            <DropdownMenuItem key={i} className="cursor-pointer py-2 px-4">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-sm">{notification.title}</p>
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
  );
};

export default UserNotifications;
