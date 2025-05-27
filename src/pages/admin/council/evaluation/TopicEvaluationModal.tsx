import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { CRITERIA_DETAILS } from "@/models/evaluation-detail"
import type { TopicApplication } from "@/models/topic-application"
import ReviewForm from "./ReviewForm"
import ReviewResult from "./ReviewResult"

interface TopicEvaluationModalProps {
    topic: any
    application: TopicApplication
    onComplete: (evaluationData: any) => void
    onCancel: () => void
    existingData?: any
}

export default function TopicEvaluationModal({
    topic,
    application,
    onComplete,
    onCancel,
    existingData,
}: TopicEvaluationModalProps) {
    const [activeTab, setActiveTab] = useState(existingData ? "result" : "form")
    const [reviewData, setReviewData] = useState(() => {
        if (existingData) {
            return existingData;
        }

        if (application.hasEvaluated && application.totalScore !== null) {
            const defaultScorePerCriteria = Math.floor(application.totalScore / CRITERIA_DETAILS.length);
            return {
                ...Object.fromEntries(CRITERIA_DETAILS.map((criteria) => [criteria.id, defaultScorePerCriteria])),
                additionalComments: "",
                totalScore: application.totalScore,
                passedAssessment: application.passed,
                councilDate: new Date().toISOString(),
            };
        }

        // Default to minimum scores if no existing data
        return {
            ...Object.fromEntries(CRITERIA_DETAILS.map((criteria) => [criteria.id, criteria.minScore])),
            additionalComments: "",
            totalScore: CRITERIA_DETAILS.reduce((sum, criteria) => sum + criteria.minScore, 0),
            councilDate: new Date().toISOString(),
        };
    })
    
    const formModifiedRef = useRef(false)

    const handleNextStep = (data: any) => {
        setReviewData(data)
        setActiveTab("result")
        formModifiedRef.current = false
    }

    const handlePreviousStep = () => {
        setActiveTab("form")
        formModifiedRef.current = true
    }
    
    const handleFormChange = (data: any) => {
        setReviewData(data)
        formModifiedRef.current = true
    }

    const handleSubmitReview = () => {
        if (!reviewData) return
        
        const completeEvaluationData = {
            researchOverviewScore: reviewData.researchOverviewScore,
            urgencyScore: reviewData.urgencyScore,
            objectiveScore: reviewData.objectiveScore,
            approachMethodScore: reviewData.approachMethodScore,
            contentAndTimelineScore: reviewData.contentAndTimelineScore,
            productScore: reviewData.productScore,
            effectivenessScore: reviewData.effectivenessScore,
            experienceScore: reviewData.experienceScore,
            institutionCapabilityScore: reviewData.institutionCapabilityScore,
            budgetScore: reviewData.budgetScore,
            totalScore: reviewData.totalScore,
            additionalComments: reviewData.additionalComments || "",
        }
        
        onComplete(completeEvaluationData)
    }

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <DialogTitle>Đánh giá ứng viên</DialogTitle>
                <DialogDescription>
                    {application.user.name} - {application.user.email}
                </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="px-6 pt-2">
                    <TabsTrigger value="form">Biểu mẫu đánh giá</TabsTrigger>
                    <TabsTrigger value="result">Kết quả đánh giá</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto">
                    <TabsContent value="form" className="mt-0 h-full">
                        <ReviewForm
                            topic={topic}
                            onNextStep={handleNextStep}
                            formData={reviewData}
                            onChange={handleFormChange}
                        />
                    </TabsContent>

                    <TabsContent value="result" className="mt-0 h-full">
                        {reviewData && <ReviewResult topic={topic} reviewData={reviewData} />}
                    </TabsContent>
                </div>
            </Tabs>

            <div className="px-6 py-4 border-t flex justify-between">
                {activeTab === "form" ? (
                    <>
                        <Button variant="outline" onClick={onCancel}>
                            Hủy
                        </Button>
                        <Button
                            onClick={() => {
                                document.getElementById('review-form-submit-button')?.click()
                            }}
                        >
                            Xem kết quả <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" onClick={handlePreviousStep}>
                            <ArrowLeft className="h-4 w-4" /> Quay lại chỉnh sửa
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={application.hasEvaluated}
                        >
                            Hoàn tất
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}