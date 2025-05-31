import type React from "react"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Users, Info, Mail, X, Save } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import Loading from "@/components/loading/loading"
import { UserService } from "@/service/user-service"

// Define the validation schema
const createMultipleAccountsSchema = z
    .object({
        prefix: z.string().optional(),
        startNumber: z
            .string()
            .min(1, { message: "Số bắt đầu là bắt buộc" })
            .regex(/^\d+$/, { message: "Số bắt đầu phải là số" }),
        endNumber: z
            .string()
            .min(1, { message: "Số kết thúc là bắt buộc" })
            .regex(/^\d+$/, { message: "Số kết thúc phải là số" }),
        suffix: z.string().optional(),
        role: z.enum(["STUDENT", "TEACHER"], {
            required_error: "Vui lòng chọn vai trò",
        }),
    })
    .refine(
        (data) => {
            const start = Number.parseInt(data.startNumber)
            const end = Number.parseInt(data.endNumber)
            return start <= end
        },
        {
            message: "Số bắt đầu phải nhỏ hơn hoặc bằng số kết thúc",
            path: ["endNumber"],
        },
    )

type CreateMultipleAccountsFormValues = z.infer<typeof createMultipleAccountsSchema>

interface CreateMultipleAccountsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAccountsCreated?: () => void
}

