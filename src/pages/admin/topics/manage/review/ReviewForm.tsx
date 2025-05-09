import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Topic } from "@/models/topic";
import { ChevronRight } from "lucide-react";

const reviewSchema = z.object({
    councilDate: z.string().min(1, "Vui lòng chọn ngày họp"),
    meetingLocation: z.string().min(1, "Vui lòng nhập địa điểm"),
    councilDecisionNumber: z.string().min(1, "Vui lòng nhập số quyết định thành lập hội đồng"),
    totalMembers: z.number().min(1, "Tổng số thành viên phải lớn hơn 0"),
    totalPresent: z.number().min(0, "Số thành viên có mặt không được âm"),
    totalAbsent: z.number().min(0, "Số thành viên vắng mặt không được âm"),
    guests: z.string().optional().refine((val) => !val || val.length >= 5, {
        message: "Danh sách khách mời phải có ít nhất 5 ký tự nếu điền",
    }),
    approveCount: z.number().min(0, "Số phiếu đạt không được âm"),
    rejectCount: z.number().min(0, "Số phiếu không đạt không được âm"),
    approved: z.boolean(),
    passedCriteria: z.array(z.string()).optional(),
    comments: z.object({
        topicName: z.string().optional(),
        objectives: z.string().optional(),
        content: z.string().optional(),
        products: z.string().optional(),
        budget: z.string().optional(),
        additionalNotes: z.string().optional(),
    }),
}).refine((data) => data.totalPresent + data.totalAbsent === data.totalMembers, {
    message: "Tổng số thành viên có mặt và vắng mặt phải bằng tổng số thành viên",
    path: ["totalPresent"],
}).refine((data) => data.approveCount + data.rejectCount === data.totalPresent, {
    message: "Tổng số phiếu đạt và không đạt phải bằng số thành viên có mặt",
    path: ["approveCount"],
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    topic: Topic;
    onNextStep: (data: any) => void;
}

export default function ReviewForm({ topic, onNextStep }: ReviewFormProps) {
    const [formData, setFormData] = useState<ReviewFormValues | null>(null);

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: formData || {
            councilDate: new Date().toISOString().split('T')[0],
            meetingLocation: "Phòng họp Khoa học Công nghệ - Đại học Sư phạm Kỹ thuật Đà Nẵng",
            councilDecisionNumber: "",
            totalMembers: 1,
            totalPresent: 0,
            totalAbsent: 0,
            guests: "",
            approveCount: 0,
            rejectCount: 0,
            approved: false,
            passedCriteria: [],
            comments: {
                topicName: "",
                objectives: "",
                content: "",
                products: "",
                budget: "",
                additionalNotes: "",
            },
        },
    });

    useEffect(() => {
        if (formData) {
            form.reset(formData);
        }
    }, [formData, form]);

    useEffect(() => {
        const totalMembers = form.getValues("totalMembers");
        const totalPresent = form.getValues("totalPresent");
        const absent = Math.max(0, totalMembers - totalPresent);
        form.setValue("totalAbsent", absent, { shouldValidate: true });
    }, [form.watch("totalMembers"), form.watch("totalPresent"), form]);

    useEffect(() => {
        const totalPresent = form.getValues("totalPresent");
        const approveCount = form.getValues("approveCount");
        const reject = Math.max(0, totalPresent - approveCount);
        form.setValue("rejectCount", reject, { shouldValidate: true });
    }, [form.watch("totalPresent"), form.watch("approveCount"), form]);

    const onSubmit = (data: ReviewFormValues) => {
        setFormData(data);
        onNextStep(data);
    };

    return (
        <div className="p-6" style={{ fontFamily: "Times New Roman" }}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm">ĐẠI HỌC ĐÀ NẴNG</p>
                            <p className="text-sm font-semibold">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
                            <p className="text-center mt-6 font-semibold">BIÊN BẢN HỌP HỘI ĐỒNG XÁC ĐỊNH DANH MỤC</p>
                            <p className="text-center font-semibold">ĐỀ TÀI KHOA HỌC & CÔNG NGHỆ CẤP TRƯỜNG</p>
                        </div>

                        <div className="space-y-4 mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium">1. Tên đề tài:</p>
                                    <p className="ml-4">{topic.vietnameseName}</p>
                                </div>
                                <div>
                                    <p className="font-medium">2. Chủ nhiệm đề tài:</p>
                                    <p className="ml-4">{topic.principalInvestigator}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="councilDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>3. Ngày họp:</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="meetingLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Địa điểm:</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nhập địa điểm họp" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="font-medium">4. Quyết định thành lập hội đồng số:</p>
                                <FormField
                                    control={form.control}
                                    name="councilDecisionNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} placeholder="Số quyết định" className="mt-2" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="totalMembers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>5. Thành viên Hội đồng: Tổng số:</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    min={0}
                                                    placeholder="Số thành viên"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="totalPresent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Có mặt:</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value) || 0))}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="totalAbsent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Vắng mặt:</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                        readOnly
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="font-medium">6. Khách mời dự:</p>
                                <FormField
                                    control={form.control}
                                    name="guests"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} placeholder="Nhập danh sách khách mời (nếu có)" className="mt-2" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <p className="font-medium">7. Kết quả bỏ phiếu đánh giá:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                                    <FormField
                                        control={form.control}
                                        name="approveCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số phiếu đánh giá ở mức "Đạt":</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="rejectCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số phiếu đánh giá ở mức "Không đạt":</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                        readOnly
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="ml-4 flex items-center space-x-4">
                                    <p>Điểm số chung:</p>
                                    <FormField
                                        control={form.control}
                                        name="approved"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        id="approved"
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel htmlFor="approved">Đạt</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <p className="text-xs italic ml-4">
                                    Ghi chú: Đánh giá chung được xếp loại "Đạt" nếu trên 2/3 thành viên có mặt của hội đồng xếp loại "Đạt"
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="font-medium">8. Kết luận của Hội đồng:</p>
                                <div className="ml-4">
                                    <FormField
                                        control={form.control}
                                        name="approved"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormLabel className="text-base font-normal">8.1 Đề tài đưa vào danh mục tuyển chọn đề tài KHCN cấp Trường:</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center space-x-2">
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                checked={field.value === true}
                                                                onChange={() => field.onChange(true)}
                                                            />
                                                            <span>Có</span>
                                                        </label>
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                checked={field.value === false}
                                                                onChange={() => field.onChange(false)}
                                                            />
                                                            <span>Không</span>
                                                        </label>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="ml-4">
                                    <p className="font-medium">8.2 Các nội dung sửa đổi, bổ sung (nếu cần):</p>
                                    <Table className="mt-2 border-collapse border border-gray-200">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="border border-gray-200 text-center w-12">TT</TableHead>
                                                <TableHead className="border border-gray-200">Nội dung</TableHead>
                                                <TableHead className="border border-gray-200 w-1/2">Nội dung sửa đổi, bổ sung <br />(ghi chi tiết yêu cầu)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="border border-gray-200 text-center">1</TableCell>
                                                <TableCell className="border border-gray-200">Tên đề tài</TableCell>
                                                <TableCell className="border border-gray-200">
                                                    <FormField
                                                        control={form.control}
                                                        name="comments.topicName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Nhập yêu cầu sửa đổi (nếu có)"
                                                                        {...field}
                                                                        rows={2}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="border border-gray-200 text-center">2</TableCell>
                                                <TableCell className="border border-gray-200">Mục tiêu</TableCell>
                                                <TableCell className="border border-gray-200">
                                                    <FormField
                                                        control={form.control}
                                                        name="comments.objectives"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Nhập yêu cầu sửa đổi (nếu có)"
                                                                        {...field}
                                                                        rows={2}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="border border-gray-200 text-center">3</TableCell>
                                                <TableCell className="border border-gray-200">Nội dung nghiên cứu</TableCell>
                                                <TableCell className="border border-gray-200">
                                                    <FormField
                                                        control={form.control}
                                                        name="comments.content"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Nhập yêu cầu sửa đổi (nếu có)"
                                                                        {...field}
                                                                        rows={2}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="border border-gray-200 text-center">4</TableCell>
                                                <TableCell className="border border-gray-200">
                                                    Sản phẩm<br />
                                                    <span className="text-xs italic">(sản phẩm khoa học, sản phẩm đào tạo, sản phẩm ứng dụng)</span>
                                                </TableCell>
                                                <TableCell className="border border-gray-200">
                                                    <FormField
                                                        control={form.control}
                                                        name="comments.products"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Nhập yêu cầu sửa đổi (nếu có)"
                                                                        {...field}
                                                                        rows={2}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="border border-gray-200 text-center">5</TableCell>
                                                <TableCell className="border border-gray-200">Kinh phí</TableCell>
                                                <TableCell className="border border-gray-200">
                                                    <FormField
                                                        control={form.control}
                                                        name="comments.budget"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Nhập yêu cầu sửa đổi (nếu có)"
                                                                        {...field}
                                                                        rows={2}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="font-medium">9. Ý kiến khác:</p>
                                <FormField
                                    control={form.control}
                                    name="comments.additionalNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Nhập ý kiến khác (nếu có)"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-primary text-white hover:bg-primary/90"
                                >
                                    <ChevronRight className="h-4 w-4" /> Xem trước kết quả
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}