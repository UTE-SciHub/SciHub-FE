"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { TopicService } from "@/service/topic-service"
import type { Topic } from "@/models/topic"
import { MilestoneService } from "@/service/milestone-service"
import { type Milestone, getMilestoneStatusClass, getMilestoneStatusText } from "@/models/milestone"
import type { Review } from "@/models/review"
import Loading from "@/components/loading/loading"
import { ArrowLeft, FileText, Calendar, Clock, DollarSign, MessageSquare } from "lucide-react"
import { formatVND } from "@/utils/common"
import { formatDateString } from "@/utils/dateTimeFormat"
import { getBadge, getStatusClass } from "@/models/enums/topic-status.enum"
import FeedbackForm from "@/pages/admin/topics/feedback/FeedbackForm"
import FeedbackList from "@/pages/admin/topics/feedback/FeedbackList"

const TopicFeedbackPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [topic, setTopic] = useState<Topic | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
    const [isAddingReview, setIsAddingReview] = useState(false)
    const [isViewingReviews, setIsViewingReviews] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const councilId = 1

    // Fetch topic details
    useEffect(() => {
        const fetchTopicDetails = async () => {
            if (!id) {
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const response = await TopicService.getById(id)
                if (response.status === 200 && response.data.code === 1000) {
                    setTopic(response.data.data)
                } else {
                    toast({
                        title: "Lỗi",
                        description: response.data.message || "Không thể tải thông tin đề tài",
                        variant: "error",
                    })
                    setTopic(null)
                }
            } catch (error) {
                console.error("Error fetching topic:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin đề tài",
                    variant: "error",
                })
                setTopic(null)
            } finally {
                setLoading(false)
            }
        }

        fetchTopicDetails()
    }, [id])

    // Fetch milestones after topic is loaded
    useEffect(() => {
        const fetchMilestones = async () => {
            if (!id || !topic) return

            try {
                const response = await MilestoneService.getByTopicId(Number(id))
                if (response.status === 200 && response.data.code === 1000) {
                    setMilestones(response.data.data)
                } else {
                    toast({
                        title: "Lỗi",
                        description: response.data.message || "Không thể tải thông tin tiến độ",
                        variant: "error",
                    })
                }
            } catch (error) {
                console.error("Error fetching milestones:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin tiến độ",
                    variant: "error",
                })
            }
        }

        if (topic) {
            fetchMilestones()
        }
    }, [id, topic])

    const handleAddReview = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setIsAddingReview(true)
    }

    const handleViewReviews = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setIsViewingReviews(true)
    }

    const handleSubmitReview = async (reviewData: Review) => {
        if (!selectedMilestone || !selectedMilestone.id) return

        setIsSubmitting(true)
        try {
            const response = await MilestoneService.addReview(selectedMilestone.id, reviewData)
            if (response.status === 201 && response.data.code === 1000) {
                toast({
                    title: "Thành công",
                    description: "Đã gửi đánh giá thành công",
                    variant: "success",
                })

                // Update milestones list with new review
                const updatedMilestones = milestones.map((milestone) => {
                    if (milestone.id === selectedMilestone.id) {
                        const reviews = milestone.reviews || []
                        return {
                            ...milestone,
                            reviews: [...reviews, response.data.data],
                        }
                    }
                    return milestone
                })

                setMilestones(updatedMilestones)
                setIsAddingReview(false)
            } else {
                toast({
                    title: "Lỗi",
                    description: response.data.message || "Không thể gửi đánh giá",
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Error submitting review:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi xử lý yêu cầu",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return <Loading />
    }

    if (!topic) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy đề tài</h1>
                    <Button onClick={() => navigate(-1)}>Quay lại</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">{topic.vietnameseName}</h1>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getStatusClass(topic.status)}>{getBadge(topic.status)}</Badge>
                    {topic.approvedBudget && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Kinh phí được duyệt: {formatVND(topic.approvedBudget)} VNĐ
                        </Badge>
                    )}
                </div>
            </div>

            {/* Topic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            Thông tin đề tài
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">Mã đề tài</p>
                                <p className="font-medium">{topic.topicCode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tên đề tài</p>
                                <p className="font-medium">{topic.vietnameseName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Chủ nhiệm đề tài</p>
                                <p className="font-medium">{topic.principalInvestigator}</p>
                            </div>
                            {topic.englishName && (
                                <div>
                                    <p className="text-sm text-gray-500">Tên tiếng Anh</p>
                                    <p className="font-medium">{topic.englishName}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            Thời gian
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                                <p className="font-medium">{formatDateString(topic.startDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Thời gian thực hiện</p>
                                <p className="font-medium">{topic.durationInMonths} tháng</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Năm kết thúc</p>
                                <p className="font-medium">{topic.endYear}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                            Kinh phí
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">Tổng kinh phí dự kiến</p>
                                <p className="font-medium">{formatVND(topic.totalBudget)} VNĐ</p>
                            </div>
                            {topic.approvedBudget && (
                                <div>
                                    <p className="text-sm text-gray-500">Kinh phí được duyệt</p>
                                    <p className="font-medium text-green-600">{formatVND(topic.approvedBudget)} VNĐ</p>
                                </div>
                            )}
                            {topic.fundingSource && (
                                <div>
                                    <p className="text-sm text-gray-500">Nguồn kinh phí</p>
                                    <p className="font-medium">{topic.fundingSource}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Milestones List */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Đánh giá tiến độ thực hiện</h2>

                {milestones.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">Chưa có giai đoạn nào được tạo cho đề tài này</p>
                        <p className="text-gray-500 text-sm">Vui lòng liên hệ với chủ nhiệm đề tài để biết thêm thông tin</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {milestones.map((milestone) => (
                            <Card key={milestone.id} className="border border-gray-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={getMilestoneStatusClass(milestone.status)}>
                                                    {getMilestoneStatusText(milestone.status)}
                                                </Badge>
                                            </div>
                                            <h3 className="font-medium text-lg">{milestone.description}</h3>
                                            <p className="text-sm text-gray-500">
                                                Dự kiến hoàn thành: {formatDateString(milestone.expectedCompletionDate)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleViewReviews(milestone)}>
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                {milestone.reviews && milestone.reviews.length > 0
                                                    ? `Xem đánh giá (${milestone.reviews.length})`
                                                    : "Xem đánh giá"}
                                            </Button>
                                            <Button size="sm" onClick={() => handleAddReview(milestone)}>
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Đánh giá
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Review Dialog */}
            <Dialog open={isAddingReview} onOpenChange={setIsAddingReview}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Đánh giá giai đoạn</DialogTitle>
                    </DialogHeader>
                    {selectedMilestone && (
                        <FeedbackForm
                            milestone={selectedMilestone}
                            councilId={councilId}
                            onSubmit={handleSubmitReview}
                            onCancel={() => setIsAddingReview(false)}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* View Reviews Dialog */}
            <Dialog open={isViewingReviews} onOpenChange={setIsViewingReviews}>
                <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                        <DialogTitle>Đánh giá giai đoạn</DialogTitle>
                    </DialogHeader>
                    {selectedMilestone && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <h3 className="font-medium text-blue-800 mb-2">Thông tin giai đoạn</h3>
                                <p className="text-sm text-blue-700 mb-1">
                                    <span className="font-medium">Mô tả:</span> {selectedMilestone.description}
                                </p>
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Ngày dự kiến hoàn thành:</span>{" "}
                                    {formatDateString(selectedMilestone.expectedCompletionDate)}
                                </p>
                            </div>

                            <FeedbackList reviews={selectedMilestone.reviews || []} />

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setIsViewingReviews(false)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TopicFeedbackPage