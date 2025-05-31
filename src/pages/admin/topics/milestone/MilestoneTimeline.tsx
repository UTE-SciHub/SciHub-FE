"use client"

import type React from "react"
import { type Milestone, MilestoneStatus, getMilestoneStatusClass, getMilestoneStatusText } from "@/models/milestone"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateString } from "@/utils/dateTimeFormat"
import { CheckCircle, Clock, AlertCircle, XCircle, HelpCircle, Pencil, BarChart2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface MilestoneTimelineProps {
    milestones: Milestone[]
    onViewReviews?: (milestone: Milestone) => void
    onEditMilestone?: (milestone: Milestone) => void
    onAddProgress?: (milestone: Milestone) => void
    onViewProgress?: (milestone: Milestone) => void
    isCouncilView?: boolean
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
    milestones,
    onViewReviews,
    onEditMilestone,
    onAddProgress,
    onViewProgress,
    isCouncilView = false,
}) => {
    // Sort milestones by expected completion date
    const sortedMilestones = [...milestones].sort(
        (a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime(),
    )

    const getStatusIcon = (status: MilestoneStatus) => {
        switch (status) {
            case MilestoneStatus.COMPLETED:
                return <CheckCircle className="h-8 w-8 text-green-600" />
            case MilestoneStatus.IN_PROGRESS:
                return <Clock className="h-8 w-8 text-blue-600" />
            case MilestoneStatus.PENDING:
            default:
                return <HelpCircle className="h-8 w-8 text-gray-600" />
        }
    }

    // Tính toán phần trăm tiến độ dựa trên báo cáo mới nhất
    const getLatestProgressPercent = (milestone: Milestone): number => {
        if (!milestone.progressReports || milestone.progressReports.length === 0) {
            return 0
        }

        // Sắp xếp theo thời gian và lấy báo cáo mới nhất
        const sortedReports = [...milestone.progressReports].sort(
            (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime(),
        )

        return sortedReports[0].progressPercent
    }

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Tiến độ thực hiện đề tài</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {sortedMilestones.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Chưa có giai đoạn nào được tạo cho đề tài này</div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                            {/* Milestones */}
                            <div className="space-y-8">
                                {sortedMilestones.map((milestone, index) => {
                                    const progressPercent = getLatestProgressPercent(milestone)
                                    const hasProgress = milestone.progressReports && milestone.progressReports.length > 0

                                    return (
                                        <div key={milestone.id} className="relative pl-16">
                                            {/* Status circle */}
                                            <div className="absolute left-0 w-14 flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                                    {getStatusIcon(milestone.status)}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div
                                                className={`
                                                border rounded-lg p-4 transition-all
                                                ${milestone.status === MilestoneStatus.COMPLETED
                                                        ? "border-green-200"
                                                        : milestone.status === MilestoneStatus.IN_PROGRESS
                                                            ? "border-blue-200"
                                                            : "border-gray-200"
                                                    }
                                            `}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                                    <h3 className="font-medium text-gray-900">
                                                        Giai đoạn {index + 1}: {milestone.description}
                                                    </h3>
                                                    <Badge className={getMilestoneStatusClass(milestone.status)}>
                                                        {getMilestoneStatusText(milestone.status)}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>Dự kiến hoàn thành: {formatDateString(milestone.expectedCompletionDate)}</p>

                                                    {/* Progress bar */}
                                                    {hasProgress && (
                                                        <div className="mt-3">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-medium">Tiến độ hiện tại</span>
                                                                <span className="text-xs font-medium">{progressPercent}%</span>
                                                            </div>
                                                            <Progress value={progressPercent} className="h-2" />
                                                        </div>
                                                    )}

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {milestone.reviews && milestone.reviews.length > 0 && (
                                                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                                {milestone.reviews.length} đánh giá
                                                            </span>
                                                        )}

                                                        {hasProgress && (
                                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                                {milestone.progressReports?.length} báo cáo
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {onViewReviews && (
                                                        <Button variant="default" size="sm" onClick={() => onViewReviews(milestone)}>
                                                            {isCouncilView ? "Xem đánh giá" : "Xem phản hồi"}
                                                        </Button>
                                                    )}

                                                    {onEditMilestone && !isCouncilView && (
                                                        <Button variant="outline" size="sm" onClick={() => onEditMilestone(milestone)}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                            Chỉnh sửa
                                                        </Button>
                                                    )}

                                                    {onAddProgress && !isCouncilView && (
                                                        <Button variant="outline" size="sm" onClick={() => onAddProgress(milestone)}>
                                                            <BarChart2 className="h-3.5 w-3.5" />
                                                            Báo cáo tiến độ
                                                        </Button>
                                                    )}

                                                    {onViewProgress && (
                                                        <Button
                                                            variant={hasProgress ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => onViewProgress(milestone)}
                                                            className={hasProgress ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                        >
                                                            <BarChart2 className="h-3.5 w-3.5" />
                                                            {hasProgress ? `Xem báo cáo (${milestone.progressReports?.length})` : "Xem báo cáo"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default MilestoneTimeline
