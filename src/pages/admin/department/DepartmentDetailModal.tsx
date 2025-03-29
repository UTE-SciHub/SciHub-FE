import { useState, useRef, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload, X, ImageIcon, Save, Edit, Eye } from "lucide-react"

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
import { update } from "@/service/department-service"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Department } from "@/models/department"

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

interface DepartmentDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    department: Department
    onDepartmentUpdated?: () => void
    readOnly?: boolean
}

const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
    open,
    onOpenChange,
    department,
    onDepartmentUpdated,
    readOnly = false,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isEditing, setIsEditing] = useState(!readOnly)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [delFlag, setDelFlag] = useState(department?.delFlag || false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: department?.name || "",
            description: department?.description || "",
            email: department?.email || "",
            phone: department?.phoneNumber || "",
            imageFile: undefined,
        },
        mode: "onBlur", // Enable validation on blur
    })

    // Update form when department changes
    useEffect(() => {
        if (department) {
            form.reset({
                name: department.name || "",
                description: department.description || "",
                email: department.email || "",
                phone: department.phoneNumber || "",
                imageFile: undefined,
            })

            // Set image preview if department has an image URL
            if (department.imageUrl) {
                setImagePreview(department.imageUrl)
            } else {
                setImagePreview(null)
            }
            setDelFlag(department.delFlag || false)
        }
    }, [department, form])

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

    const toggleEditMode = () => {
        setIsEditing(!isEditing)
    }

    const onSubmit = async (data: DepartmentFormValues) => {
        setShowConfirmDialog(false);
        setIsSubmitting(true);
        try {
            let imageUrl = department.imageUrl || ""

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
            } else if (!imagePreview) {
                // If image was removed
                imageUrl = ""
            }

            const response = await update(department.id, {
                id: department.id,
                name: data.name,
                description: data.description,
                email: data.email,
                phoneNumber: data.phone,
                imageUrl: imageUrl,
                delFlag: delFlag,
            })

            if (response.status !== 200 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Đã xảy ra lỗi trong quá trình cập nhật thông tin khoa.",
                    variant: "error",
                })
                return
            }

            toast({
                title: "Cập nhật thành công",
                variant: "success",
            })

            onDepartmentUpdated?.()

            setIsEditing(false)
            onOpenChange(false)
        } catch (error) {
            console.error("Error updating department:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong quá trình cập nhật thông tin khoa. Vui lòng thử lại.",
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
                    <DialogTitle>
                        {readOnly ? (
                            <div className="flex justify-between items-center">
                                <span>Chi tiết khoa: {department?.name}</span>
                                <Button variant="outline" size="sm" onClick={toggleEditMode} disabled={isSubmitting}>
                                    {!isEditing ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {isEditing ? "Xem chi tiết" : "Chỉnh sửa"}
                                </Button>
                            </div>
                        ) : (
                            `Cập nhật thông tin khoa: ${department?.name}`
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Chỉnh sửa thông tin chi tiết của khoa." : "Xem thông tin chi tiết của khoa."}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
                    <Form {...form}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                setShowConfirmDialog(true)
                            }}
                            className="space-y-6 pb-2"
                        >
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
                                            <Input placeholder="Nhập tên khoa" {...field} disabled={!isEditing || isSubmitting} />
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
                                                disabled={!isEditing || isSubmitting}
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
                                        <FormLabel>
                                            Email <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Nhập địa chỉ email liên hệ"
                                                {...field}
                                                disabled={!isEditing || isSubmitting}
                                            />
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
                                        <FormLabel>
                                            Số điện thoại <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="Nhập số điện thoại liên hệ"
                                                {...field}
                                                disabled={!isEditing || isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload/Preview Field */}
                            <FormField
                                control={form.control}
                                name="imageFile"
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel>Hình ảnh</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                {isEditing ? (
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
                                                            disabled={isSubmitting}
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
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <Upload className="h-4 w-4 " />
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
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : // Read-only image display
                                                    imagePreview ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="relative w-full max-w-[300px] h-auto rounded-md overflow-hidden border">
                                                                <img
                                                                    src={imagePreview || "/placeholder.svg"}
                                                                    alt="Department preview"
                                                                    className="w-full h-auto object-contain"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center gap-2 text-center p-6 border rounded-lg">
                                                            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                                                            <p className="text-sm text-muted-foreground">Không có hình ảnh</p>
                                                        </div>
                                                    )}
                                            </div>
                                        </FormControl>
                                        {isEditing && <FormDescription>Tải lên hình ảnh đại diện cho khoa.</FormDescription>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormItem>
                                <FormLabel>Trạng thái</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Switch
                                            checked={!delFlag}
                                            onCheckedChange={(checked) => setDelFlag(!checked)}
                                            disabled={!isEditing || isSubmitting}
                                        />
                                        <span>{delFlag ? "Đã khóa" : "Đang hoạt động"}</span>
                                    </div>
                                </FormControl>
                            </FormItem>
                        </form>
                    </Form>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2">
                    <Button
                        type="button"
                        className="text-rose-500"
                        variant="outline"
                        onClick={() => {
                            if (readOnly && isEditing) {
                                setIsEditing(false)
                                // Reset form to original values
                                form.reset({
                                    name: department.name || "",
                                    description: department.description || "",
                                    email: department.email || "",
                                    phone: department.phoneNumber || "",
                                    imageFile: undefined,
                                })
                                setImagePreview(department.imageUrl || null)
                                setDelFlag(department.delFlag || false)
                            } else {
                                onOpenChange(false)
                            }
                        }}
                        disabled={isSubmitting}
                    >
                        <X className=" h-4 w-4" />
                        {readOnly && isEditing ? "Hủy chỉnh sửa" : "Đóng"}
                    </Button>

                    {isEditing && (
                        <Button type="button" onClick={() => setShowConfirmDialog(true)} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className=" h-4 w-4 animate-spin" />}
                            <Save className=" h-4 w-4" />
                            {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận cập nhật</AlertDialogTitle>
                    </AlertDialogHeader>
                    <p>Bạn có chắc chắn muốn lưu các thay đổi?</p>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className=" h-4 w-4 animate-spin" />}
                            Xác nhận
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}

export default DepartmentDetailModal

