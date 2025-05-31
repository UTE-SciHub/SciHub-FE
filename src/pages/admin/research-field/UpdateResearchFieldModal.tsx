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
import { ResearchFieldService } from "@/service/research-field-service";
import { ResearchField } from "@/models/research-field";
import { trimAndStrip } from "@/utils/common";

// Cập nhật schema để bao gồm delFlag
const researchFieldSchema = z.object({
    id: z.number().optional(), // Không cần validate vì là read-only
    name: z.string().min(1, { message: "Tên lĩnh vực là bắt buộc" }),
    description: z.string().min(1, { message: "Mô tả là bắt buộc" }),
    delFlag: z.boolean(), // Thêm delFlag vào schema
});

interface UpdateResearchFieldProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    researchField: ResearchField;
    onResearchFieldUpdated?: () => void;
}

const UpdateResearchFieldModal: React.FC<UpdateResearchFieldProps> = ({
    open,
    onOpenChange,
    researchField,
    onResearchFieldUpdated,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ResearchField>({
        resolver: zodResolver(researchFieldSchema),
        defaultValues: {
            id: researchField.id,
            name: researchField.name || "",
            description: researchField.description || "",
            delFlag: researchField.delFlag || false,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        form.reset({
            id: researchField.id,
            name: researchField.name || "",
            description: researchField.description || "",
            delFlag: researchField.delFlag || false,
        });
    }, [researchField, form]);

    const onSubmit = async (data: ResearchField) => {
        setIsSubmitting(true);
        try {
            data = {
                ...data,
                name: trimAndStrip(data.name),
                description: trimAndStrip(data.description),
            };

            const response = await ResearchFieldService.update(researchField.id!, data);

            if (response.status !== 200 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Đã xảy ra lỗi trong quá trình cập nhật lĩnh vực.",
                    variant: "error",
                });
                return;
            }

            toast({
                title: "Cập nhật thành công",
                variant: "success",
            });

            onResearchFieldUpdated?.();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error updating research field:", error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong quá trình cập nhật lĩnh vực. Vui lòng thử lại.",
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
                    <DialogTitle>Cập nhật lĩnh vực</DialogTitle>
                    <DialogDescription>Chỉnh sửa thông tin chi tiết của lĩnh vực nghiên cứu.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-2">
                            {/* ID Field (Read-only) */}
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

                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Tên lĩnh vực <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên lĩnh vực" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description Field */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Nhập mô tả về lĩnh vực nghiên cứu"
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Mô tả ngắn gọn về lĩnh vực nghiên cứu và các thông tin liên quan.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* delFlag Field (Switch) */}
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

export default UpdateResearchFieldModal;