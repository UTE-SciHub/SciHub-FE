import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, UserPlus, Crown, User, Check, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination/pagination";
import { TopicMemberRole } from "@/models/topic-member";
import { getInitialsAvt } from "@/utils/common";
import type { User as UserModel } from "@/models/user";
import type React from "react";

interface MemberSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberSearchTerm: string;
  setMemberSearchTerm: (val: string) => void;
  isLoadingUsers: boolean;
  filteredUsers: UserModel[];
  selectedRoles: Record<string, TopicMemberRole>;
  updateSelectedRole: (userId: string, role: TopicMemberRole) => void;
  isUserMember: (userId: string) => boolean;
  addMember: (user: UserModel, userId: string) => void;
  userPage: number;
  userPageSize: number;
  userTotal: number;
  totalItems: number;
  onUserPageChange: (page: number) => void;
  onUserPageSizeChange: (size: number) => void;
}

const MemberSelectDialog: React.FC<MemberSelectDialogProps> = ({
  open,
  onOpenChange,
  memberSearchTerm,
  setMemberSearchTerm,
  isLoadingUsers,
  filteredUsers,
  selectedRoles,
  updateSelectedRole,
  isUserMember,
  addMember,
  userPage,
  userPageSize,
  userTotal,
  totalItems,
  onUserPageChange,
  onUserPageSizeChange,
}) => {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-gray-900">Thêm thành viên vào đề tài</DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Tìm kiếm và thêm thành viên vào đề tài nghiên cứu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search Section - Fixed */}
        <div className="px-6 py-4 border-b bg-white flex-shrink-0">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc khoa..."
                className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
              />
            </div>

            {/* Search Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {isLoadingUsers ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang tìm kiếm...
                  </div>
                ) : (
                  `Tìm thấy ${totalItems} tài khoản`
                )}
              </span>
              <Badge variant="outline" className="text-xs">
                Trang {userPage} / {userTotal}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
              {isLoadingUsers ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-3">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <p className="text-gray-500 font-medium">Đang tải danh sách tài khoản...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow className="border-b-2 border-gray-100">
                      <TableHead className="font-semibold">Thông tin</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="w-[180px] font-semibold">Vai trò</TableHead>
                      <TableHead className="w-[120px] font-semibold text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const isMember = isUserMember(user.id);
                        return (
                          <TableRow
                            key={user.id}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                  <AvatarImage src={user.imageUrl || "/avatar-default.jpg"} alt={user.name} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">
                                    {getInitialsAvt(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-gray-900 truncate">{user.name}</div>
                                  <div className="text-sm text-gray-500 truncate">
                                    {/* {user.department || "Chưa có thông tin khoa"} */}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="text-sm text-gray-900">{user.email}</div>
                                {/* {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>} */}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Select
                                value={selectedRoles[user.id] || TopicMemberRole.MEMBER}
                                onValueChange={(value) => updateSelectedRole(user.id, value as TopicMemberRole)}
                                disabled={isMember}
                              >
                                <SelectTrigger className="w-full h-9 border-gray-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={TopicMemberRole.INVESTIGATOR}>
                                    <div className="flex items-center gap-2">
                                      <span>Chủ nhiệm</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value={TopicMemberRole.MEMBER}>
                                    <div className="flex items-center gap-2">
                                      <span>Thành viên</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              {isMember ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full bg-green-50 text-green-700 hover:bg-green-100 cursor-not-allowed"
                                  disabled
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Đã thêm
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="default"
                                  size="sm"
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                  onClick={() => addMember(user, user.id)}
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Thêm
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                              <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-gray-900 font-medium">Không tìm thấy tài khoản nào</p>
                              <p className="text-gray-500 text-sm">
                                Thử thay đổi từ khóa tìm kiếm hoặc kiểm tra lại thông tin
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Pagination - Fixed */}
        {!isLoadingUsers && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <Pagination
              currentPage={userPage}
              totalPages={userTotal}
              onPageChange={onUserPageChange}
              totalItems={totalItems}
              itemsPerPage={userPageSize}
              onPageSizeChange={onUserPageSizeChange}
            />
          </div>
        )}

        {/* Footer - Fixed */}
        <DialogFooter className="px-6 py-4 border-t bg-white flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-500">
              {!isLoadingUsers && (
                <span>
                  Hiển thị {Math.min((userPage - 1) * userPageSize + 1, userTotal)} -{" "}
                  {Math.min(userPage * userPageSize, userTotal)} trong tổng số {userTotal} tài khoản
                </span>
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-w-[80px]">
              Đóng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberSelectDialog;