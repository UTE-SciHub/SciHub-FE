"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { formatDateString } from "@/utils/dateTimeFormat"
import type { Review } from "@/models/review"
import type { Council } from "@/models/council"

interface FeedbackListProps {
    reviews: Review[]
    council?: Council
    userId?: string | number
    onEdit?: (review: Review) => void
    onDelete?: (review: Review) => void
}

const FeedbackList: React.FC<FeedbackListProps> = ({
    reviews,
    council,
    userId,
    onEdit,
    onDelete,
}) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                Chưa có đánh giá nào cho giai đoạn này
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <Card key={review.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Ngày tạo: {formatDateString(review.createdAt)}
                                </p>
                                <p className="mt-2 text-gray-700">{review.comments}</p>
                            </div>
                            {userId && review.createdBy === userId && (
                                <div className="flex gap-2">
                                    {onEdit && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(review)}
                                        >
                                            <Edit className="h-4 w-4" />
                                            Sửa
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => onDelete(review)}
                                        >
                                            <Trash className="h-4 w-4" />
                                            Xóa
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default FeedbackList