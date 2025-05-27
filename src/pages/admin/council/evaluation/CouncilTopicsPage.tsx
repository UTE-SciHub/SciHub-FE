import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CalendarCheck, CalendarClock, CalendarX, FileText, Search, Users, Eye, Star, Award, Clock, TrendingUp, Edit3, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CouncilService } from "@/service/council-service"
import { TopicApplicationService } from "@/service/topic-application-service"
import { toast } from "@/hooks/use-toast"
import Loading from "@/components/loading/loading"
import { formatDate, formatDateString } from "@/utils/dateTimeFormat"
import { Council, getCouncilTypeText } from "@/models/council"
import useDebounce from "@/hooks/use-debounce"
import TopicApplicationsModal from "./TopicApplicationsModal"
import TopicEvaluationModal from "./TopicEvaluationModal"
import type { TopicApplication } from "@/models/topic-application"
import { EvaluationService } from "@/service/evaluation-service"
import TopicSummaryModal from "@/pages/admin/council/TopicSummaryModal"
import { cn } from "@/lib/utils"
import { TopicStatus } from "@/models/enums/topic-status.enum"
import { getTotalMaxScore, getTotalMinScore, getTotalScore } from "@/models/evaluation-detail"

// Define Topic interface based on used properties
interface Topic {
    id: string
    vietnameseName: string
    topicCode: string
    principalInvestigator?: string
    evaluationStatus: string
    applicationCount?: number
    evaluatedCount?: number
    evaluationData?: any
    field?: { name: string }
    status?: TopicStatus
}