const CreateMultipleAccountsModal: React.FC<CreateMultipleAccountsModalProps> = ({
    open,
    onOpenChange,
    onAccountsCreated,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [accountsToCreate, setAccountsToCreate] = useState<number>(0)
    const [previewAccounts, setPreviewAccounts] = useState<string[]>([])

    const [resultDialogData, setResultDialogData] = useState<{
        createdCount: number;
        duplicateCount: number;
        duplicateIds: string[];
        createdUsers: any[];
    } | null>(null);

    const form = useForm<CreateMultipleAccountsFormValues>({
        resolver: zodResolver(createMultipleAccountsSchema),
        defaultValues: {
            prefix: "",
            startNumber: "",
            endNumber: "",
            suffix: "",
            role: "STUDENT",
        },
        mode: "onChange",
    })

    const calculateAccountsToCreate = (start: string, end: string) => {
        if (!start || !end || !/^\d+$/.test(start) || !/^\d+$/.test(end)) {
            setAccountsToCreate(0)
            return
        }

        const startNum = Number.parseInt(start)
        const endNum = Number.parseInt(end)

        if (startNum <= endNum) {
            setAccountsToCreate(endNum - startNum + 1)
        } else {
            setAccountsToCreate(0)
        }
    }

    const generatePreviewAccounts = () => {
        const { prefix, startNumber, endNumber, suffix, role } = form.getValues()

        if (!startNumber || !endNumber || !/^\d+$/.test(startNumber) || !/^\d+$/.test(endNumber)) {
            setPreviewAccounts([])
            return
        }

        const startNum = Number.parseInt(startNumber)
        const endNum = Number.parseInt(endNumber)

        if (startNum > endNum) {
            setPreviewAccounts([])
            return
        }

        const domain = role === "STUDENT" ? "@sv.ute.udn.vn" : "@ute.udn.vn"
        const preview: string[] = []

        preview.push(`${prefix || ""}${startNum}${suffix || ""}${domain}`)

        if (endNum - startNum > 1) {
            const middleNum = Math.floor((startNum + endNum) / 2)
            preview.push(`${prefix || ""}${middleNum}${suffix || ""}${domain}`)
        }

        if (endNum > startNum) {
            preview.push(`${prefix || ""}${endNum}${suffix || ""}${domain}`)
        }

        setPreviewAccounts(preview)
    }

    const startNumber = form.watch("startNumber")
    const endNumber = form.watch("endNumber")
    const prefix = form.watch("prefix")
    const suffix = form.watch("suffix")
    const role = form.watch("role")

    useEffect(() => {
        calculateAccountsToCreate(startNumber, endNumber)
        generatePreviewAccounts()
    }, [startNumber, endNumber, prefix, suffix, role])

    const onSubmit = async (data: CreateMultipleAccountsFormValues) => {
        setIsSubmitting(true)
        try {
            const startNum = Number.parseInt(data.startNumber)
            const endNum = Number.parseInt(data.endNumber)

            const accountIds = []
            for (let i = startNum; i <= endNum; i++) {
                accountIds.push(i)
            }

            const response = await UserService.multipleCreateUser({
                ids: accountIds,
                prefix: data.prefix,
                suffix: data.suffix,
                role: data.role,
            });

            console.log("Response from multipleCreateUser:", response)

            if (response.status !== 201 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: "Đã xảy ra lỗi khi tạo tài khoản.",
                    variant: "error",
                })
                return
            }

            setResultDialogData({
                createdCount: response.data.data.createdCount,
                duplicateCount: response.data.data.duplicateCount,
                duplicateIds: response.data.data.duplicateIds,
                createdUsers: response.data.data.createdUsers,
            });

            onAccountsCreated?.()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error("Error creating accounts:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi tạo tài khoản.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancelLoading = () => {
        setIsSubmitting(false);
    };

    return (
        <>
            {isSubmitting && <Loading onCancel={handleCancelLoading} />}
            <Dialog open={open} onOpenChange={onOpenChange} modal>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Tạo nhiều tài khoản</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin để tạo nhiều tài khoản cùng lúc với định dạng email tùy chỉnh.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Định dạng email</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="prefix"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1">
                                                <FormLabel>Tiền tố</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ví dụ: sv" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="col-span-2 grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="startNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Số bắt đầu</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ví dụ: 21115053120100" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="endNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Số kết thúc</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ví dụ: 21115053120158" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="suffix"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1">
                                                <FormLabel>Hậu tố</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ví dụ: ute" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vai trò</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn vai trò" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="STUDENT">Sinh viên</SelectItem>
                                                <SelectItem value="TEACHER">Giảng viên</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-md">
                                            {field.value === "STUDENT"
                                                ? "Email sẽ có định dạng: [tiền tố][số][hậu tố]@sv.ute.udn.vn"
                                                : "Email sẽ có định dạng: [tiền tố][số][hậu tố]@ute.udn.vn"}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {accountsToCreate > 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-primary" />
                                                <span className="font-medium">
                                                    Sẽ tạo <Badge variant="outline">{accountsToCreate}</Badge> tài khoản
                                                    {form.getValues("role") === "STUDENT" ? " sinh viên" : " giảng viên"}
                                                </span>
                                            </div>
                                            <Badge variant="secondary" className="px-2 py-1">
                                                {form.getValues("role") === "STUDENT" ? "STUDENT" : "TEACHER"}
                                            </Badge>
                                        </div>

                                        {previewAccounts.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Info className="h-4 w-4" />
                                                    <span>Xem trước email:</span>
                                                </div>
                                                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                                                    {previewAccounts.map((email, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <code className="text-primary">{email}</code>
                                                        </div>
                                                    ))}
                                                    {accountsToCreate > 3 && (
                                                        <div className="text-muted-foreground text-xs italic mt-1">
                                                            ... và {accountsToCreate - previewAccounts.length} tài khoản khác
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button type="button" className="text-rose-500" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                    <X /> Hủy
                                </Button>
                                <Button type="submit" disabled={isSubmitting || accountsToCreate === 0}>
                                    <Save />
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!resultDialogData} onOpenChange={() => { }} modal>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-primary">Kết quả tạo tài khoản</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Dưới đây là thông tin chi tiết về các tài khoản đã được tạo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Số tài khoản đã tạo</p>
                                <p className="text-xl font-bold text-green-500">{resultDialogData?.createdCount}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Số tài khoản trùng lặp</p>
                                <p className="text-xl font-bold text-destructive">{resultDialogData?.duplicateCount}</p>
                            </div>
                        </div>

                        {resultDialogData?.duplicateIds.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-primary">Email trùng lặp</h3>
                                <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto">
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        {resultDialogData.duplicateIds.map((id, index) => (
                                            <li key={index} className="text-muted-foreground">{id}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {resultDialogData?.createdUsers.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-primary">Tài khoản đã tạo</h3>
                                <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="sticky top-0 z-10 bg-[#0066F5]">
                                            <tr className="text-left text-muted-foreground text-white">
                                                <th className="py-2 px-2 border-b">STT</th>
                                                <th className="py-2 px-2 border-b">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resultDialogData.createdUsers.map((user, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="py-2 px-2">{index + 1}</td>
                                                    <td className="py-2 px-2">{user.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setResultDialogData(null)} className="w-full sm:w-auto">
                            <X /> Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateMultipleAccountsModal