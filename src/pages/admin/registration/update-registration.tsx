import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { useNavigate, useParams } from "react-router-dom"
import { CalendarIcon, Save, Undo2, X, InfoIcon, AlertCircle, CalendarCheck, CalendarX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FormRichTextEditor } from "@/components/editor/text-editor"
import { FormFileUploadPreview } from "@/components/file-upload-preview/file-upload-preview"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import Loading from "@/components/loading/loading"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status"
import { RegistrationPeriod } from "@/models/registraion-period"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RegistrationService } from "@/service/registration-service"

const formSchema = z
    .object({
        id: z.string(),
        title: z
            .string()
            .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
            .max(255, "Tiêu đề không được vượt quá 255 ký tự")
        ,
        decisionNumber: z
            .string()
            .min(3, "Số quyết định không được để trống")
            .max(50, "Số quyết định không được vượt quá 50 ký tự"),
        decisionFile: z.string().optional(),
        startDate: z.date({
            required_error: "Vui lòng chọn ngày bắt đầu",
        }),
        endDate: z.date({
            required_error: "Vui lòng chọn ngày kết thúc",
        }),
        description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
        status: z.enum([RegistrationPeriodStatus.OPEN, RegistrationPeriodStatus.CLOSED], {
            errorMap: () => ({ message: "Trạng thái không hợp lệ" }),
        })
    })
    .refine((data) => data.endDate > data.startDate, {
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["endDate"],
    })
    .refine(
        (data) => {
            const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays >= 7
        },
        {
            message: "Thời gian đăng ký phải kéo dài ít nhất 7 ngày",
            path: ["endDate"],
        },
    )