export default function CouncilTopicsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const applicationsModalRef = useRef<any>(null)

    const [council, setCouncil] = useState<Council | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all")
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
    const [selectedApplication, setSelectedApplication] = useState<TopicApplication | null>(null)
    const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false)
    const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false)
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
    const [topicApplications, setTopicApplications] = useState<TopicApplication[]>([])
    const [evaluationDetail, setEvaluationDetail] = useState<any>(null)
    const minRequiredScore = getTotalMinScore()
    const maxPossibleScore = getTotalMaxScore()

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    // Fetch council data
    useEffect(() => {
        const fetchCouncilData = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await CouncilService.getById(Number(id))
                setCouncil(response.data.data)

                const topicsData = response.data.data.topicCouncils?.map((tc: any) => tc.topic) || [];

                setTopics(topicsData)
                setFilteredTopics(topicsData)
            } catch (error) {
                console.error("Error fetching council data:", error)
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải thông tin hội đồng. Vui lòng thử lại sau.",
                    variant: "error",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchCouncilData()
    }, [id])

    const fetchApplicationsForTopic = async (topicId: string) => {
        try {
            const response = await TopicApplicationService.getApplicationsByTopic(topicId)
            if (response.status === 200) {
                setTopicApplications(response.data.data || [])
            } else {
                throw new Error("Failed to fetch applications")
            }
        } catch (error) {
            console.error("Error fetching applications:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách ứng viên cho đề tài này.",
                variant: "error",
            })
            setTopicApplications([])
        }
    }

    useEffect(() => {
        if (!topics.length) {
            setFilteredTopics([])
            return
        }

        let filtered = [...topics]

        // Apply search filter
        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase()
            filtered = filtered.filter(
                (topic) =>
                    topic.vietnameseName?.toLowerCase().includes(query) ||
                    topic.topicCode?.toLowerCase().includes(query) ||
                    topic.principalInvestigator?.toLowerCase().includes(query),
            )
        }

        // Apply tab filter
        if (activeTab !== "all") {
            filtered = filtered.filter((topic) => {
                if (activeTab === "evaluated") {
                    return topic.evaluationStatus === "EVALUATED"
                } else if (activeTab === "pending") {
                    return topic.evaluationStatus !== "EVALUATED"
                }
                return true
            })
        }

        setFilteredTopics(filtered)
    }, [topics, debouncedSearchQuery, activeTab])

    const getCouncilStatus = (council: Council | null) => {
        if (!council) return ""

        const now = new Date()
        const startDate = new Date(council.startDate)
        const endDate = new Date(council.endDate)

        if (now < startDate) {
            return "Sắp diễn ra"
        } else if (now > endDate) {
            return "Đã kết thúc"
        } else {
            return "Đang hoạt động"
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Đang hoạt động":
                return {
                    icon: <CalendarCheck className="h-4 w-4" />,
                    badge: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-sm",
                    iconColor: "text-green-600"
                }
            case "Sắp diễn ra":
                return {
                    icon: <CalendarClock className="h-4 w-4" />,
                    badge: "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200 shadow-sm",
                    iconColor: "text-yellow-600"
                }
            case "Đã kết thúc":
                return {
                    icon: <CalendarX className="h-4 w-4" />,
                    badge: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-sm",
                    iconColor: "text-gray-600"
                }
            default:
                return {
                    icon: null,
                    badge: "bg-gray-50 text-gray-600 border-gray-200",
                    iconColor: "text-gray-600"
                }
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
    }

    const handleEvaluateTopic = async (topic: Topic) => {
        setSelectedTopic(topic);
        await fetchApplicationsForTopic(topic.id);
        setIsApplicationsModalOpen(true);
    }

    const handleSelectApplication = async (application: TopicApplication) => {
        setSelectedApplication(application)
        setEvaluationDetail(null)

        if (application.hasEvaluated) {
            try {
                const response = await EvaluationService.getEvaluationDetail(application.id)
                if (response.status === 200 && response.data.data) {
                    const totalScore = getTotalScore(response.data.data)
                    const evaluationData = {
                        ...response.data.data,
                        totalScore: totalScore,
                        passedAssessment: totalScore >= minRequiredScore,
                        councilDate: new Date().toISOString(),
                    }

                    setEvaluationDetail(evaluationData)
                }
            } catch (error) {
                console.error("Error fetching evaluation data:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải dữ liệu đánh giá chi tiết. Hiển thị dữ liệu cơ bản.",
                    variant: "error",
                })
            }
        }

        setIsEvaluationModalOpen(true)
    }

    const handleEvaluationComplete = async (evaluationData: any) => {
        if (!selectedApplication || !council) return
        const data = {
            ...evaluationData,
            councilId: council.id,
        }

        try {
            const response = await EvaluationService.submitEvaluate(selectedApplication.id, data)
            if (response.status !== 200) {
                throw new Error("Evaluation failed")
            }
            toast({
                title: "Đánh giá thành công",
                description: "Đã gửi kết quả đánh giá ứng viên thành công.",
            })
            setIsEvaluationModalOpen(false)
            // Refresh applications data for the topic
            if (selectedTopic) {
                await fetchApplicationsForTopic(selectedTopic.id)
            }
        } catch (error) {
            console.error("Error submitting evaluation:", error)
            toast({
                title: "Lỗi",
                description: "Đánh giá không thành công. Vui lòng thử lại.",
                variant: "error",
            })
        }
    }

    const handleSummarizeTopic = async (topic: Topic) => {
        setSelectedTopic(topic)
        await fetchApplicationsForTopic(topic.id)
        setIsSummaryModalOpen(true)
    }

    const handleViewProgress = (topicId: string) => {
        navigate(`/admin/councils/${id}/feedback/${topicId}`)
    }

    const handleClassifyTopic = (topicId: string) => {
        navigate(`/admin/topics/${topicId}/classification`)
    }

    const getTabStats = () => {
        const all = topics.length
        const evaluated = topics.filter(t => t.evaluationStatus === "EVALUATED").length
        const pending = all - evaluated
        return { all, evaluated, pending }
    }

    if (loading) {
        return <Loading />
    }

    if (!council) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">Không tìm thấy hội đồng</p>
                        <p className="text-muted-foreground mb-4">Hội đồng này có thể đã bị xóa hoặc không tồn tại.</p>
                        <Button onClick={() => navigate("/admin/councils")} variant="outline">
                            Quay lại danh sách
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const councilStatus = getCouncilStatus(council)
    const statusConfig = getStatusConfig(councilStatus)
    const stats = getTabStats()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 mr-3 hover:bg-blue-50 transition-colors"
                                onClick={() => navigate("/admin/councils")}
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Quay lại</span>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Quản lý đề tài
                                </h1>
                                <p className="text-muted-foreground mt-1">Đánh giá và theo dõi tiến độ đề tài trong hội đồng</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            // onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? "Đang làm mới..." : "Làm mới"}
                        </Button>
                    </div>
                </div>

                {/* Council Info Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50/50 animate-fade-in">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl text-gray-900">{council.name}</CardTitle>
                                <CardDescription className="text-base">
                                    Hội đồng đánh giá đề tài khoa học
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200">
                                {`Hội đồng ${getCouncilTypeText(council.type)}`}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Số quyết định</div>
                                <div className="text-sm font-medium">{council.decisionNumber}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Trạng thái</div>
                                <div className="flex items-center gap-3">
                                    <div className={cn("rounded-full bg-white shadow-sm", statusConfig.iconColor)}>
                                        {statusConfig.icon}
                                    </div>
                                    <Badge variant="outline" className={statusConfig.badge}>
                                        {councilStatus}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Thời gian hoạt động</div>
                                <div className="text-sm font-medium">
                                    {formatDateString(council.startDate)} - {formatDateString(council.endDate)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Thành viên</div>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-white shadow-sm">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium">{council.councilMembers?.length || 0} thành viên</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Tổng đề tài</p>
                                    <p className="text-3xl font-bold text-blue-900">{stats.all}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-200/50">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Đã đánh giá</p>
                                    <p className="text-3xl font-bold text-green-900">{stats.evaluated}</p>
                                </div>
                                <div className="p-3 rounded-full bg-green-200/50">
                                    <Award className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Chờ đánh giá</p>
                                    <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
                                </div>
                                <div className="p-3 rounded-full bg-orange-200/50">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Topics List */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl">Danh sách đề tài</CardTitle>
                                <CardDescription className="mt-1">
                                    Quản lý và đánh giá {filteredTopics.length} đề tài trong hội đồng
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                    {Math.round((stats.evaluated / stats.all) * 100) || 0}% hoàn thành
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Search and Filters */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm theo tên đề tài, mã đề tài hoặc chủ nhiệm..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="pl-10 h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                                    />
                                </div>
                                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full lg:w-auto">
                                    <TabsList className="grid w-full grid-cols-3 lg:w-auto bg-gray-100">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-white">
                                            Tất cả ({stats.all})
                                        </TabsTrigger>
                                        <TabsTrigger value="pending" className="data-[state=active]:bg-white">
                                            Chờ đánh giá ({stats.pending})
                                        </TabsTrigger>
                                        <TabsTrigger value="evaluated" className="data-[state=active]:bg-white">
                                            Đã đánh giá ({stats.evaluated})
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Topics Grid */}
                            {filteredTopics.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredTopics.map((topic, index) => (
                                        <Card
                                            key={topic.id}
                                            className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-gray-50/50 animate-fade-in"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start gap-3">
                                                    <CardTitle className="text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {topic.vietnameseName}
                                                    </CardTitle>
                                                    <Badge
                                                        variant={topic.evaluationStatus === "EVALUATED" ? "default" : "secondary"}
                                                        className={cn(
                                                            "shrink-0",
                                                            topic.evaluationStatus === "EVALUATED"
                                                                ? "bg-green-100 text-green-700 border-green-200"
                                                                : "bg-orange-100 text-orange-700 border-orange-200"
                                                        )}
                                                    >
                                                        {topic.evaluationStatus === "EVALUATED" ? "Đã đánh giá" : "Chờ đánh giá"}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="line-clamp-1">
                                                    Mã: <span className="font-medium text-blue-600">{topic.topicCode}</span>
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-blue-600" />
                                                            <span className="text-sm font-medium">Ứng viên</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-blue-600">
                                                            {topic.applicationCount || 0}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium text-gray-600">Lĩnh vực: </span>
                                                        <span className="text-gray-900">{topic.field?.name || "Chưa phân loại"}</span>
                                                    </div>
                                                    {topic.evaluationStatus === "EVALUATED" && topic.evaluationData && (
                                                        <div className="p-3 bg-green-50/50 rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-green-700">Tiến độ đánh giá</span>
                                                                <span className="text-sm font-bold text-green-600">
                                                                    {topic.evaluatedCount || 0}/{topic.applicationCount || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
                                                {topic.status === TopicStatus.IN_CATALOG ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleViewProgress(topic.id)}
                                                            variant="outline"
                                                            className="flex-1 gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Tiến độ
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleEvaluateTopic(topic)}
                                                            className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all"
                                                        >
                                                            <Star className="h-4 w-4" />
                                                            Đánh giá
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSummarizeTopic(topic)}
                                                            variant="outline"
                                                            className="flex-1 gap-2 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                                                        >
                                                            <Award className="h-4 w-4" />
                                                            Tổng kết
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleClassifyTopic(topic.id)}
                                                        className="w-full gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                        Xác định danh mục
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <Search className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Không tìm thấy đề tài</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Không có đề tài nào phù hợp với tiêu chí tìm kiếm. Vui lòng thử lại với từ khóa khác hoặc thay đổi bộ lọc.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchQuery("")
                                                setActiveTab("all")
                                            }}
                                            className="gap-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Xóa bộ lọc
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Modal */}
                <Dialog open={isApplicationsModalOpen} onOpenChange={setIsApplicationsModalOpen}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto p-0">
                        {selectedTopic && (
                            <TopicApplicationsModal
                                ref={applicationsModalRef}
                                topic={selectedTopic}
                                applications={topicApplications}
                                onSelectApplication={handleSelectApplication}
                                onClose={() => setIsApplicationsModalOpen(false)}
                                onRefresh={() => fetchApplicationsForTopic(selectedTopic.id)}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Evaluation Modal */}
                <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto p-0">
                        {selectedTopic && selectedApplication && (
                            <TopicEvaluationModal
                                topic={selectedTopic}
                                application={selectedApplication}
                                onComplete={handleEvaluationComplete}
                                onCancel={() => setIsEvaluationModalOpen(false)}
                                existingData={evaluationDetail ||
                                    (selectedApplication.totalScore !== null ? { totalScore: selectedApplication.totalScore } : undefined)
                                }
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Summary Modal */}
                <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto p-0">
                        {selectedTopic && council && (
                            <TopicSummaryModal
                                topic={selectedTopic}
                                applications={topicApplications}
                                onClose={() => setIsSummaryModalOpen(false)}
                                councilId={council.id}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}