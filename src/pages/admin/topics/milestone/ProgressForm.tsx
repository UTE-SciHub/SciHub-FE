import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import type { Progress } from "@/models/progress"
import { FormFileUploadPreview } from "@/components/file-upload-preview/file-upload-preview"

const progressSchema = z.object({
    progressPercent: z.number().min(0).max(100),
    report: z.string().min(10, {
        message: "Báo cáo phải có ít nhất 10 ký tự",
    }),
    documentUrl: z.string().optional(),
})

interface ProgressFormProps {
    topicId: string
    milestoneId: number
    initialData?: Progress
    onSubmit: (data: Progress, documentFile: File | null) => void
    onCancel: () => void
    isSubmitting: boolean
    isCouncilView?: boolean
}

const ProgressForm: React.FC<ProgressFormProps> = ({
    topicId,
    milestoneId,
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
    isCouncilView = false,
}) => {
    const form = useForm<z.infer<typeof progressSchema>>({
        resolver: zodResolver(progressSchema),
        defaultValues: {
            progressPercent: initialData?.progressPercent || 0,
            report: initialData?.report || "",
            documentUrl: initialData?.documentUrl || "",
        },
    })

    const [documentFile, setDocumentFile] = React.useState<File | null>(null)

    const handleFileChange = (file: File | null) => {
        setDocumentFile(file)
        form.setValue("documentUrl", file ? "" : initialData?.documentUrl || "", { shouldValidate: true })
    }

    const handleSubmit = (values: z.infer<typeof progressSchema>) => {
        const progressData: Progress = {
            ...initialData,
            topicId,
            milestoneId,
            progressPercent: values.progressPercent,
            report: values.report,
            documentUrl: values.documentUrl,
        }
        onSubmit(progressData, documentFile)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="progressPercent"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tiến độ hoàn thành (%)</FormLabel>
                            <div className="space-y-2">
                                <Slider
                                    value={[field.value]}
                                    min={0}
                                    max={100}
                                    step={25}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    disabled={isSubmitting || isCouncilView}
                                />
                                <div className="flex justify-between">
                                    {Array.from({ length: 5 }, (_, i) => i * 25).map((tick) => (
                                        <span
                                            key={tick}
                                            className={`text-sm ${tick === field.value ? 'font-medium' : 'text-gray-500'}`}
                                        >
                                            {tick}%
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="report"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Báo cáo tiến độ</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Mô tả chi tiết về tiến độ thực hiện giai đoạn này"
                                    {...field}
                                    rows={5}
                                    disabled={isSubmitting || isCouncilView}
                                    readOnly={isCouncilView}
                                />
                            </FormControl>
                            <FormDescription>
                                Mô tả chi tiết công việc đã thực hiện, kết quả đạt được và các khó khăn gặp phải.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="documentUrl"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Tài liệu đính kèm</FormLabel>
                            <FormControl>
                                <FormFileUploadPreview
                                    field={field}
                                    fieldState={fieldState}
                                    accept=".pdf,.doc,.docx"
                                    maxSize={10}
                                    placeholder="Tải lên tài liệu minh chứng"
                                    onFileChange={handleFileChange}
                                    existingFile={initialData?.documentUrl}
                                    height="500px"
                                    disabled={isCouncilView}
                                />
                            </FormControl>
                            <FormDescription>Đính kèm tài liệu minh chứng (PDF, Word, Excel, PowerPoint)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!isCouncilView && (
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : initialData?.id ? (
                                "Cập nhật"
                            ) : (
                                "Thêm báo cáo"
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    )
}

export default ProgressForm