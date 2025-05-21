"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CalendarCheck, CalendarClock, CalendarX, FileText, Search, Users, Eye } from "lucide-react"
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
import { formatDateString } from "@/utils/dateTimeFormat"
import { Council, getCouncilTypeBadgeClass, getCouncilTypeText } from "@/models/council"
import useDebounce from "@/hooks/use-debounce"
import TopicApplicationsModal from "./TopicApplicationsModal"
import TopicEvaluationModal from "./TopicEvaluationModal"
import type { TopicApplication } from "@/models/topic-application"
import { EvaluationService } from "@/service/evaluation-service"
import TopicSummaryModal from "@/pages/admin/council/TopicSummaryModal"

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

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    // Fetch council data
    useEffect(() => {
        const fetchCouncilData = async () => {
            if (!id) return

            setLoading(true)
            try {
                const response = await CouncilService.getById(Number(id))
                setCouncil(response.data.data)

                // Extract topics, filter out undefined/null, and validate required fields
                const topicsData = (response.data.data.topicCouncils
                    ?.map((tc: any) => tc.topic)
                    .filter((topic: any): topic is Topic =>
                        topic &&
                        typeof topic.id === 'string' &&
                        typeof topic.vietnameseName === 'string' &&
                        typeof topic.topicCode === 'string'
                    ) || [])

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

    // Filter topics based on search query and tab
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Đang hoạt động":
                return <CalendarCheck className="h-4 w-4 text-green-600" />
            case "Sắp diễn ra":
                return <CalendarClock className="h-4 w-4 text-yellow-600" />
            case "Đã kết thúc":
                return <CalendarX className="h-4 w-4 text-gray-600" />
            default:
                return null
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Đang hoạt động":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang hoạt động
                    </Badge>
                )
            case "Sắp diễn ra":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                        Sắp diễn ra
                    </Badge>
                )
            case "Đã kết thúc":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Đã kết thúc
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
    }

    const handleEvaluateTopic = (topic: Topic) => {
        setSelectedTopic(topic)
        setIsApplicationsModalOpen(true)
    }

    const handleSelectApplication = (application: TopicApplication) => {
        setSelectedApplication(application)
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
            // Reload applications using ref
            if (applicationsModalRef.current && applicationsModalRef.current.loadApplications) {
                await applicationsModalRef.current.loadApplications()
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

    if (loading) {
        return <Loading />
    }

    if (!council) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Không tìm thấy thông tin hội đồng</p>
            </div>
        )
    }

    const councilStatus = getCouncilStatus(council)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => navigate("/admin/councils")}>
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Quay lại</span>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Danh sách đề tài</h1>
                        <p className="text-muted-foreground">Đánh giá đề tài trong hội đồng</p>
                    </div>
                </div>
            </div>

            {/* Council Info Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">{council.name}</CardTitle>
                            <CardDescription>Số quyết định: {council.decisionNumber}</CardDescription>
                        </div>
                        <Badge variant="outline" className={getCouncilTypeBadgeClass(council.type)}>
                            {getCouncilTypeText(council.type)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Trạng thái</div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(councilStatus)}
                                {getStatusBadge(councilStatus)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Thời gian</div>
                            <div className="text-sm">
                                {formatDateString(council.startDate)} - {formatDateString(council.endDate)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Thành viên</div>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{council.councilMembers?.length || 0} thành viên</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Topics List */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Danh sách đề tài cần đánh giá</CardTitle>
                    <CardDescription>
                        {filteredTopics.length} đề tài trong hội đồng {council.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm theo tên đề tài, mã đề tài hoặc chủ nhiệm..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="pl-10"
                                />
                            </div>
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
                                <TabsList>
                                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                                    <TabsTrigger value="pending">Chưa đánh giá</TabsTrigger>
                                    <TabsTrigger value="evaluated">Đã đánh giá</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Topics Grid */}
                        {filteredTopics.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTopics.map((topic) => (
                                    <Card key={topic.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base line-clamp-2">{topic.vietnameseName}</CardTitle>
                                                <Badge variant={topic.evaluationStatus === "EVALUATED" ? "default" : "outline"}>
                                                    {topic.evaluationStatus === "EVALUATED" ? "Đã đánh giá" : "Chưa đánh giá"}
                                                </Badge>
                                            </div>
                                            <CardDescription className="line-clamp-1">Mã đề tài: {topic.topicCode}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="space-y-2">
                                                <div className="text-sm">
                                                    <span className="font-medium">Số ứng viên: </span>
                                                    <span className="font-bold">{topic.applicationCount || 0}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">Lĩnh vực: </span>
                                                    {topic.field?.name || "Chưa phân loại"}
                                                </div>
                                                {topic.evaluationStatus === "EVALUATED" && topic.evaluationData && (
                                                    <div className="text-sm">
                                                        <span className="font-medium">Đã đánh giá: </span>
                                                        <span className="font-bold">{topic.evaluatedCount || 0}/{topic.applicationCount || 0}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <div className="px-6 py-3 bg-muted/20 border-t flex justify-between items-center">
                                            <div className="flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="text-sm">Xem chi tiết</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleViewProgress(topic.id)}
                                                    variant="outline"
                                                    className="gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Xem tiến độ
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEvaluateTopic(topic)}
                                                    variant="default"
                                                    className="gap-1"
                                                >
                                                    Đánh giá ứng viên
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSummarizeTopic(topic)}
                                                    variant="outline"
                                                    className="gap-1"
                                                >
                                                    Tổng kết
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Không tìm thấy đề tài</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Không có đề tài nào phù hợp với tiêu chí tìm kiếm. Vui lòng thử lại với từ khóa khác.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Applications Modal */}
            <Dialog open={isApplicationsModalOpen} onOpenChange={setIsApplicationsModalOpen}>
                <DialogContent className="max-w-4xl overflow-auto p-0">
                    {selectedTopic && (
                        <TopicApplicationsModal
                            ref={applicationsModalRef}
                            topic={selectedTopic}
                            onSelectApplication={handleSelectApplication}
                            onClose={() => setIsApplicationsModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Evaluation Modal */}
            <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
                <DialogContent className="max-w-4xl overflow-auto p-0">
                    {selectedTopic && selectedApplication && (
                        <TopicEvaluationModal
                            topic={selectedTopic}
                            application={selectedApplication}
                            onComplete={handleEvaluationComplete}
                            onCancel={() => setIsEvaluationModalOpen(false)}
                            existingData={
                                selectedApplication.totalScore !== null ? { totalScore: selectedApplication.totalScore } : undefined
                            }
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Summary Modal */}
            <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
                <DialogContent className="max-w-4xl overflow-auto p-0">
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
    )
}