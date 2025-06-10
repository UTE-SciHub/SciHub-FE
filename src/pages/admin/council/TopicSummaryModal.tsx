import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download, FileText, BarChart2, Trophy, Medal, Award, CheckCircle2 } from "lucide-react"
import { type TopicApplication, ApplicationStatus } from "@/models/topic-application"
import { getTotalMaxScore, getTotalMinScore } from "@/models/evaluation-detail"
import { toast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitialsAvt } from "@/utils/common"
import { Progress } from "@/components/ui/progress"
import { EvaluationService } from "@/service/evaluation-service"
import {
    Dialog,
    DialogTitle as DialogTitleComponent,
    DialogDescription as DialogDescriptionComponent,
} from "@/components/ui/dialog"
import { DialogHeader as DialogHeaderComponent } from "@/components/ui/dialog"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    const [showCongrats, setShowCongrats] = useState(false)
    const [principalInvestigator, setPrincipalInvestigator] = useState("")

    if (!topic) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy thông tin đề tài</p>
                <p className="text-gray-500">Vui lòng thử lại sau</p>
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
                if (rankedApps.length > 0) {
                    setPrincipalInvestigator(rankedApps[0].user.name)
                }
                setShowCongrats(true)
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
    const displayApplications =
        rankedApplications.length > 0
            ? rankedApplications
            : [...applications].sort((a, b) => {
                if (!a.hasEvaluated) return 1
                if (!b.hasEvaluated) return -1
                return (b.totalScore || 0) - (a.totalScore || 0)
            })

    const isPrincipalInvestigatorDetermined =
        displayApplications.length > 0 &&
        displayApplications[0].status === ApplicationStatus.APPROVED &&
        displayApplications[0].hasEvaluated

    // Hàm hiển thị trạng thái ứng viên
    const getApplicationStatusBadge = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.APPROVED:
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Đã duyệt</Badge>
            case ApplicationStatus.REJECTED:
                return <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">Từ chối</Badge>
            case ApplicationStatus.IN_PROGRESS:
                return <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">Đang xét duyệt</Badge>
            case ApplicationStatus.PENDING:
            default:
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Chờ đánh giá</Badge>
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
        <div className="flex flex-col h-full max-h-[90vh] bg-gradient-to-br from-slate-50 to-white">
            <DialogHeaderComponent className="px-8 pt-8 pb-6 border-b bg-white/80 backdrop-blur-sm">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <DialogTitleComponent className="text-2xl font-bold text-gray-900">
                            Tổng kết đánh giá đề tài
                        </DialogTitleComponent>
                        <DialogDescriptionComponent className="text-base text-gray-600">
                            <span className="font-medium">{topic.vietnameseName}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{topic.topicCode}</span>
                        </DialogDescriptionComponent>
                        {isPrincipalInvestigatorDetermined && (
                            <div className="mt-3 flex items-center space-x-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Chủ nhiệm đề tài đã được xác định: {displayApplications[0].user.name}
                                </span>
                            </div>
                        )}
                    </div>
                    {applications.length > 0 && !isPrincipalInvestigatorDetermined && (
                        <Button
                            variant="default"
                            onClick={handleSummarize}
                            disabled={isSummarizing}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isSummarizing ? "Đang tổng kết..." : "Tổng kết đánh giá"}
                        </Button>
                    )}
                </div>
            </DialogHeaderComponent>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-8 pt-6 pb-4 bg-white/50 border-b flex justify-between items-center">
                    <TabsList className="bg-white shadow-sm border">
                        <TabsTrigger value="list" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            Danh sách ứng viên
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            Thống kê
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        variant="outline"
                        onClick={exportReport}
                        disabled={isExporting}
                        className="shadow-sm border-gray-200 hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-8">
                    <TabsContent value="list" className="mt-0">
                        {displayApplications.length > 0 ? (
                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b">
                                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                        <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                                        Bảng xếp hạng ứng viên
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Accordion type="single" collapsible className="w-full">
                                        {displayApplications.map((application, index) => (
                                            <AccordionItem key={application.id} value={`item-${application.id}`} className="border-b-0">
                                                <div className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex items-center px-6 py-4">
                                                        <div className="w-[60px] flex items-center justify-center">
                                                            {application.hasEvaluated ? (
                                                                <span className="font-bold text-lg text-gray-700">#{index + 1}</span>
                                                            ) : (
                                                                <span className="text-gray-400 font-medium">-</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                                    <AvatarFallback className="bg-gradient-to-br text-white font-medium">
                                                                        {getInitialsAvt(application.user.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">{application.user.name}</div>
                                                                    <div className="text-sm text-gray-500">{application.user.email}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-[140px]">{getApplicationStatusBadge(application.status)}</div>
                                                        <div className="w-[120px] text-right">
                                                            {application.hasEvaluated ? (
                                                                <div className="space-y-1">
                                                                    <span
                                                                        className={`text-lg font-bold ${application.passed ? "text-emerald-600" : "text-red-600"
                                                                            }`}
                                                                    >
                                                                        {application.totalScore?.toFixed(1)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 font-medium">Chưa đánh giá</span>
                                                            )}
                                                        </div>
                                                        <AccordionTrigger className="w-[50px] hover:no-underline" />
                                                    </div>
                                                </div>
                                                <AccordionContent>
                                                    <div className="px-6 py-6 bg-gradient-to-r from-gray-50/50 to-white border-t">
                                                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Thông tin đăng ký</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                            <div className="space-y-2">
                                                                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                                    Kế hoạch nghiên cứu
                                                                </h5>
                                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                                        {application.plan || "Không có thông tin"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                                    Động lực nghiên cứu
                                                                </h5>
                                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                                        {application.motivation || "Không có thông tin"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {application.hasEvaluated && (
                                                            <div className="space-y-4">
                                                                <h4 className="font-semibold text-gray-900 text-lg">Kết quả đánh giá</h4>
                                                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                                                    <div className="flex justify-between items-center mb-4">
                                                                        <span className="font-semibold text-gray-700">Tổng điểm:</span>
                                                                        <span
                                                                            className={`text-2xl font-bold ${application.passed ? "text-emerald-600" : "text-red-600"
                                                                                }`}
                                                                        >
                                                                            {application.totalScore?.toFixed(1)}
                                                                        </span>
                                                                    </div>
                                                                    <Progress
                                                                        value={((application.totalScore || 0) / maxScore) * 100}
                                                                        className={`h-3 ${application.passed
                                                                                ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-600"
                                                                                : "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600"
                                                                            }`}
                                                                    />
                                                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                                                        <span>Điểm tối thiểu: {minScore}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {application.notes && (
                                                            <div className="mt-6 space-y-2">
                                                                <h4 className="font-semibold text-gray-900">Ghi chú</h4>
                                                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                                                    <p className="text-sm text-gray-700 leading-relaxed">{application.notes}</p>
                                                                </div>
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
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FileText className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có ứng viên</h3>
                                <p className="text-gray-500 max-w-md mx-auto">Không có ứng viên nào đăng ký đề tài này.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="stats" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-gray-900">Tổng quan đánh giá</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
                                            <p className="text-xs text-blue-700 uppercase tracking-wider font-semibold mb-1">
                                                Tổng số ứng viên
                                            </p>
                                            <p className="text-3xl font-bold text-blue-900">{totalApplications}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm">
                                            <p className="text-xs text-emerald-700 uppercase tracking-wider font-semibold mb-1">
                                                Đã đánh giá
                                            </p>
                                            <p className="text-3xl font-bold text-emerald-900">{evaluatedApplications}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
                                            <p className="text-xs text-green-700 uppercase tracking-wider font-semibold mb-1">Đạt yêu cầu</p>
                                            <p className="text-3xl font-bold text-green-900">{passedApplications}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200 shadow-sm">
                                            <p className="text-xs text-red-700 uppercase tracking-wider font-semibold mb-1">Không đạt</p>
                                            <p className="text-3xl font-bold text-red-900">{failedApplications}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tiến độ đánh giá</h4>
                                        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full shadow-sm transition-all duration-500"
                                                style={{
                                                    width: `${totalApplications > 0 ? (evaluatedApplications / totalApplications) * 100 : 0}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-600">
                                                {evaluatedApplications}/{totalApplications} ứng viên đã được đánh giá
                                            </p>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {totalApplications > 0 ? Math.round((evaluatedApplications / totalApplications) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-gray-900">Phân bố kết quả</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {applications.length > 0 ? (
                                        <div className="flex items-center justify-center h-[240px]">
                                            <div className="flex items-end h-full w-full max-w-sm space-x-6">
                                                <div className="flex flex-col items-center flex-1">
                                                    <div
                                                        className="bg-gradient-to-t from-emerald-500 to-emerald-400 w-full rounded-t-lg shadow-lg transition-all duration-500"
                                                        style={{
                                                            height: `${Math.max((passedApplications / Math.max(totalApplications, 1)) * 180, 8)}px`,
                                                        }}
                                                    ></div>
                                                    <p className="text-xs font-semibold text-gray-600 mt-3 uppercase tracking-wide">Đạt</p>
                                                    <p className="text-lg font-bold text-emerald-600">{passedApplications}</p>
                                                </div>
                                                <div className="flex flex-col items-center flex-1">
                                                    <div
                                                        className="bg-gradient-to-t from-red-500 to-red-400 w-full rounded-t-lg shadow-lg transition-all duration-500"
                                                        style={{
                                                            height: `${Math.max((failedApplications / Math.max(totalApplications, 1)) * 180, 8)}px`,
                                                        }}
                                                    ></div>
                                                    <p className="text-xs font-semibold text-gray-600 mt-3 uppercase tracking-wide">Không đạt</p>
                                                    <p className="text-lg font-bold text-red-600">{failedApplications}</p>
                                                </div>
                                                <div className="flex flex-col items-center flex-1">
                                                    <div
                                                        className="bg-gradient-to-t from-gray-400 to-gray-300 w-full rounded-t-lg shadow-lg transition-all duration-500"
                                                        style={{
                                                            height: `${Math.max((pendingApplications / Math.max(totalApplications, 1)) * 180, 8)}px`,
                                                        }}
                                                    ></div>
                                                    <p className="text-xs font-semibold text-gray-600 mt-3 uppercase tracking-wide">
                                                        Chưa đánh giá
                                                    </p>
                                                    <p className="text-lg font-bold text-gray-600">{pendingApplications}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <BarChart2 className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">Không có dữ liệu để hiển thị</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {applications.length > 0 && evaluatedApplications > 0 && (
                                <Card className="md:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl font-bold text-gray-900">Kết quả đánh giá chi tiết</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {evaluatedApplications > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                    Ứng viên được chọn làm chủ nhiệm đề tài
                                                </h4>
                                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200 shadow-sm">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-lg text-gray-900">{displayApplications[0]?.user.name}</p>
                                                            <p className="text-sm text-gray-600">{displayApplications[0]?.user.email}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-3xl font-bold text-emerald-600">
                                                                {displayApplications[0]?.totalScore?.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <div className="px-8 py-6 border-t bg-white/80 backdrop-blur-sm flex justify-end">
                <Button size="lg" onClick={onClose} variant="outline">
                    Đóng
                </Button>
            </div>
            <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitleComponent>🎉 Chúc mừng!</DialogTitleComponent>
                        <DialogDescriptionComponent>
                            Ứng viên <span className="font-semibold text-gray-900">{principalInvestigator}</span> đã được chọn làm
                            <span className="font-semibold text-primary"> Chủ nhiệm đề tài</span>.
                        </DialogDescriptionComponent>
                    </DialogHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <Button onClick={() => setShowCongrats(false)} className="bg-primary hover:bg-primary/90 w-full mt-4">
                        Đóng
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}
