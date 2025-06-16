"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { MilestoneService } from "@/service/milestone-service"
import { TopicService } from "@/service/topic-service"
import type { Topic } from "@/models/topic"
import { MilestoneStatus, type Milestone } from "@/models/milestone"
import {
    Clock,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    BarChart3,
    Target,
    Timer,
    Award,
    FileText,
} from "lucide-react"
import MilestoneAccordion from "@/pages/admin/topics/milestone/MilestoneAccordion"
import FeedbackList from "@/pages/admin/topics/feedback/FeedbackList"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateString } from "@/utils/dateTimeFormat"

const MyTopicMilestones = () => {
    const { topicId } = useParams<{ topicId: string }>()
    const navigate = useNavigate()

    const [topic, setTopic] = useState<Topic | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [loadingMilestones, setLoadingMilestones] = useState(false)
    const [loadingTopic, setLoadingTopic] = useState(false)
    const [viewingReviews, setViewingReviews] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

    // Calculate milestone statistics
    const milestoneStats = useMemo(() => {
        const total = milestones.length
        const completed = milestones.filter((m) => m.status === MilestoneStatus.COMPLETED).length
        const inProgress = milestones.filter((m) => m.status === MilestoneStatus.IN_PROGRESS).length
        const pending = milestones.filter((m) => m.status === MilestoneStatus.PENDING).length
        const overdue = milestones.filter((m) => {
            const dueDate = new Date(m.expectedCompletionDate)
            const now = new Date()
            return m.status !== "COMPLETED" && dueDate < now
        }).length

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        return {
            total,
            completed,
            inProgress,
            pending,
            overdue,
            completionRate,
        }
    }, [milestones])

    // Get milestone status badge
    const getMilestoneStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Hoàn thành
                    </Badge>
                )
            case "IN_PROGRESS":
                return (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        <Timer className="w-3 h-3 mr-1" />
                        Đang thực hiện
                    </Badge>
                )
            case "PENDING":
                return (
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Chờ thực hiện
                    </Badge>
                )
            case "OVERDUE":
                return (
                    <Badge className="bg-red-50 text-red-700 border-red-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Quá hạn
                    </Badge>
                )
            default:
                return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Không xác định</Badge>
        }
    }

    // Get days until deadline
    const getDaysUntilDeadline = (expectedDate: string) => {
        const deadline = new Date(expectedDate)
        const now = new Date()
        const diffTime = deadline.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // Fetch topic details
    const fetchTopicDetails = async () => {
        if (!topicId) return

        setLoadingTopic(true)
        try {
            const response = await TopicService.getById(topicId)
            if (response.status === 200 && response.data.code === 1000) {
                setTopic(response.data.data)
            } else {
                toast({
                    title: "Có lỗi xảy ra!",
                    description: "Không thể tải thông tin đề tài. Vui lòng thử lại sau.",
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Error fetching topic details:", error)
            toast({
                title: "Có lỗi xảy ra!",
                description: "Không thể tải thông tin đề tài. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setLoadingTopic(false)
        }
    }

    // Fetch milestones for a topic
    const fetchMilestones = async () => {
        if (!topicId) return

        setLoadingMilestones(true)
        try {
            const response = await MilestoneService.getByTopicId(topicId)
            if (response.status === 200 && response.data.code === 1000) {
                setMilestones(response.data.data)
            } else {
                toast({
                    title: "Có lỗi xảy ra!",
                    description: "Không thể tải thông tin tiến độ. Vui lòng thử lại sau.",
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Error fetching milestones:", error)
            toast({
                title: "Có lỗi xảy ra!",
                description: "Không thể tải thông tin tiến độ. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setLoadingMilestones(false)
        }
    }

    // Function to view reviews for a milestone
    const handleViewReviews = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setViewingReviews(true)
    }

    useEffect(() => {
        fetchTopicDetails()
        fetchMilestones()
    }, [topicId])

    if (loadingTopic) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen p-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 hover:bg-gray-100">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>

                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="font-bold text-3xl tracking-tight text-gray-900">Tiến độ và đánh giá đề tài</h1>
                        <p className="text-lg font-medium text-gray-700">{topic?.vietnameseName}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                Mã đề tài: {topic?.topicCode}
                            </span>
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Thời gian thực hiện: {topic?.durationInMonths} tháng
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium uppercase tracking-wide">Tổng số giai đoạn</p>
                                <p className="text-3xl font-bold text-blue-900">{milestoneStats.total}</p>
                            </div>
                            <Target className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium uppercase tracking-wide">Đã hoàn thành</p>
                                <p className="text-3xl font-bold text-green-900">{milestoneStats.completed}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-sm font-medium uppercase tracking-wide">Đang thực hiện</p>
                                <p className="text-3xl font-bold text-yellow-900">{milestoneStats.inProgress}</p>
                            </div>
                            <Timer className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-600 text-sm font-medium uppercase tracking-wide">Quá hạn</p>
                                <p className="text-3xl font-bold text-red-900">{milestoneStats.overdue}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <TrendingUp className="h-6 w-6 mr-2 text-primary" />
                        Tổng quan tiến độ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Tiến độ hoàn thành tổng thể</span>
                            <span className="text-sm font-bold text-primary">{milestoneStats.completionRate}%</span>
                        </div>
                        <Progress value={milestoneStats.completionRate} className="h-3 bg-gray-200" />
                    </div>

                    {/* Visual Progress Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Phân bố trạng thái</h4>
                            <div className="flex items-center justify-center h-48">
                                <div className="flex items-end space-x-4 h-full">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="bg-green-500 w-12 rounded-t-lg transition-all duration-500"
                                            style={{
                                                height: `${milestoneStats.total > 0 ? (milestoneStats.completed / milestoneStats.total) * 160 : 0}px`,
                                            }}
                                        ></div>
                                        <p className="text-xs mt-2 font-medium text-green-600">Hoàn thành</p>
                                        <p className="text-sm font-bold text-green-700">{milestoneStats.completed}</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="bg-blue-500 w-12 rounded-t-lg transition-all duration-500"
                                            style={{
                                                height: `${milestoneStats.total > 0 ? (milestoneStats.inProgress / milestoneStats.total) * 160 : 0}px`,
                                            }}
                                        ></div>
                                        <p className="text-xs mt-2 font-medium text-blue-600">Đang thực hiện</p>
                                        <p className="text-sm font-bold text-blue-700">{milestoneStats.inProgress}</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="bg-yellow-500 w-12 rounded-t-lg transition-all duration-500"
                                            style={{
                                                height: `${milestoneStats.total > 0 ? (milestoneStats.pending / milestoneStats.total) * 160 : 0}px`,
                                            }}
                                        ></div>
                                        <p className="text-xs mt-2 font-medium text-yellow-600">Chờ thực hiện</p>
                                        <p className="text-sm font-bold text-yellow-700">{milestoneStats.pending}</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="bg-red-500 w-12 rounded-t-lg transition-all duration-500"
                                            style={{
                                                height: `${milestoneStats.total > 0 ? (milestoneStats.overdue / milestoneStats.total) * 160 : 0}px`,
                                            }}
                                        ></div>
                                        <p className="text-xs mt-2 font-medium text-red-600">Quá hạn</p>
                                        <p className="text-sm font-bold text-red-700">{milestoneStats.overdue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Thống kê chi tiết</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-green-800">Tỷ lệ hoàn thành</span>
                                    <span className="text-lg font-bold text-green-600">{milestoneStats.completionRate}%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-blue-800">Đang thực hiện</span>
                                    <span className="text-lg font-bold text-blue-600">{milestoneStats.inProgress} giai đoạn</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                    <span className="text-sm font-medium text-red-800">Cần chú ý (quá hạn)</span>
                                    <span className="text-lg font-bold text-red-600">{milestoneStats.overdue} giai đoạn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="timeline" className="space-y-6">
                <TabsList className="bg-white shadow-sm border">
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Timeline
                    </TabsTrigger>
                    <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        Chi tiết giai đoạn
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-6">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="h-6 w-6 mr-2 text-primary" />
                                Timeline thực hiện
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingMilestones ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                                </div>
                            ) : milestones.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 mb-2">Chưa có giai đoạn nào được tạo cho đề tài này</p>
                                    <p className="text-gray-500 text-sm">Vui lòng liên hệ với quản trị viên để biết thêm thông tin</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {milestones.map((milestone, index) => {
                                        const daysUntilDeadline = getDaysUntilDeadline(milestone.expectedCompletionDate)
                                        const isOverdue = daysUntilDeadline < 0 && milestone.status !== "COMPLETED"

                                        return (
                                            <div key={milestone.id} className="relative">
                                                {/* Timeline connector */}
                                                {index < milestones.length - 1 && (
                                                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
                                                )}

                                                <div className="flex items-start space-x-4">
                                                    {/* Timeline dot */}
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${milestone.status === "COMPLETED"
                                                                ? "bg-green-100 border-green-500"
                                                                : milestone.status === "IN_PROGRESS"
                                                                    ? "bg-blue-100 border-blue-500"
                                                                    : isOverdue
                                                                        ? "bg-red-100 border-red-500"
                                                                        : "bg-gray-100 border-gray-300"
                                                            }`}
                                                    >
                                                        {milestone.status === "COMPLETED" ? (
                                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                                        ) : milestone.status === "IN_PROGRESS" ? (
                                                            <Timer className="w-6 h-6 text-blue-600" />
                                                        ) : isOverdue ? (
                                                            <AlertCircle className="w-6 h-6 text-red-600" />
                                                        ) : (
                                                            <Clock className="w-6 h-6 text-gray-400" />
                                                        )}
                                                    </div>

                                                    {/* Milestone content */}
                                                    <div className="flex-1 bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-semibold text-lg text-gray-900">{milestone.description}</h3>
                                                            {getMilestoneStatusBadge(milestone.status)}
                                                        </div>

                                                        <p className="text-gray-600 mb-3">{milestone.description}</p>

                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center space-x-4">
                                                                <span className="flex items-center text-gray-500">
                                                                    <Calendar className="w-4 h-4 mr-1" />
                                                                    Ngày dự kiến hoàn thành: {formatDateString(milestone.expectedCompletionDate)}
                                                                </span>
                                                                {daysUntilDeadline > 0 && milestone.status !== "COMPLETED" && (
                                                                    <span className="text-orange-600 font-medium">Còn {daysUntilDeadline} ngày</span>
                                                                )}
                                                                {isOverdue && (
                                                                    <span className="text-red-600 font-medium">
                                                                        Quá hạn {Math.abs(daysUntilDeadline)} ngày
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {milestone.reviews && milestone.reviews.length > 0 && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewReviews(milestone)}
                                                                    className="text-primary hover:bg-primary/10"
                                                                >
                                                                    Xem đánh giá ({milestone.reviews.length})
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="details">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-6 w-6 mr-2 text-primary" />
                                Chi tiết các giai đoạn
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingMilestones ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                                </div>
                            ) : milestones.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 mb-2">Chưa có giai đoạn nào được tạo cho đề tài này</p>
                                    <p className="text-gray-500 text-sm">Vui lòng liên hệ với quản trị viên để biết thêm thông tin</p>
                                </div>
                            ) : (
                                <MilestoneAccordion
                                    milestones={milestones}
                                    topicId={topicId || ""}
                                    onViewReviews={handleViewReviews}
                                    isCouncilView={true}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialog for viewing reviews */}
            <Dialog open={viewingReviews} onOpenChange={setViewingReviews}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-xl">
                            <Award className="h-6 w-6 mr-2 text-primary" />
                            Đánh giá từ hội đồng
                        </DialogTitle>
                    </DialogHeader>

                    {selectedMilestone && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="font-semibold text-blue-900 mb-3 text-lg">Thông tin giai đoạn</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 mb-1">Tiêu đề:</p>
                                        <p className="text-blue-700">{selectedMilestone.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 mb-1">Trạng thái:</p>
                                        {getMilestoneStatusBadge(selectedMilestone.status)}
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium text-blue-800 mb-1">Mô tả:</p>
                                        <p className="text-blue-700">{selectedMilestone.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 mb-1">Ngày dự kiến hoàn thành:</p>
                                        <p className="text-blue-700">
                                            {formatDateString(selectedMilestone.expectedCompletionDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <FeedbackList reviews={selectedMilestone.reviews || []} />

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setViewingReviews(false)}>
                                    Đóng
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default MyTopicMilestones
