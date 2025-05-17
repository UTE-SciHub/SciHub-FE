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
import type { Milestone } from "@/models/milestone"
import Loading from "@/components/loading/loading"
import { ArrowLeft, Plus, FileText, Calendar, DollarSign } from "lucide-react"
import { formatVND } from "@/utils/common"
import { formatDateString } from "@/utils/dateTimeFormat"
import { getBadge, getStatusClass } from "@/models/enums/topic-status.enum"
import { ProgressService } from "@/service/progress-service"
import type { Progress } from "@/models/progress"
import MilestoneAccordion from "@/pages/admin/topics/milestone/MilestoneAccordion"
import MilestoneForm from "@/pages/admin/topics/milestone/MilestoneForm"
import FeedbackList from "@/pages/admin/topics/feedback/FeedbackList"

const TopicProgressPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [topic, setTopic] = useState<Topic | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddingMilestone, setIsAddingMilestone] = useState(false)
    const [isEditingMilestone, setIsEditingMilestone] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
    const [isViewingReviews, setIsViewingReviews] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch topic details
    useEffect(() => {
        const fetchTopicDetails = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await TopicService.getById(id)
                if (response.status === 200 && response.data.code === 1000) {
                    setTopic(response.data.data)
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Không thể tải thông tin đề tài",
                        variant: "error",
                    })
                }
            } catch (error) {
                console.error("Error fetching topic:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin đề tài",
                    variant: "error",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchTopicDetails()
    }, [id])

    const fetchMilestones = async () => {
        if (!id) return

        try {
            const response = await MilestoneService.getByTopicId(id)
            if (response.status === 200 && response.data.code === 1000) {
                // Lấy danh sách milestone
                const milestoneData = response.data.data

                // Lấy progress reports cho từng milestone
                const milestonesWithProgress = await Promise.all(
                    milestoneData.map(async (milestone) => {
                        try {
                            const progressResponse = await ProgressService.getByMilestoneId(milestone.id)
                            if (progressResponse.status === 200 && progressResponse.data.code === 1000) {
                                return {
                                    ...milestone,
                                    progressReports: progressResponse.data.data,
                                }
                            }
                            return milestone
                        } catch (error) {
                            console.error(`Error fetching progress for milestone ${milestone.id}:`, error)
                            return milestone
                        }
                    }),
                )

                setMilestones(milestonesWithProgress)
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin tiến độ",
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

    // Fetch milestones
    useEffect(() => {
        if (!loading && topic) {
            fetchMilestones()
        }
    }, [id, topic, loading])

    const handleAddMilestone = () => {
        setSelectedMilestone(null)
        setIsAddingMilestone(true)
    }

    const handleEditMilestone = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setIsEditingMilestone(true)
    }

    const handleViewReviews = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setIsViewingReviews(true)
    }

    const handleSubmitMilestone = async (milestoneData: Milestone) => {
        setIsSubmitting(true)
        try {
            if (milestoneData.id) {
                // Update existing milestone
                const response = await MilestoneService.update(milestoneData.id, milestoneData)
                if (response.status === 200 && response.data.code === 1000) {
                    toast({
                        title: "Thành công",
                        description: "Cập nhật giai đoạn thành công",
                        variant: "success",
                    })

                    // Update milestones list
                    setMilestones((prev) => prev.map((m) => (m.id === milestoneData.id ? response.data.data : m)))

                    setIsEditingMilestone(false)
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Không thể cập nhật giai đoạn",
                        variant: "error",
                    })
                }
            } else {
                // Create new milestone
                const response = await MilestoneService.create(milestoneData)
                if (response.status === 201 && response.data.code === 1000) {
                    toast({
                        title: "Thành công",
                        description: "Tạo giai đoạn mới thành công",
                        variant: "success",
                    })

                    // Add new milestone to list
                    setMilestones((prev) => [...prev, response.data.data])

                    setIsAddingMilestone(false)
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Không thể tạo giai đoạn mới",
                        variant: "error",
                    })
                }
            }
        } catch (error) {
            console.error("Error submitting milestone:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi xử lý yêu cầu",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmitProgress = async (progressData: Progress, file: File | null) => {
        setIsSubmitting(true)
        try {
            if (progressData.id) {
                // Update existing progress
                const response = await ProgressService.update(progressData.id, progressData, file)
                if (response.status === 200 && response.data.code === 1000) {
                    toast({
                        title: "Thành công",
                        description: "Cập nhật báo cáo tiến độ thành công",
                        variant: "success",
                    })

                    // Refresh milestones to get updated data
                    if (id) {
                        const milestoneResponse = await MilestoneService.getByTopicId(id)
                        if (milestoneResponse.status === 200 && milestoneResponse.data.code === 1000) {
                            setMilestones(milestoneResponse.data.data)
                        }
                    }
                } else {
                    toast({
                        title: "Lỗi",
                        description: "Không thể cập nhật báo cáo tiến độ",
                        variant: "error",
                    })
                }
            } else {
                // Create new progress
                // const response = await ProgressService.create(progressData, file)
                // if (response.status === 201 && response.data.code === 1000) {
                //     toast({
                //         title: "Thành công",
                //         description: "Tạo báo cáo tiến độ mới thành công",
                //         variant: "success",
                //     })

                //     // Refresh milestones to get updated data
                //     if (id) {
                //         const milestoneResponse = await MilestoneService.getByTopicId(id)
                //         if (milestoneResponse.status === 200 && milestoneResponse.data.code === 1000) {
                //             setMilestones(milestoneResponse.data.data)
                //         }
                //     }
                // } else {
                //     toast({
                //         title: "Lỗi",
                //         description: "Không thể tạo báo cáo tiến độ mới",
                //         variant: "error",
                //     })
                // }

                console.log("Progress data:", progressData)
                console.log("File:", file)
            }
        } catch (error) {
            console.error("Error submitting progress:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi xử lý yêu cầu",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteProgress = async (progressId: number) => {
        try {
            const response = await ProgressService.delete(progressId)
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa báo cáo tiến độ",
                    variant: "success",
                })

                // Refresh milestones to get updated data
                if (id) {
                    const milestoneResponse = await MilestoneService.getByTopicId(id)
                    if (milestoneResponse.status === 200 && milestoneResponse.data.code === 1000) {
                        setMilestones(milestoneResponse.data.data)
                    }
                }
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể xóa báo cáo tiến độ",
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Error deleting progress:", error)
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi xử lý yêu cầu",
                variant: "error",
            })
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

            {/* Milestones Timeline */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tiến độ thực hiện</h2>
                <Button onClick={handleAddMilestone}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm giai đoạn
                </Button>
            </div>

            <MilestoneAccordion
                milestones={milestones}
                topicId={id || ""}
                onViewReviews={handleViewReviews}
                onEditMilestone={handleEditMilestone}
                onSubmitProgress={handleSubmitProgress}
                onDeleteProgress={handleDeleteProgress}
                isSubmitting={isSubmitting}
            />

            {/* Add Milestone Dialog */}
            <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
                <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                        <DialogTitle>Thêm giai đoạn mới</DialogTitle>
                    </DialogHeader>
                    <MilestoneForm
                        topicId={id || ""}
                        onSubmit={handleSubmitMilestone}
                        onCancel={() => setIsAddingMilestone(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Milestone Dialog */}
            <Dialog open={isEditingMilestone} onOpenChange={setIsEditingMilestone}>
                <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa giai đoạn</DialogTitle>
                    </DialogHeader>
                    {selectedMilestone && (
                        <MilestoneForm
                            topicId={id || ""}
                            initialData={selectedMilestone}
                            onSubmit={handleSubmitMilestone}
                            onCancel={() => setIsEditingMilestone(false)}
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

export default TopicProgressPage
