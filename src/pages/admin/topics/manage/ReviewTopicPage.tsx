import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Info, CheckCircle, Edit, AlertCircle, XCircle } from "lucide-react";
import { Topic } from "@/models/topic";
import { toast } from "@/hooks/use-toast";
import ViewTopic from "@/pages/topics/view/ViewTopic";
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
import { TopicStatus } from "@/models/enums/topic-status.enum";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const reviewSchema = z.object({
    status: z.enum([TopicStatus.REVIEWED, TopicStatus.NEED_REVISION], { message: "Vui lòng chọn trạng thái" }),
    notes: z.string().optional(),
}).refine((data) => data.status !== TopicStatus.NEED_REVISION || (data.status === TopicStatus.NEED_REVISION && data.notes && data.notes.length > 0), {
    message: "Vui lòng nhập yêu cầu thay đổi để gửi về người đăng ký",
    path: ["notes"],
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ReviewTopicPage() {
    const [topic, setTopic] = useState<Topic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessed, setIsProcessed] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [activeTab, setActiveTab] = useState<"reviewed" | "needRevision">("reviewed");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            status: TopicStatus.REVIEWED,
            notes: "",
        },
    });

    // Update form value when tab changes
    useEffect(() => {
        form.setValue("status", activeTab === "reviewed" ? TopicStatus.REVIEWED : TopicStatus.NEED_REVISION);
    }, [activeTab, form]);

    const fetchTopic = async () => {
        if (!id) return;

        try {
            const response = await TopicService.getById(id);
            if (response.status === 200 && response.data.code === 1000) {
                setTopic(response.data.data);
                const status = response.data.data.status;
                if (status === TopicStatus.APPROVED || status === TopicStatus.REJECTED) {
                    setIsProcessed(true);
                    setStatusMessage(
                        status === TopicStatus.APPROVED
                            ? "Đề tài đã được chấp nhận và không thể review."
                            : "Đề tài đã được từ chối và không thể review."
                    );
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTopic();
    }, [id]);

    const onSubmit = async (data: ReviewFormValues) => {
        if (!id || isProcessed) return;

        setIsLoading(true);
        try {
            const response = await TopicService.reviewTopic(id, {
                status: data.status,
                notes: data.notes || "",
            });

            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Review thành công",
                    description:
                        data.status === TopicStatus.REVIEWED
                            ? "Đề tài đã được chuyển sang bước tiếp theo."
                            : "Đề tài đã được trả về cho người đăng ký để chỉnh sửa.",
                });
                navigate("/admin/topics");
            } else {
                toast({
                    title: "Review thất bại",
                    description: response.data.message || "Đã xảy ra lỗi khi review đề tài.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Lỗi khi review đề tài:", error);
            toast({
                title: "Không thể review đề tài",
                description: "Đã xảy ra lỗi khi review đề tài. Vui lòng thử lại.",
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
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Review đề tài nghiên cứu</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Phòng QLKH&HTQT kiểm tra sơ bộ và đưa ra quyết định tiếp theo
                    </p>
                </div>
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Topic Details - Left Side (2/3) */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm border border-gray-100">
                        <CardHeader className="bg-primary/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-semibold text-primary">Chi tiết đề tài</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Thông tin chi tiết của đề tài nghiên cứu
                                </CardDescription>
                            </div>
                            {id && (
                                <Badge variant="outline" className="text-primary border-primary">
                                    Mã đề tài: #{id}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="p-6">
                            {id && <ViewTopic />}
                        </CardContent>
                    </Card>
                </div>

                {/* Review Panel - Right Side (1/3) */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-sm border border-gray-100">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
                                <Info className="h-5 w-5" />
                                Đánh giá đề tài
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                                Chọn kết quả đánh giá và gửi ghi chú cho người đăng ký (nếu cần)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5">
                            {isProcessed ? (
                                <div
                                    className={`flex items-center gap-2 p-3 rounded-md mb-4 ${topic?.status === TopicStatus.APPROVED
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                        }`}
                                >
                                    {topic?.status === TopicStatus.APPROVED ? (
                                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="h-5 w-5 flex-shrink-0" />
                                    )}
                                    <p className="text-sm">{statusMessage}</p>
                                </div>
                            ) : (
                                <Tabs
                                    defaultValue="reviewed"
                                    onValueChange={(value) => setActiveTab(value as "reviewed" | "needRevision")}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger
                                            value="reviewed"
                                            className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Đạt yêu cầu
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="needRevision"
                                            className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Cần chỉnh sửa
                                        </TabsTrigger>
                                    </TabsList>

                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            {/* REVIEWED TAB */}
                                            <TabsContent value="reviewed" className="space-y-4">
                                                <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 mb-4">
                                                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                                    <p className="text-sm font-medium">
                                                        Đề tài đáp ứng yêu cầu và sẽ chuyển sang bước phân công.
                                                    </p>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="notes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Ghi chú cho người đăng ký (tuỳ chọn)</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Ví dụ: Đề tài phù hợp với tiêu chí, chờ phân công đơn vị phụ trách..."
                                                                    {...field}
                                                                    className="min-h-32"
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Nội dung này sẽ được gửi kèm thông báo đến người đăng ký.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    disabled={form.formState.isSubmitting}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Xác nhận đạt yêu cầu
                                                </Button>
                                            </TabsContent>

                                            {/* NEED REVISION TAB */}
                                            <TabsContent value="needRevision" className="space-y-4">
                                                <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-50 text-yellow-700 mb-4">
                                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                                    <p className="text-sm font-medium">
                                                        Đề tài cần được chỉnh sửa trước khi có thể tiếp tục.
                                                    </p>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="notes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Góp ý chỉnh sửa <span className="text-destructive">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Ví dụ: Cần mô tả rõ hơn về phương pháp thực hiện, bổ sung căn cứ khoa học..."
                                                                    {...field}
                                                                    className="min-h-32"
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Nội dung góp ý sẽ được gửi đến người đăng ký để chỉnh sửa và nộp lại.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                                                    disabled={form.formState.isSubmitting}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Gửi góp ý chỉnh sửa
                                                </Button>
                                            </TabsContent>

                                        </form>
                                    </Form>
                                </Tabs>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}