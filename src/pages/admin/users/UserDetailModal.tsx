import type React from "react"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Mail, Phone, Shield, UserCog, KeyRound, UserCheck, UserX, Loader2, X } from "lucide-react"
import { User } from "@/models/user"
import { UserStatus } from "@/models/enums/user-status"
import { formatDate, formatDateTime } from "@/utils/dateTimeFormat"
import { toast } from "@/hooks/use-toast"
import { getInitialsAvt } from "@/utils/common"

interface UserDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
    onStatusChange?: (userId: string, newStatus: UserStatus) => Promise<Boolean>
    onResetPassword?: (userId: string) => Promise<void>
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
    open,
    onOpenChange,
    user,
    onStatusChange,
    onResetPassword,
}) => {
    const [isChangingStatus, setIsChangingStatus] = useState(false)
    const [isResettingPassword, setIsResettingPassword] = useState(false)
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    const [isActive, setIsActive] = useState(user?.status === UserStatus.ACTIVE)

    useEffect(() => {
        setIsActive(user?.status === UserStatus.ACTIVE)
    }, [user])

    const [statusChangeConfirm, setStatusChangeConfirm] = useState(false)

    const handleStatusToggle = (checked: boolean) => {
        if (!onStatusChange) return

        setStatusChangeConfirm(true)
    }

    const handleStatusChange = async () => {
        if (!onStatusChange) return

        setIsChangingStatus(true)
        try {
            const newStatus = isActive ? UserStatus.BLOCKED : UserStatus.ACTIVE
            const isSuccess = await onStatusChange(user.id, newStatus)

            if (isSuccess) {
                setIsActive(newStatus === UserStatus.ACTIVE)
            }
        } catch (error) {

        } finally {
            setIsChangingStatus(false)
            setStatusChangeConfirm(false)
        }
    }

    const handleResetPassword = async () => {
        if (!onResetPassword) return

        setIsResettingPassword(true)
        try {
            await onResetPassword(user.id)

            setShowResetConfirm(false)
        } catch (error) {
            console.error("Error resetting password:", error)
        } finally {
            setIsResettingPassword(false)
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Quản trị viên</Badge>
            case "TEACHER":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Giảng viên</Badge>
            case "STUDENT":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Sinh viên</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{role}</Badge>
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Thông tin người dùng</DialogTitle>
                        <DialogDescription>Chi tiết thông tin và tài khoản của người dùng</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* User header with avatar and basic info */}
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            <Avatar className="h-24 w-24 border">
                                <AvatarImage src={user?.imageUrl || undefined} alt={user?.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                    {getInitialsAvt(user?.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="space-y-2 text-center sm:text-left flex-1">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                        {user?.roles.map((role) => getRoleBadge(role.name))}
                                        <Badge
                                            variant="outline"
                                            className={
                                                isActive
                                                    ? "bg-green-50 text-green-600 border-green-200"
                                                    : "bg-red-50 text-red-600 border-red-200"
                                            }
                                        >
                                            {isActive
                                                ? "Đã kích hoạt"
                                                : "Đã khóa"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{user?.email}</span>
                                </div>

                                {user?.phoneNumber && (
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{user?.phoneNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                                <UserCog className="h-5 w-5 text-primary" />
                                Thông tin tài khoản
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">ID người dùng</p>
                                    <p className="font-medium">{user?.id}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                                    <div className="flex items-center gap-3">
                                        <Switch checked={isActive} onCheckedChange={handleStatusToggle} disabled={isChangingStatus} />
                                        <span className="font-medium">
                                            {isChangingStatus ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Đang xử lý...
                                                </span>
                                            ) : isActive ? (
                                                <span className="flex items-center gap-2 text-green-600">
                                                    <UserCheck className="h-4 w-4" />
                                                    Đã kích hoạt
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-red-600">
                                                    <UserX className="h-4 w-4" />
                                                    Đã khóa
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Vai trò</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user?.roles.map((role, index) => (
                                            <Badge key={index} variant="outline" className="bg-primary/5">
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Đăng nhập gần nhất</p>
                                    <p className="font-medium">{formatDateTime(user?.lastLogin ?? null)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                Thông tin cá nhân
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Giới tính</p>
                                    <p className="font-medium">{user?.gender || "Chưa cập nhật"}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Ngày sinh</p>
                                    <p className="font-medium">{formatDate(user?.dob ?? null)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button className="text-rose-500" variant="outline" onClick={() => onOpenChange(false)}>
                            <X className="h-4 w-4" />
                            Đóng
                        </Button>
                        <Button variant="outline" onClick={() => setShowResetConfirm(true)} disabled={isResettingPassword}>
                            <KeyRound className="h-4 w-4" />
                            Đặt lại mật khẩu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Confirmation Dialog */}
            <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Đặt lại mật khẩu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng <span className="font-medium">{user?.name}</span>?
                            <br />
                            Mật khẩu mới sẽ được gửi đến email của người dùng.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResettingPassword}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleResetPassword()
                            }}
                            disabled={isResettingPassword}
                            className="bg-primary"
                        >
                            {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isResettingPassword ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Change Status Confirmation Dialog */}
            <AlertDialog open={statusChangeConfirm} onOpenChange={setStatusChangeConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn {isActive ? "khóa" : "mở khóa"} tài khoản của người dùng{" "}
                            <span className="font-medium">{user?.name}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResettingPassword}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleStatusChange()
                            }}
                            disabled={isResettingPassword}
                            className="bg-primary"
                        >
                            {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isResettingPassword ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default UserDetailModal