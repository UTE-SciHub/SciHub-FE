"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { TopicService } from "@/service/topic-service"
import { CouncilService } from "@/service/council-service"
import type { Topic } from "@/models/topic"
import { MilestoneService } from "@/service/milestone-service"
import { type Milestone, getMilestoneStatusClass, getMilestoneStatusText } from "@/models/milestone"
import type { Review } from "@/models/review"
import Loading from "@/components/loading/loading"
import { ArrowLeft, FileText, Calendar, DollarSign, MessageSquare, Clock, X, Edit, Trash } from "lucide-react"
import { formatVND } from "@/utils/common"
import { formatDateString } from "@/utils/dateTimeFormat"
import { getBadge, getStatusClass } from "@/models/enums/topic-status.enum"
import FeedbackForm from "@/pages/admin/topics/feedback/FeedbackForm"
import FeedbackList from "@/pages/admin/topics/feedback/FeedbackList"
import MilestoneAccordion from "@/pages/admin/topics/milestone/MilestoneAccordion"
import { Council } from "@/models/council"
import useUserStore from "@/store/userStore"

const TopicFeedbackPage: React.FC = () => {
    const { councilId, topicId } = useParams<{ councilId: string; topicId: string }>()
    const navigate = useNavigate()
    const user = useUserStore((state) => state.user)
    const [topic, setTopic] = useState<Topic | null>(null)
    const [council, setCouncil] = useState<Council | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
    const [isAddingReview, setIsAddingReview] = useState(false)
    const [isEditingReview, setIsEditingReview] = useState(false)
    const [isDeletingReview, setIsDeletingReview] = useState(false)
    const [isViewingReviews, setIsViewingReviews] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)

    // Fetch functions
    const fetchTopicDetails = async (topicId: string) => {
        try {
            const response = await TopicService.getById(topicId)
            if (response.status === 200 && response.data.code === 1000) {
                setTopic(response.data.data)
            } else {
                throw new Error(response.data.message || "Không thể tải thông tin đề tài")
            }
        } catch (error) {
            console.error("Error fetching topic:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải thông tin đề tài",
                variant: "error",
            })
            setTopic(null)
        }
    }

    const fetchCouncilDetails = async (councilId: string) => {
        try {
            const response = await CouncilService.getById(parseInt(councilId))
            if (response.status === 200 && response.data.code === 1000) {
                setCouncil(response.data.data)
            } else {
                throw new Error(response.data.message || "Không thể tải thông tin hội đồng")
            }
        } catch (error) {
            console.error("Error fetching council:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải thông tin hội đồng",
                variant: "error",
            })
            setCouncil(null)
        }
    }

    const fetchMilestones = async (topicId: string) => {
        try {
            const response = await MilestoneService.getByTopicId(topicId)
            if (response.status === 200 && response.data.code === 1000) {
                setMilestones(response.data.data)
            } else {
                throw new Error(response.data.message || "Không thể tải thông tin tiến độ")
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

    useEffect(() => {
        const loadData = async () => {
            if (!councilId || !topicId) {
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                await Promise.all([
                    fetchTopicDetails(topicId),
                    fetchCouncilDetails(councilId),
                    fetchMilestones(topicId)
                ])
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [topicId, councilId])

    const handleAddReview = async (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setSelectedReview(null)
        setIsAddingReview(true)
    }

    const handleEditReview = (milestone: Milestone, review: Review) => {
        setSelectedMilestone(milestone)
        setSelectedReview(review)
        setIsEditingReview(true)
    }

    const handleDeleteReview = (milestone: Milestone, review: Review) => {
        setSelectedMilestone(milestone)
        setSelectedReview(review)
        setIsDeletingReview(true)
    }

    const handleSubmitReview = async (reviewData: Review) => {
        if (!selectedMilestone || !selectedMilestone.id || !councilId || !topicId) return

        setIsSubmitting(true)
        try {
            const response = await MilestoneService.addReview(reviewData)
            if (response.status === 201 && response.data.code === 1000) {
                toast({
                    title: "Thành công",
                    description: "Đã gửi đánh giá thành công",
                    variant: "success",
                })
                await fetchMilestones(topicId) // Refetch milestones to sync data
                setIsAddingReview(false)
            } else {
                throw new Error(response.data.message || "Không thể gửi đánh giá")
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

    const handleUpdateReview = async (reviewData: Review) => {
        if (!selectedMilestone || !selectedReview || !councilId || !topicId) return

        setIsSubmitting(true)
        try {
            const response = await MilestoneService.updateReview(selectedReview.id, reviewData)
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Thành công",
                    description: "Đã cập nhật đánh giá thành công",
                    variant: "success",
                })
                await fetchMilestones(topicId) // Refetch milestones to sync data
                setIsEditingReview(false)
            } else {
                throw new Error(response.data.message || "Không thể cập nhật đánh giá")
            }
        } catch (error) {
            console.error("Error updating review:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi cập nhật đánh giá",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmDeleteReview = async () => {
        if (!selectedMilestone || !selectedReview || !topicId) return

        setIsSubmitting(true)
        try {
            const response = await MilestoneService.deleteReview(selectedReview.id)
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa đánh giá thành công",
                    variant: "success",
                })
                await fetchMilestones(topicId) // Refetch milestones to sync data
                setIsDeletingReview(false)
            } else {
                throw new Error(response.data.message || "Không thể xóa đánh giá")
            }
        } catch (error) {
            console.error("Error deleting review:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi xóa đánh giá",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleViewReviews = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setIsViewingReviews(true)
    }

    if (loading) {
        return <Loading />
    }

    if (!topic || !councilId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy đề tài hoặc hội đồng</h1>
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
                        <ArrowLeft className="h-4 w-4" />
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
                                                <MessageSquare className="h-4 w-4" />
                                                {milestone.reviews && milestone.reviews.length > 0
                                                    ? `Xem đánh giá (${milestone.reviews.length})`
                                                    : "Xem đánh giá"}
                                            </Button>
                                            <Button size="sm" onClick={() => handleAddReview(milestone)}>
                                                <MessageSquare className="h-4 w-4" />
                                                Đánh giá
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <MilestoneAccordion
                                            milestones={[milestone]}
                                            topicId={topicId || ""}
                                            onViewReviews={handleViewReviews}
                                            isCouncilView={true}
                                        />
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
                            councilId={parseInt(councilId)}
                            onSubmit={handleSubmitReview}
                            onCancel={() => setIsAddingReview(false)}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Review Dialog */}
            <Dialog open={isEditingReview} onOpenChange={setIsEditingReview}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
                    </DialogHeader>
                    {selectedMilestone && selectedReview && (
                        <FeedbackForm
                            milestone={selectedMilestone}
                            councilId={parseInt(councilId)}
                            initialData={selectedReview}
                            onSubmit={handleUpdateReview}
                            onCancel={() => setIsEditingReview(false)}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Review Confirmation Dialog */}
            <Dialog open={isDeletingReview} onOpenChange={setIsDeletingReview}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeletingReview(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDeleteReview}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                    Đang xóa...
                                </>
                            ) : (
                                "Xóa"
                            )}
                        </Button>
                    </DialogFooter>
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

                            <FeedbackList
                                reviews={selectedMilestone.reviews || []}
                                council={council}
                                userId={user?.id}
                                onEdit={(review) => handleEditReview(selectedMilestone, review)}
                                onDelete={(review) => handleDeleteReview(selectedMilestone, review)}
                            />

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setIsViewingReviews(false)}>
                                    <X className="h-4 w-4" /> Đóng
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