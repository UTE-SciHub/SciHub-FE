import type React from "react"
import { useState } from "react"
import { type Milestone, MilestoneStatus, getMilestoneStatusClass, getMilestoneStatusText } from "@/models/milestone"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateString } from "@/utils/dateTimeFormat"
import { CheckCircle, Clock, HelpCircle, Plus, FileText, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProgressList from "./ProgressList"
import type { Progress as ProgressType } from "@/models/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProgressForm from "@/pages/admin/topics/milestone/ProgressForm"

interface MilestoneAccordionProps {
    milestones: Milestone[]
    topicId: string
    onViewReviews?: (milestone: Milestone) => void
    onEditMilestone?: (milestone: Milestone) => void
    onSubmitProgress?: (progressData: ProgressType, file: File | null) => Promise<void>
    onDeleteProgress?: (progressId: number) => void
    isCouncilView?: boolean
}

const MilestoneAccordion: React.FC<MilestoneAccordionProps> = ({
    milestones,
    topicId,
    onViewReviews,
    onEditMilestone,
    onSubmitProgress,
    onDeleteProgress,
    isCouncilView,
}) => {
    const sortedMilestones = [...milestones].sort(
        (a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime(),
    )

    const [isAddingProgress, setIsAddingProgress] = useState(false)
    const [isEditingProgress, setIsEditingProgress] = useState(false)
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
    const [selectedProgress, setSelectedProgress] = useState<ProgressType | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    // Calculate progress percentage based on the latest report
    const getLatestProgressPercent = (milestone: Milestone): number => {
        if (!milestone.progressReports || milestone.progressReports.length === 0) {
            return 0
        }

        const sortedReports = [...milestone.progressReports].sort(
            (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime(),
        )

        return sortedReports[0].progressPercent || 0
    }

    const handleAddProgress = (milestone: Milestone) => {
        if (isCouncilView) return
        setSelectedMilestone(milestone)
        setSelectedProgress(null)
        setIsAddingProgress(true)
    }

    const handleEditProgress = (milestone: Milestone, progress: ProgressType) => {
        if (isCouncilView) return
        setSelectedMilestone(milestone)
        setSelectedProgress(progress)
        setIsEditingProgress(true)
    }

    const handleSubmitProgressForm = async (progressData: ProgressType, file: File | null) => {
        if (isCouncilView || !onSubmitProgress) return
        setIsSubmitting(true)
        try {
            await onSubmitProgress(progressData, file)
            setIsAddingProgress(false)
            setIsEditingProgress(false)
        } catch (error) {
            console.error("Error submitting progress:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteProgressItem = (progressId: number) => {
        if (isCouncilView || !onDeleteProgress) return
        onDeleteProgress(progressId)
    }

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    Tiến độ thực hiện đề tài
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
                {sortedMilestones.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[150px] text-gray-500">
                        Chưa có giai đoạn nào được tạo cho đề tài này
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {sortedMilestones.map((milestone, index) => {
                            const progressPercent = getLatestProgressPercent(milestone)
                            const hasProgress = milestone.progressReports && milestone.progressReports.length > 0
                            const progressCount = milestone.progressReports?.length || 0

                            return (
                                <AccordionItem
                                    key={milestone.id}
                                    value={`milestone-${milestone.id}`}
                                    className="border-b border-gray-200 last:border-0"
                                >
                                    <AccordionTrigger className="hover:no-underline py-4 px-4">
                                        <div className="flex items-center space-x-4 w-full">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                                    ${milestone.status === MilestoneStatus.COMPLETED
                                                        ? "bg-green-100"
                                                        : milestone.status === MilestoneStatus.IN_PROGRESS
                                                            ? "bg-blue-100"
                                                            : "bg-gray-100"
                                                    }`}
                                            >
                                                {getStatusIcon(milestone.status)}
                                            </div>
                                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <h3 className="font-medium text-gray-900 text-left">
                                                    Giai đoạn {index + 1}: {milestone.description}
                                                    {progressCount > 0 && (
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            ({progressCount} báo cáo)
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center space-x-2 sm:mt-0">
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
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pt-2 pb-4">
                                        <div className="ml-14">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium">Báo cáo tiến độ</h4>
                                                    {hasProgress && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {progressCount} báo cáo
                                                        </Badge>
                                                    )}
                                                </div>
                                                {!isCouncilView && (
                                                    <Button size="sm" onClick={() => handleAddProgress(milestone)}>
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Thêm báo cáo
                                                    </Button>
                                                )}
                                            </div>

                                            <ProgressList
                                                progressReports={milestone.progressReports || []}
                                                onEdit={(progress) => handleEditProgress(milestone, progress)}
                                                onDelete={handleDeleteProgressItem}
                                                isReadOnly={isCouncilView}
                                            />

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {onViewReviews && (
                                                    <Button variant="default" size="sm" onClick={() => onViewReviews(milestone)}>
                                                        <FileText className="h-3.5 w-3.5" />
                                                        {isCouncilView
                                                            ? `Xem đánh giá${milestone.reviews?.length > 0 ? ` (${milestone.reviews.length})` : ""}`
                                                            : `Xem phản hồi${milestone.reviews?.length > 0 ? ` (${milestone.reviews.length})` : ""}`}
                                                    </Button>
                                                )}

                                                {onEditMilestone && !isCouncilView && (
                                                    <Button variant="outline" size="sm" onClick={() => onEditMilestone(milestone)}>
                                                        <Edit className="h-3.5 w-3.5" />
                                                        Chỉnh sửa
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
                            <DialogTitle className="text-center">Thêm báo cáo tiến độ</DialogTitle>
                        </DialogHeader>
                        {selectedMilestone && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <h3 className="font-medium text-blue-800 mb-2 text-center">Thông tin giai đoạn</h3>
                                    <p className="text-sm text-blue-700 mb-1 text-center">
                                        <span className="font-medium">Mô tả:</span> {selectedMilestone.description}
                                    </p>
                                    <p className="text-sm text-blue-700 text-center">
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
                                    isCouncilView={isCouncilView}
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Progress Dialog */}
                <Dialog open={isEditingProgress} onOpenChange={setIsEditingProgress}>
                    <DialogContent className="sm:max-w-[650px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">Chỉnh sửa báo cáo tiến độ</DialogTitle>
                        </DialogHeader>
                        {selectedMilestone && selectedProgress && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <h3 className="font-medium text-blue-800 mb-2 text-center">Thông tin giai đoạn</h3>
                                    <p className="text-sm text-blue-700 mb-1 text-center">
                                        <span className="font-medium">Mô tả:</span> {selectedMilestone.description}
                                    </p>
                                    <p className="text-sm text-blue-700 text-center">
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
                                    isCouncilView={isCouncilView}
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