import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, FileText, Save, Plus } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { trimAndStrip } from "@/utils/common";

// Define the template schema
const templateSchema = z.object({
    code: z.string().min(1, { message: "Mã biểu mẫu là bắt buộc" }),
    name: z.string().min(1, { message: "Tên biểu mẫu là bắt buộc" }),
    description: z.string().optional(),
    file: z.instanceof(File).optional(),
});

// Define the Template interface
interface Template {
    id?: string;
    code: string;
    name: string;
    description?: string;
    file?: File;
    fileUrl?: string;
}

interface TemplateManagementFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTemplateAdded?: () => void;
    editTemplate?: Template | null;
}

const TemplateManagementForm: React.FC<TemplateManagementFormProps> = ({ 
    open, 
    onOpenChange, 
    onTemplateAdded,
    editTemplate = null
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<Template>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            code: editTemplate?.code || "",
            name: editTemplate?.name || "",
            description: editTemplate?.description || "",
        },
        mode: "onBlur",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            form.setValue("file", file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const onSubmit = async (data: Template) => {
        setIsSubmitting(true);
        try {
            // Here you would call your API service to save the template
            // For now, we'll just simulate a successful save
            
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast({
                title: editTemplate ? "Cập nhật thành công" : "Thêm mới thành công",
                variant: "success"
            });

            onTemplateAdded?.();
            onOpenChange(false);
            form.reset();
            setSelectedFile(null);
        } catch (error) {
            console.error("Error saving template:", error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong quá trình lưu biểu mẫu. Vui lòng thử lại.",
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
                    <DialogTitle>{editTemplate ? "Cập nhật biểu mẫu" : "Thêm mới biểu mẫu"}</DialogTitle>
                    <DialogDescription>
                        {editTemplate 
                            ? "Cập nhật thông tin biểu mẫu trong hệ thống." 
                            : "Nhập thông tin chi tiết để thêm biểu mẫu mới vào hệ thống."}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-2">
                            {/* Code Field */}
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Mã biểu mẫu <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập mã biểu mẫu (ví dụ: R01)" {...field} />
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
                                            Tên biểu mẫu <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên biểu mẫu" {...field} />
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
                                                placeholder="Nhập mô tả về biểu mẫu"
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Mô tả ngắn gọn về biểu mẫu và cách sử dụng.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* File Upload Field */}
                            <div className="space-y-2">
                                <FormLabel>
                                    Tệp biểu mẫu {!editTemplate && <span className="text-destructive">*</span>}
                                </FormLabel>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".doc,.docx,.pdf,.xls,.xlsx"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={triggerFileInput}
                                        className="flex-1"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Chọn tệp
                                    </Button>
                                    {selectedFile && (
                                        <div className="flex-1 flex items-center p-2 border rounded-md">
                                            <FileText className="h-4 w-4 mr-2" />
                                            <span className="text-sm truncate">{selectedFile.name}</span>
                                        </div>
                                    )}
                                    {editTemplate?.fileUrl && !selectedFile && (
                                        <div className="flex-1 flex items-center p-2 border rounded-md">
                                            <FileText className="h-4 w-4 mr-2" />
                                            <span className="text-sm truncate">Tệp hiện tại</span>
                                        </div>
                                    )}
                                </div>
                                <FormDescription>
                                    Chấp nhận các định dạng: .doc, .docx, .pdf, .xls, .xlsx
                                </FormDescription>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2">
                    <Button type="button" className="text-rose-500" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        <X /> Hủy
                    </Button>
                    <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        <Save />
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Đang xử lý..." : (editTemplate ? "Cập nhật" : "Thêm mới")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TemplateManagementForm;