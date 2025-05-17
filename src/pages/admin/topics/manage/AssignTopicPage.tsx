import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building, Info, Save, AlertCircle, X } from "lucide-react";
import { Topic } from "@/models/topic";
import { Department } from "@/models/department";
import { toast } from "@/hooks/use-toast";
import ViewTopic from "@/pages/topics/view/ViewTopic";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TopicService } from "@/service/topic-service";
import { DepartmentService } from "@/service/department-service";
import Loading from "@/components/loading/loading";
import { TopicStatus } from "@/models/enums/topic-status.enum";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const assignmentSchema = z.object({
    departmentId: z.string().min(1, { message: "Vui lòng chọn đơn vị phụ trách" }),
    notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function AssignTopicPage() {
    const [topic, setTopic] = useState<Topic | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssigned, setIsAssigned] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            departmentId: "",
            notes: "",
        },
    });

    const fetchDepartments = async () => {
        try {
            const response = await DepartmentService.getAll({
                p: 1,
                s: 10000,
                sort: "name",
                order: "asc",
                delFlag: false,
            });
            setDepartments(response.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn vị:", error);
            toast({
                title: "Lỗi khi tải dữ liệu",
                description: "Không thể tải danh sách đơn vị. Vui lòng thử lại.",
                variant: "error",
            });
        }
    };

    const fetchTopic = async () => {
        if (!id) return;

        try {
            const response = await TopicService.getById(id);
            if (response.status === 200 && response.data.code === 1000) {
                setTopic(response.data.data);
                setIsAssigned(!!response.data.data.department?.id);
                setIsFinalized(response.data.data.status === TopicStatus.APPROVED || response.data.data.status === TopicStatus.REJECTED);
                if (response.data.data.department?.id) {
                    form.setValue('departmentId', String(response.data.data.department.id));
                }
            } else {
                toast({
                    title: "Lỗi khi tải đề tài",
                    description: response.data.message || "Không thể tải thông tin đề tài. Vui lòng thử lại.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin đề tài:", error);
            toast({
                title: "Lỗi khi tải đề tài",
                description: "Không thể tải thông tin đề tài. Vui lòng thử lại.",
                variant: "error",
            });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchDepartments(), fetchTopic()]);
            setIsLoading(false);
        };
        loadData();
    }, [id]);

    const onSubmit = async (data: AssignmentFormValues) => {
        if (!id || isFinalized) return;

        setIsLoading(true);
        try {
            const response = await TopicService.assignToDepartment(id, {
                departmentId: data.departmentId,
                notes: data.notes || "",
            });

            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Phân công thành công",
                    description: `Đề tài đã được phân công cho ${departments.find(d => String(d.id) === data.departmentId)?.name}`,
                });
                setIsAssigned(true);
                await fetchTopic();
            } else {
                toast({
                    title: "Phân công thất bại",
                    description: response.data.message || "Đã xảy ra lỗi khi phân công đề tài.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Lỗi khi phân công đề tài:", error);
            toast({
                title: "Không thể phân công đề tài",
                description: "Đã xảy ra lỗi khi phân công đề tài. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnassign = async () => {
        if (!id || isFinalized) return;

        setIsLoading(true);
        try {
            const response = await TopicService.unassignDepartment(id);
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Gỡ phân công thành công",
                    description: "Đề tài đã được gỡ phân công. Bạn có thể chọn đơn vị mới.",
                });
                setIsAssigned(false);
                form.setValue('departmentId', '');
                await fetchTopic();
            } else {
                toast({
                    title: "Gỡ phân công thất bại",
                    description: response.data.message || "Đã xảy ra lỗi khi gỡ phân công.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Lỗi khi gỡ phân công:", error);
            toast({
                title: "Không thể gỡ phân công",
                description: "Đã xảy ra lỗi khi gỡ phân công. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    const handleBack = () => {
        navigate("/admin/topics");
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Phân công đề tài cho đơn vị</CardTitle>
                            <CardDescription>Chọn đơn vị phụ trách xử lý đề tài này</CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Building className="h-5 w-5" />
                                Phân công đề tài
                            </CardTitle>
                            <CardDescription>
                                Chọn đơn vị phù hợp để xử lý đề tài
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isAssigned && (
                                <div className="flex items-start gap-3 p-4 rounded-md bg-yellow-100 text-yellow-900 border border-yellow-300 shadow-sm mb-4">
                                    <AlertCircle className="h-5 w-5 mt-1 flex-shrink-0 text-yellow-700" />
                                    <div className="text-sm leading-relaxed">
                                        <p>
                                            <span className="font-semibold text-yellow-800">Đề tài này đã được phân công</span> cho đơn vị:
                                            <span className="font-bold text-yellow-900">{topic?.department?.name}</span>.
                                        </p>
                                        <p className="mt-1 text-yellow-800">
                                            Bạn có thể gỡ phân công để chọn đơn vị khác hoặc liên hệ quản trị viên.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(isFinalized) && (
                                <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 text-blue-700 mb-4">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p className="text-sm">
                                        Đề tài này đã được xử lý (phê duyệt hoặc từ chối) và không thể chỉnh sửa.
                                    </p>
                                </div>
                            )}

                            {!isAssigned && !isFinalized && (
                                <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 mb-4">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p className="text-sm">Vui lòng chọn đơn vị phụ trách đề tài này.</p>
                                </div>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="departmentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Đơn vị phụ trách <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                    disabled={isFinalized || isAssigned}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn đơn vị phụ trách" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {departments.map((department) => (
                                                            <SelectItem key={department.id} value={String(department.id)}>
                                                                {department.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Đơn vị được chọn sẽ nhận thông báo về việc phân công và tiếp tục xử lý đề tài này
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ghi chú</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Nhập ghi chú về việc phân công (nếu có)..."
                                                        {...field}
                                                        disabled={isFinalized}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Ghi chú sẽ được gửi kèm thông báo phân công đến đơn vị
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            className="flex items-center gap-2"
                                            disabled={isFinalized || form.formState.isSubmitting || isAssigned}
                                        >
                                            <Save className="h-4 w-4" />
                                            Phân công
                                        </Button>
                                        {isAssigned && !isFinalized && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="flex items-center gap-2"
                                                onClick={() => setIsDialogOpen(true)}
                                                disabled={form.formState.isSubmitting}
                                            >
                                                <X className="h-4 w-4" />
                                                Gỡ phân công
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="border rounded-md p-4 bg-gray-50">
                        <h2 className="text-2xl text-primary font-semibold leading-none tracking-tight mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Chi tiết đề tài</h2>
                        {id && <ViewTopic />}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận gỡ phân công</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn gỡ phân công đề tài khỏi đơn vị <strong>{topic?.department?.name}</strong>?
                            Hành động này sẽ cho phép chọn một đơn vị khác để phân công lại.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleUnassign}>
                            Gỡ phân công
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}