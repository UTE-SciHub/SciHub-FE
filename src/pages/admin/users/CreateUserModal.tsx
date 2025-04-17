import { useState, useRef } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload, X, ImageIcon, User, Mail, Phone, Save } from 'lucide-react'

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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { UserService } from "@/service/user-service"

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

// Define the validation schema
const createUserSchema = z.object({
    name: z.string().min(1, { message: "Họ tên là bắt buộc" }),
    email: z.string().min(1, { message: "Email là bắt buộc" }).email({ message: "Email không hợp lệ" }),
    phoneNumber: z
        .string()
        .regex(/^(0|\+84)(\d{9,10})$/, {
            message: "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)",
        })
        .min(1, { message: "Số điện thoại là bắt buộc" }),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Giới tính không hợp lệ" }),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

interface CreateUserModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onUserCreated?: () => void
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ open, onOpenChange, onUserCreated }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            phoneNumber: "",
            gender: "MALE",
        },
        mode: "onBlur",
    })

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
    }

    const handleFileUpload = (file: File) => {
        // Validate file before setting
        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "Kích thước tệp quá lớn",
                description: `Kích thước tệp tối đa là 10MB`,
                variant: "error",
            })
            return
        }

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            toast({
                title: "Định dạng tệp không hợp lệ",
                description: "Chỉ chấp nhận các định dạng .jpg, .jpeg, .png và .webp",
                variant: "error",
            })
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            setAvatarPreview(result)
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

    const removeAvatar = () => {
        setAvatarPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const onSubmit = async (data: CreateUserFormValues) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            const jsonBlob = new Blob([JSON.stringify(data)], {
                type: "application/json",
            })
            formData.append("data", jsonBlob)
            if (fileInputRef.current?.files?.[0]) {
                formData.append("avatar", fileInputRef.current.files[0])
            }

            const response = await UserService.createUser(formData);

            if (response.status !== 201 && response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message,
                    variant: "error",
                })
                return
            }

            toast({
                title: "Tạo tài khoản thành công",
                description: "Tài khoản mới đã được tạo thành công.",
                variant: "success",
            })
            onUserCreated?.()
            onOpenChange(false)
            form.reset()
            setAvatarPreview(null)
        } catch (error) {
            console.error("Error creating user:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        Tạo tài khoản mới
                    </DialogTitle>
                    <DialogDescription>
                        Nhập thông tin chi tiết để tạo tài khoản người dùng mới.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Avatar Upload Field */}
                        <div className="flex justify-center mb-2">
                            <div
                                className={`relative rounded-full overflow-hidden ${isDragging ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/50"
                                    } transition-all`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <Avatar className="h-24 w-24 cursor-pointer border-2 border-muted">
                                    {avatarPreview ? (
                                        <AvatarImage src={avatarPreview} alt="Avatar preview" />
                                    ) : (
                                        <AvatarFallback className="bg-muted">
                                            <User className="h-12 w-12 text-muted-foreground/60" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>

                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    id="user-avatar"
                                />

                                <div
                                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => document.getElementById("user-avatar")?.click()}
                                >
                                    <Upload className="h-6 w-6 text-white" />
                                </div>

                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={removeAvatar}
                                        className="absolute z-10 top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 m-1 hover:bg-destructive/90 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Nhấp vào ảnh để tải lên avatar</p>
                            <p className="text-xs">Hỗ trợ JPG, JPEG, PNG, WEBP (tối đa 10MB)</p>
                        </div>

                        {/* Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Họ và tên <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Nhập họ và tên" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
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
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="email" placeholder="Nhập địa chỉ email" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Phone Number Field */}
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Số điện thoại <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="tel" placeholder="Nhập số điện thoại" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Giới tính <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <select
                                                {...field}
                                                className="w-full h-11 border-gray-200 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="MALE">Nam</option>
                                                <option value="FEMALE">Nữ</option>
                                                <option value="OTHER">Khác</option>
                                            </select>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button className="text-rose-500" type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                <X className="h-4 w-4" /> Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="h-4 w-4" />
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateUserModal
