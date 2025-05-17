"use client"

import type React from "react"
import { useState } from "react"
import { type Milestone, MilestoneStatus, getMilestoneStatusClass, getMilestoneStatusText } from "@/models/milestone"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateString } from "@/utils/dateTimeFormat"
import { CheckCircle, Clock, AlertCircle, XCircle, HelpCircle, Pencil, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProgressList from "./ProgressList"
import type { Progress as ProgressType } from "@/models/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProgressForm from "./ProgressForm"

interface MilestoneAccordionProps {
    milestones: Milestone[]
    topicId: string
    onViewReviews?: (milestone: Milestone) => void
    onEditMilestone?: (milestone: Milestone) => void
    onSubmitProgress?: (progressData: ProgressType, file: File | null) => void
    onDeleteProgress?: (progressId: number) => void
    isCouncilView?: boolean
    isSubmitting?: boolean
}

const MilestoneAccordion: React.FC<MilestoneAccordionProps> = ({
    milestones,
    topicId,
    onViewReviews,
    onEditMilestone,
    onSubmitProgress,
    onDeleteProgress,
    isCouncilView = false,
    isSubmitting = false,
}) => {
    // Sort milestones by expected completion date
    const sortedMilestones = [...milestones].sort(
        (a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime(),
    )

    const [isAddingProgress, setIsAddingProgress] = useState(false)
    const [isEditingProgress, setIsEditingProgress] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
    const [selectedProgress, setSelectedProgress] = useState<ProgressType | null>(null)

    const getStatusIcon = (status: MilestoneStatus) => {
        switch (status) {
            case MilestoneStatus.COMPLETED:
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case MilestoneStatus.IN_PROGRESS:
                return <Clock className="h-5 w-5 text-blue-600" />
            case MilestoneStatus.PENDING:
            default:
                return <HelpCircle className="h-5 w-5 text-gray-600" />
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

    const handleAddProgress = (milestone: Milestone) => {
        setSelectedMilestone(milestone)
        setSelectedProgress(null)
        setIsAddingProgress(true)
    }

    const handleEditProgress = (milestone: Milestone, progress: ProgressType) => {
        setSelectedMilestone(milestone)
        setSelectedProgress(progress)
        setIsEditingProgress(true)
    }

    const handleSubmitProgressForm = (progressData: ProgressType, file: File | null) => {
        if (onSubmitProgress) {
            onSubmitProgress(progressData, file)
            setIsAddingProgress(false)
            setIsEditingProgress(false)
        }
    }

    const handleDeleteProgressItem = (progressId: number) => {
        if (onDeleteProgress) {
            onDeleteProgress(progressId)
        }
    }

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Tiến độ thực hiện đề tài</CardTitle>
            </CardHeader>
            <CardContent>
                {sortedMilestones.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Chưa có giai đoạn nào được tạo cho đề tài này</div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {sortedMilestones.map((milestone, index) => {
                            const progressPercent = getLatestProgressPercent(milestone)
                            const hasProgress = milestone.progressReports && milestone.progressReports.length > 0

                            return (
                                <AccordionItem
                                    key={milestone.id}
                                    value={`milestone-${milestone.id}`}
                                    className="border-b border-gray-200 last:border-0"
                                >
                                    <AccordionTrigger className="hover:no-underline py-4 px-4">
                                        <div className="flex items-center space-x-3 w-full">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center 
                        ${milestone.status === MilestoneStatus.COMPLETED
                                                        ? "bg-green-100"
                                                        : milestone.status === MilestoneStatus.IN_PROGRESS
                                                            ? "bg-blue-100"
                                                            : "bg-gray-100"
                                                    }`}
                                            >
                                                {getStatusIcon(milestone.status)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                    <h3 className="font-medium text-gray-900">
                                                        Giai đoạn {index + 1}: {milestone.description}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                                                        <Badge className={getMilestoneStatusClass(milestone.status)}>
                                                            {getMilestoneStatusText(milestone.status)}
                                                        </Badge>
                                                        {hasProgress && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                {progressPercent}% hoàn thành
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Dự kiến hoàn thành: {formatDateString(milestone.expectedCompletionDate)}
                                                </p>

                                                {/* Progress bar */}
                                                {hasProgress && (
                                                    <div className="mt-2">
                                                        <Progress value={progressPercent} className="h-2" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pt-2 pb-4">
                                        <div className="pl-11">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium">Báo cáo tiến độ</h4>
                                                    {hasProgress && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {milestone.progressReports?.length} báo cáo
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Button size="sm" onClick={() => handleAddProgress(milestone)}>
                                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                                    Thêm báo cáo
                                                </Button>
                                            </div>

                                            <ProgressList
                                                progressReports={milestone.progressReports || []}
                                                onEdit={(progress) => handleEditProgress(milestone, progress)}
                                                onDelete={handleDeleteProgressItem}
                                            />

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {onViewReviews && (
                                                    <Button variant="outline" size="sm" onClick={() => onViewReviews(milestone)}>
                                                        <FileText className="h-3.5 w-3.5 mr-1" />
                                                        {isCouncilView ? "Xem đánh giá" : "Xem phản hồi"}
                                                    </Button>
                                                )}

                                                {onEditMilestone && !isCouncilView && (
                                                    <Button variant="outline" size="sm" onClick={() => onEditMilestone(milestone)}>
                                                        <Pencil className="h-3.5 w-3.5 mr-1" />
                                                        Chỉnh sửa giai đoạn
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                )}

                {/* Add Progress Dialog */}
                <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
                    <DialogContent className="sm:max-w-[650px]">
                        <DialogHeader>
                            <DialogTitle>Thêm báo cáo tiến độ</DialogTitle>
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

                                <ProgressForm
                                    topicId={topicId}
                                    milestoneId={selectedMilestone.id}
                                    onSubmit={handleSubmitProgressForm}
                                    onCancel={() => setIsAddingProgress(false)}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Progress Dialog */}
                <Dialog open={isEditingProgress} onOpenChange={setIsEditingProgress}>
                    <DialogContent className="sm:max-w-[650px]">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa báo cáo tiến độ</DialogTitle>
                        </DialogHeader>
                        {selectedMilestone && selectedProgress && (
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

                                <ProgressForm
                                    topicId={topicId}
                                    milestoneId={selectedMilestone.id}
                                    initialData={selectedProgress}
                                    onSubmit={handleSubmitProgressForm}
                                    onCancel={() => setIsEditingProgress(false)}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default MilestoneAccordion
