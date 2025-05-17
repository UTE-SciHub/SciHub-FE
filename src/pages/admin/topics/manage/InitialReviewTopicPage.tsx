import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, Info, AlertCircle, Edit, AlertTriangle } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TopicStatus } from "@/models/enums/topic-status.enum";
import { Topic } from "@/models/topic";

const manageSchema = z.object({
    action: z.enum(["approve", "reject"], { message: "Vui lòng chọn hành động" }),
    notes: z.string().optional(),
}).refine((data) => data.action !== "reject" || (data.action === "reject" && data.notes && data.notes.length > 0), {
    message: "Vui lòng nhập lý do từ chối",
    path: ["notes"],
});

type ManageFormValues = z.infer<typeof manageSchema>;

export default function InitialReviewTopicPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"approve" | "reject">("approve");
    const [topic, setTopic] = useState<Topic | null>(null);
    const [isProcessed, setIsProcessed] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const form = useForm<ManageFormValues>({
        resolver: zodResolver(manageSchema),
        defaultValues: {
            action: "approve",
            notes: "",
        },
    });

    useEffect(() => {
        form.setValue("action", activeTab);
    }, [activeTab, form]);

    const fetchTopic = async () => {
        if (!id) return;

        try {
            const response = await TopicService.getById(id);
            if (response.status === 200 && response.data.code === 1000) {
                setTopic(response.data.data);
                const status = response.data.data.status;
                if (status === TopicStatus.APPROVED) {
                    setIsProcessed(true);
                    setStatusMessage("Đề tài đã được chấp nhận.");
                } else if (status === TopicStatus.REJECTED) {
                    setIsProcessed(true);
                    setStatusMessage("Đề tài đã được từ chối.");
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

    const onSubmit = async (data: ManageFormValues) => {
        if (!id || isProcessed) return;

        setIsLoading(true);
        try {
            let response;
            if (data.action === "approve") {
                response = await TopicService.approveTopic(id, {
                    notes: data.notes || "",
                });
            } else if (data.action === "reject") {
                response = await TopicService.rejectTopic(id, {
                    notes: data.notes || "",
                });
            }

            if (response && response.status === 200 && response.data.code === 1000) {
                toast({
                    title: `${data.action === "approve" ? "Phê duyệt" : "Từ chối"} thành công`,
                    description: `Đề tài đã được ${data.action === "approve" ? "phê duyệt" : "từ chối"} thành công.`,
                });
                navigate("/admin/topics");
            } else {
                toast({
                    title: `${data.action === "approve" ? "Phê duyệt" : "Từ chối"} thất bại`,
                    description: response?.data.message || `Đã xảy ra lỗi khi ${data.action === "approve" ? "phê duyệt" : "từ chối"} đề tài.`,
                    variant: "error",
                });
            }
        } catch (error) {
            console.error(`Lỗi khi ${form.getValues("action") === "approve" ? "phê duyệt" : "từ chối"} đề tài:`, error);
            toast({
                title: `Không thể ${form.getValues("action") === "approve" ? "phê duyệt" : "từ chối"} đề tài`,
                description: `Đã xảy ra lỗi khi ${form.getValues("action") === "approve" ? "phê duyệt" : "từ chối"} đề tài. Vui lòng thử lại.`,
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
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý đề tài</h1>
                    <p className="text-sm text-muted-foreground">
                        Phê duyệt hoặc từ chối đề tài nghiên cứu khoa học
                    </p>
                </div>
                <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Topic Details - Left Side (2/3) */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm">
                        <CardHeader className="bg-primary/5 pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Chi tiết đề tài</CardTitle>
                                <CardDescription>Thông tin chi tiết của đề tài nghiên cứu</CardDescription>
                            </div>
                            {id && (
                                <Badge variant="outline" className="text-primary border-primary">
                                    #{id}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {id && <ViewTopic />}
                        </CardContent>
                    </Card>
                </div>

                {/* Decision Panel - Right Side (1/3) */}
                <div className="lg:col-span-1 relative">
                    <div className="lg:sticky lg:top-20">
                        <Card>
                            <CardHeader className="bg-primary/5 pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" />
                                    Hành động xử lý
                                </CardTitle>
                                <CardDescription>
                                    Xác nhận hoặc gửi yêu cầu điều chỉnh đề tài này
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-5">
                                {isProcessed ? (
                                    <div className={`flex items-center gap-2 p-3 rounded-md mb-4 ${topic?.status === TopicStatus.APPROVED ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                        }`}>
                                        {topic?.status === TopicStatus.APPROVED ? (
                                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-5 w-5 flex-shrink-0" />
                                        )}
                                        <p className="text-sm">{statusMessage}</p>
                                    </div>
                                ) : (
                                    <Tabs
                                        defaultValue="approve"
                                        onValueChange={(value) => setActiveTab(value as "approve" | "reject")}
                                        className="w-full"
                                    >
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
                                            <TabsTrigger
                                                value="approve"
                                                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Xác nhận
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="reject"
                                                className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700"
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Điều chỉnh
                                            </TabsTrigger>
                                        </TabsList>

                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <TabsContent value="approve" className="space-y-4">
                                                    <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 mb-4">
                                                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                                        <p className="text-sm">Xác nhận đề tài này để tiến hành các bước tiếp theo</p>
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="notes"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Ghi chú xác nhận (không bắt buộc)</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Nhập ghi chú về việc xác nhận (nếu có)..."
                                                                        {...field}
                                                                        className="min-h-32"
                                                                    />
                                                                </FormControl>
                                                                <FormDescription>
                                                                    Ghi chú sẽ được gửi kèm thông báo xác nhận đến đơn vị
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
                                                        Xác nhận đề tài
                                                    </Button>
                                                </TabsContent>

                                                <TabsContent value="reject" className="space-y-4">
                                                    <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-50 text-yellow-700 mb-4">
                                                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                                        <p className="text-sm">Đề tài cần được điều chỉnh.</p>
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="notes"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Lý do điều chỉnh <span className="text-destructive">*</span></FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Vui lòng nhập lý do điều chỉnh đề tài..."
                                                                        {...field}
                                                                        className="min-h-32"
                                                                    />
                                                                </FormControl>
                                                                <FormDescription>
                                                                    Lý do điều chỉnh sẽ được gửi kèm thông báo đến đơn vị
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
                                                        Điều chỉnh đề tài
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
        </div>
    );
}