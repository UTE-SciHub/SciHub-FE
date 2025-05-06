import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, Edit, Send, FileText } from "lucide-react";
import { Topic } from "@/models/topic";
import { toast } from "@/hooks/use-toast";
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
import Loading from "@/components/loading/loading";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopicStatus } from "@/models/enums/topic-status.enum";

// Schema cho việc xác định danh mục đề tài
const evaluateSchema = z.object({
    categoryStatus: z.enum([TopicStatus.APPROVED, TopicStatus.REJECTED, TopicStatus.NEED_REVISION], {
        message: "Vui lòng chọn trạng thái danh mục",
    }),
    notes: z.string().optional(),
}).refine(
    (data) =>
        data.categoryStatus !== TopicStatus.NEED_REVISION ||
        (data.categoryStatus === TopicStatus.NEED_REVISION && data.notes && data.notes.length > 0),
    {
        message: "Vui lòng nhập lý do cần chỉnh sửa",
        path: ["notes"],
    }
);

type EvaluateFormValues = z.infer<typeof evaluateSchema>;

export default function EvaluateTopicPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const form = useForm<EvaluateFormValues>({
        resolver: zodResolver(evaluateSchema),
        defaultValues: {
            categoryStatus: TopicStatus.APPROVED,
            notes: "",
        },
    });

    const fetchTopics = async () => {
        try {
            const response = await TopicService.getAll({
                status: TopicStatus.REVIEWED,
                p: 1,
                s: 100,
                sort: "createdAt",
                order: "desc",
            });
            if (response.status === 200 && response.data.code === 1000) {
                setTopics(response.data.data);
            } else {
                toast({
                    title: "Lỗi khi tải danh sách đề tài",
                    description: response.data.message || "Không thể tải danh sách đề tài. Vui lòng thử lại.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đề tài:", error);
            toast({
                title: "Lỗi khi tải danh sách đề tài",
                description: "Không thể tải danh sách đề tài. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    const onSubmit = async (data: EvaluateFormValues, topicId: string) => {
        setIsLoading(true);
        try {
            // const response = await TopicService.evaluateTopic(topicId, {
            //     categoryStatus: data.categoryStatus,
            //     notes: data.notes || "",
            // });

            // if (response.status === 200 && response.data.code === 1000) {
            //     toast({
            //         title: "Xác định danh mục thành công",
            //         description: `Đề tài đã được phân loại: ${data.categoryStatus === TopicStatus.APPROVED ? "Đạt" : data.categoryStatus === TopicStatus.REJECTED ? "Không đạt" : "Cần chỉnh sửa"}`,
            //     });
            //     // Cập nhật lại danh sách
            //     fetchTopics();
            // } else {
            //     toast({
            //         title: "Xác định danh mục thất bại",
            //         description: response.data.message || "Đã xảy ra lỗi khi xác định danh mục đề tài.",
            //         variant: "error",
            //     });
            // }
        } catch (error) {
            console.error("Lỗi khi xác định danh mục đề tài:", error);
            toast({
                title: "Không thể xác định danh mục",
                description: "Đã xảy ra lỗi khi xác định danh mục đề tài. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublishCategories = async () => {
        setIsLoading(true);
        try {
            const response = await TopicService.publishCategories();
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Gửi danh mục thành công",
                    description: "Danh mục đề tài đã được gửi đến các đơn vị và CNĐT.",
                });
                navigate("/admin/topics");
            } else {
                toast({
                    title: "Gửi danh mục thất bại",
                    description: response.data.message || "Đã xảy ra lỗi khi gửi danh mục đề tài.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Lỗi khi gửi danh mục đề tài:", error);
            toast({
                title: "Không thể gửi danh mục",
                description: "Đã xảy ra lỗi khi gửi danh mục đề tài. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/admin/topics");
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Xác định danh mục đề tài</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Phòng QLKH&HTQT xác định danh mục đề tài và gửi về các đơn vị, CNĐT
                    </p>
                </div>
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </div>

            {/* Topics List */}
            <Card className="shadow-sm border border-gray-100">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-xl font-semibold text-primary">Danh sách đề tài</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Xác định danh mục cho từng đề tài trước khi gửi về các đơn vị và CNĐT
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {topics.length === 0 ? (
                        <p className="text-center text-muted-foreground">Không có đề tài nào cần xác định danh mục.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Tên đề tài</TableHead>
                                    <TableHead>Người đăng ký</TableHead>
                                    <TableHead>Trạng thái danh mục</TableHead>
                                    <TableHead className="w-[300px]">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topics.map((topic, index) => (
                                    <TableRow key={topic.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{topic.vietnameseName}</TableCell>
                                        <TableCell>{topic.principalInvestigator || ""}</TableCell>
                                        {/* <TableCell>
                                            {topic.categoryStatus ? (
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${topic.categoryStatus === TopicStatus.APPROVED
                                                        ? "bg-green-100 text-green-800"
                                                        : topic.categoryStatus === TopicStatus.REJECTED
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {topic.categoryStatus === TopicStatus.APPROVED
                                                        ? "Đạt"
                                                        : topic.categoryStatus === TopicStatus.REJECTED
                                                            ? "Không đạt"
                                                            : "Cần chỉnh sửa"}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">Chưa xác định</span>
                                            )}
                                        </TableCell> */}
                                        <TableCell>
                                            <Form {...form}>
                                                <form
                                                    onSubmit={form.handleSubmit((data) => onSubmit(data, topic.id))}
                                                    className="flex items-center gap-2"
                                                >
                                                    <FormField
                                                        control={form.control}
                                                        name="categoryStatus"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                    value={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="w-[150px]">
                                                                            <SelectValue placeholder="Chọn trạng thái" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value={TopicStatus.APPROVED}>
                                                                            Đạt
                                                                        </SelectItem>
                                                                        <SelectItem value={TopicStatus.REJECTED}>
                                                                            Không đạt
                                                                        </SelectItem>
                                                                        <SelectItem value={TopicStatus.NEED_REVISION}>
                                                                            Cần chỉnh sửa
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="notes"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Ghi chú (nếu có)..."
                                                                        {...field}
                                                                        className="w-[200px] h-10 resize-none"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <Button
                                                        type="submit"
                                                        className="bg-primary hover:bg-primary/90 text-white"
                                                        disabled={form.formState.isSubmitting}
                                                    >
                                                        Xác định
                                                    </Button>
                                                </form>
                                            </Form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                {topics.length > 0 && (
                    <div className="p-6 border-t border-gray-100">
                        <Button
                            onClick={handlePublishCategories}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        // disabled={topics.some((topic) => !topic.categoryStatus)}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Gửi danh mục đề tài
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}