export default function UpdateRegistrationPeriod() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [registrationPeriod, setRegistrationPeriod] = useState<RegistrationPeriod>(null)
    const [error, setError] = useState<string | null>(null)
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [isChangingStatus, setIsChangingStatus] = useState(false)

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: "",
            status: RegistrationPeriodStatus.CLOSED,
            title: "",
            decisionNumber: "",
            decisionFile: "",
            description: "",
        },
    })

    useEffect(() => {
        const fetchRegistrationPeriod = async () => {
            try {
                setIsFetching(true)
                const response = await RegistrationService.getRegistrationById(id as string)

                if (response.status === 200 && response.data.code === 1000) {
                    const data = response.data.data
                    setRegistrationPeriod(data)
                    setIsStatusOpen(data.status === RegistrationPeriodStatus.OPEN)

                    form.reset({
                        id: data.id,
                        title: data.title,
                        decisionNumber: data.decisionNumber,
                        decisionFile: data.decisionFile || "",
                        status: data.status,
                        startDate: new Date(data.startDate),
                        endDate: new Date(data.endDate),
                        description: data.description,
                    })
                } else {
                    setError("Không thể tải thông tin đợt đăng ký. Vui lòng thử lại sau.")
                }
            } catch (error) {
                console.error("Error fetching registration period:", error)
                setError("Đã xảy ra lỗi khi tải thông tin đợt đăng ký.")
            } finally {
                setIsFetching(false)
            }
        }

        if (id) {
            fetchRegistrationPeriod()
        }
    }, [id, form])

    const handleFileChange = (file: File | null) => {
        setUploadedFile(file)
    }

    const handleStatusToggle = () => {
        setIsChangingStatus(true)
        const newStatus = isStatusOpen ? RegistrationPeriodStatus.CLOSED : RegistrationPeriodStatus.OPEN
        setIsStatusOpen(!isStatusOpen)
        form.setValue("status", newStatus)
        setRegistrationPeriod({ ...registrationPeriod, status: newStatus })
        setIsChangingStatus(false)
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true)
            const formattedData = {
                id: id,
                title: values.title,
                decisionNumber: values.decisionNumber,
                status: values.status,
                decisionFile: registrationPeriod.decisionFile || "",
                startDate: format(new Date(values.startDate), "yyyy-MM-dd"),
                endDate: format(new Date(values.endDate), "yyyy-MM-dd"),
                description: values.description,
            }

            const formData = new FormData()
            const jsonBlob = new Blob([JSON.stringify(formattedData)], {
                type: "application/json",
            })
            formData.append("data", jsonBlob)

            if (uploadedFile) {
                formData.append("decisionFile", uploadedFile, uploadedFile.name)
            }

            const response = await RegistrationService.updateRegistration(id as string, formData)

            let variant: "success" | "error" = "error"
            if (response.status === 200 && response.data.code === 1000 && response.data.status === 200) {
                variant = "success"
            } else {
                variant = "error"
            }

            toast({
                title: response.data.message || "Cập nhật thành công",
                variant: variant,
            })

            if (response.status === 200 && response.data.code === 1000 && response.data.status === 200) {
                navigate(-1)
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi, vui lòng thử lại sau",
                variant: "error",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelLoading = () => {
        setIsLoading(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case RegistrationPeriodStatus.OPEN:
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang mở
                    </Badge>
                )
            case RegistrationPeriodStatus.CLOSED:
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        Đã đóng
                    </Badge>
                )
            case RegistrationPeriodStatus.REVIEWING:
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                        Chờ duyệt
                    </Badge>
                )
            case RegistrationPeriodStatus.CANCELLED:
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Đã hủy
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isFetching || isLoading) {
        return (
            <Loading onCancel={handleCancelLoading} />
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="">
            {isFetching && <Loading onCancel={handleCancelLoading} />}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Cập nhật đợt đăng ký</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <Undo2 className="h-4 w-4" />
                    Quay lại
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Thông tin đợt đăng ký</CardTitle>
                            <CardDescription>Cập nhật thông tin đợt đăng ký</CardDescription>
                        </div>
                        {registrationPeriod && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                                {getStatusBadge(registrationPeriod.status)}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormLabel className="text-sm">Trạng thái</FormLabel>
                                        <Switch
                                            checked={isStatusOpen}
                                            onCheckedChange={handleStatusToggle}
                                        />
                                        <Label className="text-sm font-medium">
                                            {isStatusOpen ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CalendarCheck className="h-4 w-4" />
                                                    Mở đăng ký
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <CalendarX className="h-4 w-4" />
                                                    Đóng đăng ký
                                                </span>
                                            )}
                                        </Label>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã số</FormLabel>
                                        <FormControl>
                                            <Input
                                                readOnly
                                                disabled
                                                placeholder="Mã số đợt đăng ký"
                                                value={id}
                                                {...field}
                                                className="transition-all focus:border-primary focus:ring-1 focus:ring-primary text-black font-medium"
                                            />
                                        </FormControl>
                                        <FormDescription>Mã đợt đăng ký</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Tiêu đề
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground inline-block cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Tiêu đề của đợt đăng ký, tối đa 255 ký tự</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nhập tiêu đề đợt đăng ký"
                                                {...field}
                                                className="transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                        </FormControl>
                                        <FormDescription>Tiêu đề sẽ được hiển thị cho người dùng khi đăng ký</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="decisionNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số quyết định</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nhập số quyết định (VD: QĐ-2025-0123)"
                                                {...field}
                                                className="transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                        </FormControl>
                                        <FormDescription>Số quyết định phê duyệt đợt đăng ký</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="decisionFile"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>File quyết định</FormLabel>
                                        <FormControl>
                                            <FormFileUploadPreview
                                                field={field}
                                                fieldState={fieldState}
                                                accept=".pdf"
                                                maxSize={10}
                                                placeholder="Tải lên file quyết định"
                                                onFileChange={handleFileChange}
                                                existingFile={registrationPeriod.decisionFile}
                                                displayName={`Quyết định: ${registrationPeriod.decisionNumber}`}
                                                height={800}
                                            />
                                        </FormControl>
                                        <FormDescription>Tải lên file quyết định phê duyệt (PDF - tối đa 10MB)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Ngày bắt đầu</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal transition-all",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "yyyy-MM-dd") : <span>Chọn ngày</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>Ngày bắt đầu đợt đăng ký</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Ngày kết thúc</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal transition-all",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "yyyy-MM-dd") : <span>Chọn ngày</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        disabled={(date) => {
                                                            const startDate = form.getValues("startDate")
                                                            if (!startDate) return false

                                                            // For update, we don't need to enforce the 7-day rule if the dates are already set
                                                            if (registrationPeriod && field.value) {
                                                                return date < startDate
                                                            }

                                                            const minDate = new Date(startDate)
                                                            minDate.setDate(minDate.getDate() + 7)
                                                            return date < startDate
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>Ngày kết thúc đợt đăng ký (ít nhất 7 ngày sau ngày bắt đầu)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <FormRichTextEditor
                                                label="Mô tả chi tiết thông báo"
                                                field={field}
                                                placeholder="Nhập mô tả chi tiết về đợt đăng ký..."
                                                height="400px"
                                                fieldState={fieldState}
                                            />
                                        </FormControl>
                                        <FormDescription>Mô tả chi tiết về đợt đăng ký, yêu cầu và hướng dẫn</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="transition-all text-rose-500 hover:bg-muted"
                                >
                                    <X className="h-4 w-4" />
                                    Hủy
                                </Button>
                                <Button type="submit" className="transition-all" disabled={form.formState.isSubmitting}>
                                    <Save className="h-4 w-4" />
                                    {form.formState.isSubmitting ? "Đang xử lý..." : "Cập nhật"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div >
    )
}