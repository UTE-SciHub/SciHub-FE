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
import { create } from "@/service/department-service"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const departmentSchema = z.object({
    name: z.string().min(1, { message: "Tên khoa là bắt buộc" }),
    description: z.string().optional(),
    email: z.string().min(1, { message: "Email là bắt buộc" }).email({ message: "Email không hợp lệ" }),
    phone: z
        .string()
        .regex(/^(0|\+84)(\d{9,10})$/, {
            message: "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)",
        })
        .min(1, { message: "Số điện thoại là bắt buộc" }),
    imageFile: z
        .any()
        .refine((file) => !file || file instanceof File, {
            message: "Vui lòng tải lên một tệp hình ảnh hợp lệ",
        })
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: `Kích thước tệp tối đa là 5MB`,
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Chỉ chấp nhận các định dạng .jpg, .jpeg, .png và .webp",
        })
        .optional(),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

interface CreateDepartmentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDepartmentAdded?: () => void
}

const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({ open, onOpenChange, onDepartmentAdded }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: "",
            description: "",
            email: "",
            phone: "",
            imageFile: undefined,
        },
        mode: "onBlur", // Enable validation on blur
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleFileUpload = (file: File) => {
        // Validate file before setting
        if (file.size > MAX_FILE_SIZE) {
            toast({
                description: `Kích thước tệp tối đa là 5MB`,
                variant: "error",
            })
            return
        }

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            toast({
                description: "Chỉ chấp nhận các định dạng .jpg, .jpeg, .png và .webp",
                variant: "error",
            })
            return
        }

        form.setValue("imageFile", file, { shouldValidate: true })

        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            setImagePreview(result)
        }
        reader.readAsDataURL(file)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        form.setValue("imageFile", undefined, { shouldValidate: true })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const onSubmit = async (data: DepartmentFormValues) => {
        setIsSubmitting(true)
        try {
            let imageUrl = ""

            if (data.imageFile) {
                console.log("Uploading file:", data.imageFile)
                // In a real app, you would upload the file to your server
                // const formData = new FormData()
                // formData.append("file", data.imageFile)
                // const response = await fetch("/api/upload", { method: "POST", body: formData })
                // const result = await response.json()
                // imageUrl = result.url

                // For demo purposes
                imageUrl = URL.createObjectURL(data.imageFile)
            }

            const response = await create({
                name: data.name,
                description: data.description,
                email: data.email,
                phoneNumber: data.phone,
                imageUrl: imageUrl,
                delFlag: false,
            })

            if (response.status !== 201 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Đã xảy ra lỗi trong quá trình thêm khoa mới.",
                    variant: "error",
                })
                return

            }

            toast({
                title: "Thêm mới thành công",
                variant: "success"
            })

            onDepartmentAdded?.()
            onOpenChange(false)
            form.reset()
            setImagePreview(null)
        } catch (error) {
            console.error("Error adding department:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong quá trình thêm khoa mới. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Thêm khoa mới</DialogTitle>
                    <DialogDescription>Nhập thông tin chi tiết để thêm khoa mới vào hệ thống.</DialogDescription>
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
                                            Tên khoa <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên khoa" {...field} />
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
                                                placeholder="Nhập mô tả về khoa"
                                                className="resize-none min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Mô tả ngắn gọn về khoa và các thông tin liên quan.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Nhập địa chỉ email liên hệ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            {/* Phone Field */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="Nhập số điện thoại liên hệ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload Field */}
                            <FormField
                                control={form.control}
                                name="imageFile"
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel>Hình ảnh</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <div
                                                    className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging
                                                        ? "border-primary bg-primary/5"
                                                        : "border-muted-foreground/25 hover:border-primary/50"
                                                        }`}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                >
                                                    <Input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        id="department-image"
                                                    />

                                                    {!imagePreview ? (
                                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                                            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    Kéo và thả hình ảnh vào đây hoặc nhấp để tải lên
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Hỗ trợ JPG, JPEG, PNG, WEBP (tối đa 5MB)
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => document.getElementById("department-image")?.click()}
                                                                className="mt-2"
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Chọn tệp
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <div className="flex items-center justify-center">
                                                                <div className="relative w-full max-w-[300px] h-auto rounded-md overflow-hidden border">
                                                                    <img
                                                                        src={imagePreview || "/placeholder.svg"}
                                                                        alt="Department preview"
                                                                        className="w-full h-auto object-contain"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-0 right-0 h-7 w-7"
                                                                onClick={removeImage}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Tải lên hình ảnh đại diện cho khoa.</FormDescription>
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
                        {isSubmitting ? "Đang xử lý..." : "Thêm khoa"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateDepartmentModal