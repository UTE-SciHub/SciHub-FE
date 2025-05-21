"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { Review } from "@/models/review"
import type { Milestone } from "@/models/milestone"
import { formatDateString } from "@/utils/dateTimeFormat"

interface FeedbackProps {
    milestone: Milestone
    councilId: number
    initialData?: Review
    onSubmit: (data: Review) => void
    onCancel: () => void
    isSubmitting: boolean
}

const formSchema = z.object({
    comments: z.string().min(10, "Nhận xét phải có ít nhất 10 ký tự"),
})

const FeedbackForm: React.FC<FeedbackProps> = ({
    milestone,
    councilId,
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            comments: initialData?.comments || "",
        },
    })

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const reviewData: Review = {
            ...initialData,
            id: initialData?.id,
            councilId,
            milestoneId: milestone.id,
            comments: values.comments,
        }
        onSubmit(reviewData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <h3 className="font-medium text-blue-800 mb-2">Thông tin giai đoạn</h3>
                    <p className="text-sm text-blue-700 mb-1">
                        <span className="font-medium">Mô tả:</span> {milestone.description}
                    </p>
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">Ngày dự kiến hoàn thành:</span>{" "}
                        {formatDateString(milestone.expectedCompletionDate)}
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nhận xét đánh giá</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Nhập nhận xét đánh giá về giai đoạn này"
                                    {...field}
                                    rows={5}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                Đang xử lý...
                            </>
                        ) : initialData?.id ? (
                            "Cập nhật"
                        ) : (
                            "Gửi đánh giá"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default FeedbackForm