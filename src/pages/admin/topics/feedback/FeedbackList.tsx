import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDateString } from "@/utils/dateTimeFormat"
import type { Review } from "@/models/review"
import { getInitialsAvt } from "@/utils/common"

interface FeedbackListProps {
    reviews: Review[]
}

const FeedbackList: React.FC<FeedbackListProps> = ({ reviews }) => {
    // Sort reviews by created date (newest first)
    const sortedReviews = [...reviews].sort(
        (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime(),
    )

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Đánh giá từ hội đồng</CardTitle>
            </CardHeader>
            <CardContent>
                {sortedReviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào cho giai đoạn này</div>
                ) : (
                    <div className="space-y-6">
                        {sortedReviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="/placeholder.svg" alt="Avatar" />
                                        <AvatarFallback>{getInitialsAvt("Hội đồng")}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium text-gray-900">Hội đồng đánh giá</h3>
                                            <span className="text-sm text-gray-500">
                                                {review.createdAt ? formatDateString(review.createdAt) : ""}
                                            </span>
                                        </div>
                                        <div className="text-gray-700 whitespace-pre-line">{review.comments}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default FeedbackList
