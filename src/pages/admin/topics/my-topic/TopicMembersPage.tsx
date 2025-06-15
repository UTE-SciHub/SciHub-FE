import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Save,
    Search,
    Trash2,
    Users,
    Check,
    UserPlus,
    Crown,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MemberSelectDialog from "./MemberSelectDialog";
import { toast } from "@/hooks/use-toast";
import { TopicMemberRole, type TopicMember, getPrincipalInvestigatorName } from "@/models/topic-member";
import type { User as UserModel } from "@/models/user";
import type { Topic } from "@/models/topic";
import { TopicService } from "@/service/topic-service";
import { UserService } from "@/service/user-service";
import Loading from "@/components/loading/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitialsAvt } from "@/utils/common";
import DataTable from "@/components/data-table/data-table";

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const topicMemberFormSchema = z.object({
    members: z
        .array(
            z.object({
                userId: z.string(),
                role: z.nativeEnum(TopicMemberRole),
            }),
        )
        .min(1, "Đề tài phải có ít nhất một thành viên"),
});

export default function TopicMembersPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [topicMembers, setTopicMembers] = useState<Array<{ user: UserModel; role: TopicMemberRole }>>([]);
    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState<UserModel[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userPage, setUserPage] = useState(1);
    const [userPageSize, setUserPageSize] = useState(10);
    const [userTotal, setUserTotal] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedRoles, setSelectedRoles] = useState<Record<string, TopicMemberRole>>({});
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof topicMemberFormSchema>>({
        resolver: zodResolver(topicMemberFormSchema),
        defaultValues: {
            members: [],
        },
    });

    const debouncedMemberSearchTerm = useDebounce(memberSearchTerm, 500);

    // Initialize form with topicMembers data after fetching
    useEffect(() => {
        const fetchTopicData = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const response = await TopicService.getById(id);
                const topicData = response.data.data;

                setTopic(topicData);

                // Set topic members if they exist
                if (topicData.members && topicData.members.length > 0) {
                    const members = topicData.members.map((member: TopicMember) => ({
                        user: member.user,
                        role: member.role,
                    }));
                    setTopicMembers(members);
                    // Initialize form with members
                    form.setValue(
                        "members",
                        members.map((member) => ({
                            userId: member.user.id,
                            role: member.role,
                        })),
                    );
                }
            } catch (error) {
                console.error("Error fetching topic data:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin đề tài. Vui lòng thử lại.",
                    variant: "error",
                });
                navigate("/admin/topics");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopicData();
    }, [id, navigate, form]);

    // Sync topicMembers with form state
    useEffect(() => {
        form.setValue(
            "members",
            topicMembers.map((member) => ({
                userId: member.user.id,
                role: member.role,
            })),
        );
    }, [topicMembers, form]);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const response = await UserService.getUsers({
                    q: debouncedMemberSearchTerm,
                    p: userPage,
                    s: userPageSize,
                });
                const users = Array.isArray(response.data.data) ? response.data.data : [];
                setFilteredUsers(users);
                setUserTotal(response.data.totalPages || 0);
                setTotalItems(response.data.totalItems || 0);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải danh sách người dùng. Vui lòng thử lại.",
                    variant: "error",
                });
                setFilteredUsers([]);
                setUserTotal(0);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [debouncedMemberSearchTerm, userPage, userPageSize]);

    const isUserMember = (userId: string) => {
        return topicMembers.some((member) => member.user.id === userId);
    };

    const handleUserPageChange = (page: number) => setUserPage(page);
    const handleUserPageSizeChange = (size: number) => {
        setUserPageSize(size);
        setUserPage(1);
    };

    const addMember = (user: UserModel, userId: string) => {
        if (!isUserMember(userId)) {
            const role = selectedRoles[userId] || TopicMemberRole.MEMBER;
            setTopicMembers([...topicMembers, { user, role }]);
            setMemberSearchTerm("");
        }
    };

    const removeMember = (userId: string) => {
        setTopicMembers(topicMembers.filter((member) => member.user.id !== userId));
    };

    const updateMemberRole = (userId: string, role: TopicMemberRole) => {
        setTopicMembers(
            topicMembers.map((member) => (member.user.id === userId ? { ...member, role } : member)),
        );
    };

    const updateSelectedRole = (userId: string, role: TopicMemberRole) => {
        setSelectedRoles((prev) => ({
            ...prev,
            [userId]: role,
        }));
    };

    const getRoleBadge = (role: TopicMemberRole) => {
        switch (role) {
            case TopicMemberRole.INVESTIGATOR:
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Crown className="h-3 w-3 mr-1" />
                        Chủ nhiệm
                    </Badge>
                );
            case TopicMemberRole.MEMBER:
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        <User className="h-3 w-3 mr-1" />
                        Thành viên
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không xác định</Badge>;
        }
    };

    const getRoleText = (role: TopicMemberRole) => {
        switch (role) {
            case TopicMemberRole.INVESTIGATOR:
                return "Chủ nhiệm";
            case TopicMemberRole.MEMBER:
                return "Thành viên";
            default:
                return "Không xác định";
        }
    };

    const onSubmit = async (data: z.infer<typeof topicMemberFormSchema>) => {
        if (topicMembers.length === 0) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng thêm ít nhất một thành viên vào đề tài",
                variant: "error",
            });
            return;
        }

        const hasInvestigator = topicMembers.some((member) => member.role === TopicMemberRole.INVESTIGATOR);
        if (!hasInvestigator) {
            toast({
                title: "Thiếu thông tin",
                description: "Đề tài phải có ít nhất một chủ nhiệm",
                variant: "error",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const memberData = {
                members: topicMembers.map((member) => ({
                    userId: member.user.id,
                    role: member.role,
                })),
            };

            const result = await TopicService.updateMembers(id!, memberData);
            if (result.status === 200 && result.data.code === 1000) {
                toast({
                    title: "Thành công",
                    description: "Thành viên đề tài đã được cập nhật thành công",
                    variant: "success",
                });
            } else {
                toast({
                    title: "Lỗi",
                    description: result.data.message || "Có lỗi xảy ra khi cập nhật thành viên. Vui lòng thử lại.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error updating topic members:", error);
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi cập nhật thành viên. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
            setIsConfirmDialogOpen(false);
        }
    };

    const sortedMembers = [...topicMembers].sort((a, b) => {
        if (a.role === TopicMemberRole.INVESTIGATOR && b.role !== TopicMemberRole.INVESTIGATOR) return -1;
        if (a.role !== TopicMemberRole.INVESTIGATOR && b.role === TopicMemberRole.INVESTIGATOR) return 1;
        return 0;
    });

    if (isLoading || isLoadingUsers || isSubmitting) {
        return <Loading onCancel={() => navigate("/admin/topics")} />;
    }

    if (!topic) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm text-center max-w-md">
                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đề tài</h2>
                        <p className="text-gray-500 mb-6">Đề tài bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button onClick={() => navigate("/admin/topics")} className="mx-auto">
                            <ChevronLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => navigate(`/admin/topics/${id}`)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Quay lại</span>
                    </Button>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/")}>
                            Trang chủ
                        </span>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/admin/topics")}>
                            Đề tài
                        </span>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate(-1)}>
                            Chi tiết đề tài
                        </span>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="font-medium text-gray-900">Quản lý thành viên</span>
                    </div>
                </div>
            </div>

            {/* Topic Info Header */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-900">{topic.vietnameseName}</CardTitle>
                            <CardDescription className="mt-1 text-gray-600">
                                Mã đề tài: <span className="font-medium">{topic.topicCode}</span>
                            </CardDescription>
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                    Chủ nhiệm hiện tại: <span className="font-medium">{getPrincipalInvestigatorName(topic)}</span>
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-white">
                            {topic.field?.name || "Chưa phân loại"}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Members Management */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Quản lý thành viên đề tài
                    </CardTitle>
                    <CardDescription>Thêm, xóa và phân công vai trò cho các thành viên trong đề tài</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={(e) => { e.preventDefault(); setIsConfirmDialogOpen(true); }} className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium">Danh sách thành viên</h3>
                                    <p className="text-sm text-slate-500">Quản lý thành viên và vai trò trong đề tài</p>
                                </div>
                                <Button type="button" onClick={() => setIsMemberDialogOpen(true)}>
                                    <Plus className="h-4 w-4" />
                                    Thêm thành viên
                                </Button>
                            </div>

                            {form.formState.errors.members && (
                                <FormMessage className="text-red-500">{form.formState.errors.members.message}</FormMessage>
                            )}

                            {topicMembers.length > 0 ? (
                                <div className="border rounded-md">
                                    <DataTable
                                        columns={[
                                            {
                                                key: "member",
                                                title: "Thành viên",
                                                width: "260px",
                                                render: (_: any, record: any) => (
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={record.user.imageUrl || "/avatar-default.jpg"}
                                                                alt={record.user.name}
                                                            />
                                                            <AvatarFallback>{getInitialsAvt(record.user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{record.user.name}</div>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                key: "email",
                                                title: "Email",
                                                width: "220px",
                                                render: (_: any, record: any) => record.user.email,
                                            },
                                            {
                                                key: "role",
                                                title: "Vai trò",
                                                width: "180px",
                                                render: (value: any, record: any) => (
                                                    <Select
                                                        value={record.role}
                                                        onValueChange={(value) => updateMemberRole(record.user.id, value as TopicMemberRole)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={TopicMemberRole.INVESTIGATOR}>
                                                                <div className="flex items-center">
                                                                    Chủ nhiệm
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value={TopicMemberRole.MEMBER}>
                                                                <div className="flex items-center">
                                                                    Thành viên
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ),
                                            },
                                            {
                                                key: "actions",
                                                title: "Thao tác",
                                                width: "80px",
                                                render: (_: any, record: any) => (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeMember(record.user.id)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                ),
                                                align: "center"
                                            },
                                        ]}
                                        data={sortedMembers}
                                        loading={isLoading}
                                        rowKey={(record: any) => record.user.id}
                                        pagination={false}
                                    />
                                </div>
                            ) : (
                                <div className="border rounded-md p-8 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                        <Users className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có thành viên nào</h3>
                                    <p className="text-slate-500 max-w-md mx-auto mb-4">
                                        Vui lòng thêm thành viên và phân công vai trò trong đề tài
                                    </p>
                                    <Button type="button" onClick={() => setIsMemberDialogOpen(true)}>
                                        <Plus className="h-4 w-4" />
                                        Thêm thành viên
                                    </Button>
                                </div>
                            )}

                            <div className="flex justify-between pt-6 border-t">
                                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                    <ChevronLeft className="h-4 w-4" />
                                    Quay lại
                                </Button>
                                <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Lưu thay đổi
                                                </>
                                            )}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận lưu thay đổi</DialogTitle>
                                            <DialogDescription>
                                                Bạn có chắc chắn muốn lưu các thay đổi về thành viên đề tài? Hành động này không thể hoàn tác.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                                                Hủy
                                            </Button>
                                            <Button
                                                onClick={() => form.handleSubmit(onSubmit)()}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Đang lưu...
                                                    </>
                                                ) : (
                                                    "Xác nhận"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <MemberSelectDialog
                open={isMemberDialogOpen}
                onOpenChange={setIsMemberDialogOpen}
                memberSearchTerm={memberSearchTerm}
                setMemberSearchTerm={setMemberSearchTerm}
                isLoadingUsers={isLoadingUsers}
                filteredUsers={filteredUsers}
                selectedRoles={selectedRoles}
                updateSelectedRole={updateSelectedRole}
                isUserMember={isUserMember}
                addMember={addMember}
                userPage={userPage}
                userPageSize={userPageSize}
                userTotal={userTotal}
                totalItems={totalItems}
                onUserPageChange={handleUserPageChange}
                onUserPageSizeChange={handleUserPageSizeChange}
            />
        </div>
    );
}