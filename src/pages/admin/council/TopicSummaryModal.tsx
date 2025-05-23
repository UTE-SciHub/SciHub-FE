import { useState } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download, FileText, BarChart2 } from "lucide-react"
import { type TopicApplication, ApplicationStatus } from "@/models/topic-application"
import { getTotalMaxScore, getTotalMinScore } from "@/models/evaluation-detail"
import { toast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitialsAvt } from "@/utils/common"
import { Progress } from "@/components/ui/progress"
import { EvaluationService } from "@/service/evaluation-service"

interface TopicSummaryModalProps {
    topic: any
    applications: TopicApplication[]
    onClose: () => void
    councilId: string
}

export default function TopicSummaryModal({ topic, applications = [], onClose, councilId }: TopicSummaryModalProps) {
    const [activeTab, setActiveTab] = useState("list")
    const [isExporting, setIsExporting] = useState(false)
    const [rankedApplications, setRankedApplications] = useState<TopicApplication[]>([])
    const [isSummarizing, setIsSummarizing] = useState(false)

    if (!topic) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Không tìm thấy thông tin đề tài</p>
            </div>
        )
    }

    // Tính toán số liệu thống kê
    const totalApplications = applications.length
    const evaluatedApplications = applications.filter((app) => app.hasEvaluated).length
    const passedApplications = applications.filter((app) => app.passed === true).length
    const failedApplications = applications.filter((app) => app.passed === false).length
    const pendingApplications = applications.filter((app) => !app.hasEvaluated).length

    // Hàm gọi API để tổng kết
    const handleSummarize = async () => {
        setIsSummarizing(true)
        try {
            const response = await EvaluationService.determinePrincipalInvestigator(councilId, topic.id.toString())
            if (response.status === 200) {
                const rankedApps = response.data.data as TopicApplication[]
                setRankedApplications(rankedApps)
                toast({
                    title: "Thành công",
                    description: "Đã tổng kết và xếp hạng ứng viên.",
                    variant: "success",
                })
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tổng kết. Vui lòng thử lại.",
                    variant: "error",
                })
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi tổng kết.",
                variant: "error",
            })
        } finally {
            setIsSummarizing(false)
        }
    }

    // Sắp xếp ứng viên theo điểm số (từ cao đến thấp) từ API hoặc dữ liệu ban đầu
    const displayApplications = rankedApplications.length > 0 ? rankedApplications : [...applications].sort((a, b) => {
        if (!a.hasEvaluated) return 1
        if (!b.hasEvaluated) return -1
        return (b.totalScore || 0) - (a.totalScore || 0)
    })

    // Hàm hiển thị trạng thái ứng viên
    const getApplicationStatusBadge = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.APPROVED:
                return <Badge className="bg-green-100 text-green-800 border-green-200">Đã duyệt</Badge>
            case ApplicationStatus.REJECTED:
                return <Badge className="bg-red-100 text-red-800 border-red-200">Từ chối</Badge>
            case ApplicationStatus.IN_PROGRESS:
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đang xét duyệt</Badge>
            case ApplicationStatus.PENDING:
            default:
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Chờ đánh giá</Badge>
        }
    }

    // Hàm xuất báo cáo
    const exportReport = () => {
        setIsExporting(true)
        try {
            // Mô phỏng xuất báo cáo
            setTimeout(() => {
                toast({
                    title: "Xuất báo cáo thành công",
                    description: "Báo cáo đã được tải xuống",
                    variant: "success",
                })
                setIsExporting(false)
            }, 1000)
        } catch (error) {
            toast({
                title: "Lỗi khi xuất báo cáo",
                description: "Không thể xuất báo cáo. Vui lòng thử lại.",
                variant: "error",
            })
            setIsExporting(false)
        }
    }

    // Lấy điểm tối thiểu và tối đa
    const minScore = getTotalMinScore()
    const maxScore = getTotalMaxScore()

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b flex justify-between items-center">
                <div>
                    <DialogTitle>Tổng kết đánh giá đề tài</DialogTitle>
                    <DialogDescription>
                        {topic.vietnameseName} - {topic.topicCode}
                    </DialogDescription>
                </div>
                <Button variant="default" onClick={handleSummarize} disabled={isSummarizing}>
                    {isSummarizing ? "Đang tổng kết..." : "Tổng kết"}
                </Button>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4 flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="list">Danh sách ứng viên</TabsTrigger>
                        <TabsTrigger value="stats">Thống kê</TabsTrigger>
                    </TabsList>
                    <Button variant="outline" onClick={exportReport} disabled={isExporting}>
                        <Download className="h-4 w-4 mr-2" />
                        {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <TabsContent value="list" className="mt-0">
                        {displayApplications.length > 0 ? (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Bảng xếp hạng ứng viên</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Accordion type="single" collapsible className="w-full">
                                        {displayApplications.map((application, index) => (
                                            <AccordionItem key={application.id} value={`item-${application.id}`}>
                                                <div className="border-b">
                                                    <div className="flex items-center px-4 py-3">
                                                        <div className="w-[50px] font-medium">{application.hasEvaluated ? index + 1 : "-"}</div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback>{getInitialsAvt(application.user.name)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">{application.user.name}</div>
                                                                    <div className="text-xs text-muted-foreground">{application.user.email}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-[120px]">{getApplicationStatusBadge(application.status)}</div>
                                                        <div className="w-[100px]">
                                                            {application.hasEvaluated ? (
                                                                <span
                                                                    className={
                                                                        application.passed ? "text-green-600 font-medium" : "text-red-600 font-medium"
                                                                    }
                                                                >
                                                                    {application.totalScore?.toFixed(1)}/{maxScore}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">Chưa đánh giá</span>
                                                            )}
                                                        </div>
                                                        <AccordionTrigger className="w-[50px]" />
                                                    </div>
                                                </div>
                                                <AccordionContent>
                                                    <div className="px-4 py-3 bg-muted/20">
                                                        <h4 className="font-medium mb-2">Thông tin đăng ký</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <h5 className="text-sm font-medium text-muted-foreground mb-1">Kế hoạch nghiên cứu</h5>
                                                                <p className="text-sm bg-background p-3 rounded border">
                                                                    {application.plan || "Không có thông tin"}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-medium text-muted-foreground mb-1">Động lực nghiên cứu</h5>
                                                                <p className="text-sm bg-background p-3 rounded border">
                                                                    {application.motivation || "Không có thông tin"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {application.hasEvaluated && (
                                                            <div>
                                                                <h4 className="font-medium mb-2">Kết quả đánh giá</h4>
                                                                <div className="bg-background p-4 rounded border mb-4">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-medium">Tổng điểm:</span>
                                                                        <span
                                                                            className={
                                                                                application.passed ? "text-green-600 font-bold" : "text-red-600 font-bold"
                                                                            }
                                                                        >
                                                                            {application.totalScore?.toFixed(1)}/{maxScore}
                                                                        </span>
                                                                    </div>
                                                                    <Progress
                                                                        value={((application.totalScore || 0) / maxScore) * 100}
                                                                        className={`h-2 ${application.passed ? "bg-green-100" : "bg-red-100"}`}
                                                                    />
                                                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                        <span>Điểm tối thiểu: {minScore}</span>
                                                                        <span>Điểm tối đa: {maxScore}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {application.notes && (
                                                            <div className="mt-4">
                                                                <h4 className="font-medium mb-2">Ghi chú</h4>
                                                                <p className="text-sm bg-background p-3 rounded border">{application.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Không có ứng viên</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">Không có ứng viên nào đăng ký đề tài này.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="stats" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Tổng quan đánh giá</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">Tổng số ứng viên</p>
                                                <p className="text-2xl font-medium mt-1 text-gray-800">{totalApplications}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                                <p className="text-xs text-green-600 uppercase tracking-wider font-medium">Đã đánh giá</p>
                                                <p className="text-2xl font-medium mt-1 text-gray-800">{evaluatedApplications}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                                <p className="text-xs text-green-600 uppercase tracking-wider font-medium">Đạt yêu cầu</p>
                                                <p className="text-2xl font-medium mt-1 text-gray-800">{passedApplications}</p>
                                            </div>
                                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                <p className="text-xs text-red-600 uppercase tracking-wider font-medium">Không đạt</p>
                                                <p className="text-2xl font-medium mt-1 text-gray-800">{failedApplications}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Tiến độ đánh giá</h4>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                    style={{
                                                        width: `${totalApplications > 0 ? (evaluatedApplications / totalApplications) * 100 : 0}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {evaluatedApplications}/{totalApplications} ứng viên đã được đánh giá (
                                                {totalApplications > 0 ? Math.round((evaluatedApplications / totalApplications) * 100) : 0}%)
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Phân bố kết quả</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {applications.length > 0 ? (
                                        <div className="flex items-center justify-center h-[200px]">
                                            <div className="flex items-end h-full w-full max-w-md space-x-2">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="bg-green-500 w-16 rounded-t"
                                                        style={{ height: `${(passedApplications / Math.max(totalApplications, 1)) * 150}px` }}
                                                    ></div>
                                                    <p className="text-xs mt-2">Đạt</p>
                                                    <p className="text-sm font-medium">{passedApplications}</p>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="bg-red-500 w-16 rounded-t"
                                                        style={{ height: `${(failedApplications / Math.max(totalApplications, 1)) * 150}px` }}
                                                    ></div>
                                                    <p className="text-xs mt-2">Không đạt</p>
                                                    <p className="text-sm font-medium">{failedApplications}</p>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="bg-gray-300 w-16 rounded-t"
                                                        style={{ height: `${(pendingApplications / Math.max(totalApplications, 1)) * 150}px` }}
                                                    ></div>
                                                    <p className="text-xs mt-2">Chưa đánh giá</p>
                                                    <p className="text-sm font-medium">{pendingApplications}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <BarChart2 className="h-12 w-12 text-gray-300 mb-4" />
                                            <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {applications.length > 0 && evaluatedApplications > 0 && (
                                <Card className="md:col-span-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Kết quả đánh giá</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg border">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Điểm trung bình</h4>
                                                <p className="text-2xl font-medium">
                                                    {evaluatedApplications > 0
                                                        ? (
                                                            applications.reduce((sum, app) => sum + (app.totalScore || 0), 0) /
                                                            evaluatedApplications
                                                        ).toFixed(2)
                                                        : "N/A"}
                                                    <span className="text-sm text-muted-foreground ml-1">/ {maxScore}</span>
                                                </p>
                                            </div>

                                            {evaluatedApplications > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium text-gray-700">Ứng viên có điểm cao nhất</h4>
                                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback>
                                                                    {getInitialsAvt(displayApplications[0]?.user.name || "")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{displayApplications[0]?.user.name}</p>
                                                                <p className="text-sm text-gray-500">{displayApplications[0]?.user.email}</p>
                                                            </div>
                                                            <div className="ml-auto">
                                                                <span className="text-lg font-bold text-green-600">
                                                                    {displayApplications[0]?.totalScore?.toFixed(1)}/{maxScore}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <div className="px-6 py-4 border-t flex justify-end">
                <Button onClick={onClose}>Đóng</Button>
            </div>
        </div>
    )
}