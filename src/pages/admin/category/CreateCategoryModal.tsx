import { useState, useRef } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload, X, ImageIcon, Save } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"
import { trimAndStrip } from "@/utils/common"
import { Category } from "@/models/category"
import { CategoryService } from "@/service/category-service"

const researchFieldSchema = z.object({
    name: z.string().min(1, { message: "Tên danh mục là bắt buộc" }),
    description: z.string().min(1, { message: "Mô tả là bắt buộc" }),
});

interface CreateCategoryProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCategoryAdded?: () => void
}

const CreateCategoryModal: React.FC<CreateCategoryProps> = ({ open, onOpenChange, onCategoryAdded }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<Category>({
        resolver: zodResolver(researchFieldSchema),
        defaultValues: {
            name: "",
            description: "",
        },
        mode: "onBlur",
    })

    const onSubmit = async (data: Category) => {
        setIsSubmitting(true)
        try {
            data = {
                ...data,
                name: trimAndStrip(data.name),
                description: trimAndStrip(data.description),
                delFlag: false,

            }
            const response = await CategoryService.create(data);

            if (response.status !== 201 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Đã xảy ra lỗi trong quá trình thêm danh mục mới.",
                    variant: "error",
                })
                return

            }

            toast({
                title: "Thêm mới thành công",
                variant: "success"
            })

            onCategoryAdded?.()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error("Error adding department:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong quá trình thêm danh mục mới. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Thêm mới danh mục đề tài</DialogTitle>
                    <DialogDescription>Nhập thông tin chi tiết để thêm danh mục nghiên cứu mới vào hệ thống.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-2">
                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Tên danh mục <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên danh mục" {...field} />
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
                                                placeholder="Nhập mô tả về danh mục nghiên cứu"
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Mô tả ngắn gọn về danh mục nghiên cứu và các thông tin liên quan.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                        {isSubmitting ? "Đang xử lý..." : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCategoryModal;