import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, X, FileText, Calendar, Hash, Building2, Clipboard } from "lucide-react"

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
import { Contract, ContractRequest, ContractStatus } from "@/models/contract"
import { ContractService } from "@/service/contract-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TopicService } from "@/service/topic-service"
import { Topic } from "@/models/topic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormFileUploadPreview } from "@/components/file-upload-preview/file-upload-preview"

const contractSchema = z.object({
    name: z.string().min(1, { message: "Tên hợp đồng là bắt buộc" }),
    code: z.string().min(1, { message: "Mã hợp đồng là bắt buộc" }),
    idTopic: z.string().min(1, { message: "Đề tài là bắt buộc" }),
    contractDetails: z.string().min(1, { message: "Chi tiết hợp đồng là bắt buộc" }),
    signedDate: z.string().min(1, { message: "Ngày ký là bắt buộc" }),
    status: z.nativeEnum(ContractStatus),
    contractFile: z.string().optional(),
});

interface CreateContractModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onContractAdded?: () => void
}

const CreateContractModal: React.FC<CreateContractModalProps> = ({ open, onOpenChange, onContractAdded }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [contractFile, setContractFile] = useState<File | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const [isLoadingTopics, setIsLoadingTopics] = useState(false)

    const form = useForm<ContractRequest & { contractFile?: string }>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            name: "",
            code: "",
            idTopic: "",
            contractDetails: "",
            signedDate: new Date().toISOString().split('T')[0],
            status: ContractStatus.PENDING,
            contractFile: "",
        },
        mode: "onBlur",
    })

    useEffect(() => {
        if (open) {
            fetchTopics()
        }
    }, [open])

    const fetchTopics = async () => {
        setIsLoadingTopics(true)
        try {
            const response = await TopicService.getAll({
                p: 1,
                s: 100,
            })

            if (response.status === 200 && response.data.code === 1000) {
                setTopics(response.data.data || [])
            }
        } catch (error) {
            console.error("Error fetching topics:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách đề tài. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setIsLoadingTopics(false)
        }
    }

    const onSubmit = async (data: ContractRequest & { contractFile?: string }) => {
        if (!contractFile) {
            toast({
                title: "Lỗi",
                description: "Vui lòng tải lên file hợp đồng.",
                variant: "error",
            })
            return
        }

        setIsSubmitting(true)
        try {
            const cleanedData = {
                name: trimAndStrip(data.name),
                code: trimAndStrip(data.code),
                idTopic: data.idTopic,
                contractDetails: trimAndStrip(data.contractDetails),
                signedDate: data.signedDate,
                status: data.status,
            }

            const response = await ContractService.createContract(cleanedData, contractFile);

            if (response.status !== 201 || response.data.code !== 1000) {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Đã xảy ra lỗi trong quá trình thêm hợp đồng mới.",
                    variant: "error",
                })
                return
            }

            toast({
                title: "Thành công",
                description: "Thêm hợp đồng mới thành công.",
            })

            form.reset()
            onContractAdded?.()
            onOpenChange(false)
        } catch (error) {
            console.error("Error adding contract:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi trong quá trình thêm hợp đồng mới. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (file: File | null) => {
        setContractFile(file)
    }

    const selectedTopic = topics.find(topic => topic.id?.toString() === form.watch("idTopic"))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Thêm mới hợp đồng
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Nhập thông tin chi tiết để tạo hợp đồng mới trong hệ thống
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 max-h-[calc(95vh-8rem)]">
                    <div className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Information Section */}
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Clipboard className="h-5 w-5 text-blue-600" />
                                            Thông tin cơ bản
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Code Field */}
                                        <FormField
                                            control={form.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Hash className="h-4 w-4" />
                                                        Mã hợp đồng <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nhập mã hợp đồng"
                                                            className="h-10"
                                                            {...field}
                                                        />
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
                                                    <FormLabel className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Tên hợp đồng <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nhập tên hợp đồng"
                                                            className="h-10"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Signed Date Field */}
                                            <FormField
                                                control={form.control}
                                                name="signedDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            Ngày ký <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="date"
                                                                className="h-10"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Status Field */}
                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4" />
                                                            Trạng thái <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <SelectTrigger className="h-10">
                                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value={ContractStatus.PENDING}>Chờ ký</SelectItem>
                                                                    <SelectItem value={ContractStatus.SIGNED}>Đã ký</SelectItem>
                                                                    <SelectItem value={ContractStatus.CANCELLED}>Đã hủy</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Topic Selection Section */}
                                <Card className="border-l-4 border-l-green-500">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-green-600" />
                                            Đề tài liên quan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="idTopic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Chọn đề tài <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            disabled={isLoadingTopics}
                                                        >
                                                            <SelectTrigger className="h-10">
                                                                <SelectValue placeholder="Chọn đề tài" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {isLoadingTopics ? (
                                                                    <div className="flex items-center justify-center p-4">
                                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                        Đang tải danh sách đề tài...
                                                                    </div>
                                                                ) : topics.length > 0 ? (
                                                                    topics.map(topic => (
                                                                        <SelectItem key={topic.id} value={topic.id!.toString()}>
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium">{topic.vietnameseName}</span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    Mã: {topic.topicCode}
                                                                                </span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-4 text-center text-muted-foreground">
                                                                        Không có đề tài nào
                                                                    </div>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                    {selectedTopic && (
                                                        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                                            <h4 className="font-medium text-green-800 mb-1">Đề tài đã chọn:</h4>
                                                            <p className="text-sm text-green-700">{selectedTopic.vietnameseName}</p>
                                                            <p className="text-xs text-green-600">Mã: {selectedTopic.topicCode}</p>
                                                        </div>
                                                    )}
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Contract Details Section */}
                                <Card className="border-l-4 border-l-purple-500">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Clipboard className="h-5 w-5 text-purple-600" />
                                            Chi tiết hợp đồng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="contractDetails"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Nội dung hợp đồng <span className="text-destructive">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Nhập chi tiết về hợp đồng, các điều khoản và nghĩa vụ của các bên..."
                                                            className="resize-none min-h-[120px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Mô tả chi tiết về nội dung hợp đồng, các điều khoản quan trọng và nghĩa vụ của các bên.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* File Upload Section */}
                                <Card className="border-l-4 border-l-orange-500">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-orange-600" />
                                            Tài liệu hợp đồng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="contractFile"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        File hợp đồng
                                                    </FormLabel>
                                                    <FormControl>
                                                        <FormFileUploadPreview
                                                            field={field}
                                                            fieldState={fieldState}
                                                            accept=".pdf,.doc,.docx"
                                                            maxSize={10}
                                                            placeholder="Tải lên file hợp đồng"
                                                            onFileChange={handleFileChange}
                                                            height="300px"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-rose-500">
                                                        Tải lên file hợp đồng ở định dạng PDF, DOC hoặc DOCX. Tải lên hợp đồng đã có chữ ký của 2 bên.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-muted-foreground">
                            Tất cả các trường có dấu <span className="text-destructive">*</span> là bắt buộc
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className="min-w-[100px] text-red-600 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Thêm mới
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateContractModal