import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Save } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { ResearchType } from "@/models/research-type";
import { trimAndStrip } from "@/utils/common";
import { ResearchTypeService } from "@/service/research-type-service";

// Cập nhật schema để bao gồm delFlag
const researchTypeSchema = z.object({
    id: z.number().optional(), // Không cần validate vì là read-only
    name: z.string().min(1, { message: "Tên loại hình là bắt buộc" }),
    description: z.string().min(1, { message: "Mô tả là bắt buộc" }),
    delFlag: z.boolean(), // Thêm delFlag vào schema
});

interface UpdateResearchTypeProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    researchType: ResearchType;
    onResearchTypeUpdated?: () => void;
}

const UpdateResearchTypeModal: React.FC<UpdateResearchTypeProps> = ({
    open,
    onOpenChange,
    researchType,
    onResearchTypeUpdated,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ResearchType>({
        resolver: zodResolver(researchTypeSchema),
        defaultValues: {
            id: researchType.id,
            name: researchType.name || "",
            description: researchType.description || "",
            delFlag: researchType.delFlag || false,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        form.reset({
            id: researchType.id,
            name: researchType.name || "",
            description: researchType.description || "",
            delFlag: researchType.delFlag || false,
        });
    }, [researchType, form]);

    const onSubmit = async (data: ResearchType) => {
        setIsSubmitting(true);
        try {
            data = {
                ...data,
                name: trimAndStrip(data.name),
                description: trimAndStrip(data.description),
            };

            const response = await ResearchTypeService.update(researchType.id!, data);

            if (response.status !== 200 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Đã xảy ra lỗi trong quá trình cập nhật loại hình.",
                    variant: "error",
                });
                return;
            }

            toast({
                title: "Cập nhật thành công",
                variant: "success",
            });

            onResearchTypeUpdated?.();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error updating research type:", error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong quá trình cập nhật loại hình. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Cập nhật loại hình</DialogTitle>
                    <DialogDescription>Chỉnh sửa thông tin chi tiết của loại hình nghiên cứu.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-2">
                            {/* ID Type (Read-only) */}
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ""} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Name Type */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Tên loại hình <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên loại hình" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description Type */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Nhập mô tả về loại hình nghiên cứu"
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Mô tả ngắn gọn về loại hình nghiên cứu và các thông tin liên quan.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* delFlag Type (Switch) */}
                            <FormField
                                control={form.control}
                                name="delFlag"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormLabel>Trạng thái khóa</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={!field.value}
                                                onCheckedChange={(checked) => field.onChange(!checked)}
                                            />
                                        </FormControl>
                                        <FormDescription>{!field.value ? "Đang mở" : "Đã khóa"}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2">
                    <Button
                        type="button"
                        className="text-rose-500"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        <X /> Hủy
                    </Button>
                    <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        <Save />
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateResearchTypeModal;