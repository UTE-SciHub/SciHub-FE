import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Search, Plus, FileText, Users, Clock, CheckCircle, Eye, Upload, ChevronDown, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Topic } from "@/models/topic"
import { type Council, CouncilType, getCouncilStatus, getStatusVariant } from "@/models/council"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getBadge, getStatusColorHex, TopicStatus } from "@/models/enums/topic-status.enum"
import { CouncilService } from "@/service/council-service"
import { AcceptanceService } from "@/service/acceptance-service"

interface AcceptanceDashboardStats {
  totalTopics: number
  pendingAcceptance: number
  completed: number
}

export default function AcceptanceDashboard() {
  const [openTopicId, setOpenTopicId] = useState<number | null>(null)
  const navigate = useNavigate()
  const [stats, setStats] = useState<AcceptanceDashboardStats>({
    totalTopics: 0,
    pendingAcceptance: 0,
    completed: 0,
  })
  const [topics, setTopics] = useState<Topic[]>([])
  const [councils, setCouncils] = useState<Council[]>([])
  const [selectedCouncil, setSelectedCouncil] = useState<Council | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [acceptancesGrouped, setAcceptancesGrouped] = useState<
    Record<string, { topic: any; acceptanceFinal?: any; acceptances: any[] }>
  >({})

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (councils && councils.length > 0) {
      setSelectedCouncil(councils[0])
    }
  }, [councils])

  useEffect(() => {
    if (selectedCouncil) {
      fetchAcceptancesByCouncil(Number(selectedCouncil.id))
    }
  }, [selectedCouncil])

  const fetchCouncilData = async () => {
    setLoading(true)
    try {
      const councilResponse = await CouncilService.getAll({
        type: CouncilType.ACCEPTANCE_JURY,
        isAdmin: true,
      })

      return councilResponse.data.data
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu hội đồng. Vui lòng thử lại.",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCouncilSelect = (council: Council) => {
    setSelectedCouncil(council)
  }

  const fetchAcceptancesByCouncil = async (councilId: number) => {
    try {
      const response = await AcceptanceService.getAcceptances({
        councilId: councilId,
      })
      const data = response?.data?.data || []
      // Group by topicId
      const grouped: Record<string, { topic: any; acceptanceFinal?: any; acceptances: any[] }> = {}
      data.forEach((acc: any) => {
        const topicId = acc.topic.id
        if (!grouped[topicId]) {
          grouped[topicId] = { topic: acc.topic, acceptances: [] }
        }
        grouped[topicId].acceptances.push(acc)
      })
      // Lấy acceptanceFinal (isFinal=true đầu tiên)
      Object.values(grouped).forEach((group) => {
        group.acceptanceFinal = group.acceptances.find((a) => a.isFinal) || undefined
      })
      setAcceptancesGrouped(grouped)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nghiệm thu",
        variant: "error",
      })
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const councilsResponse = await fetchCouncilData()
      setCouncils(councilsResponse)

      // Extract topics from all councils
      const allTopics = councilsResponse.flatMap(council => 
        council.topicCouncils.map(tc => tc.topic)
      )
      setTopics(allTopics)

      // Calculate stats
      setStats({
        totalTopics: allTopics.length,
        pendingAcceptance: allTopics.filter((t) => t.status === TopicStatus.WAITING_FOR_ACCEPTANCE).length,
        completed: allTopics.filter((t) => t.status === TopicStatus.ACCEPTED || t.status === TopicStatus.ACCEPTED_WITH_CONDITIONS).length,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu. Vui lòng thử lại.",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTopics = topics.filter((topic) => {
    // const matchesSearch =
    //   searchQuery === "" ||
    //   topic.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //   topic.topicCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //   (topic.principalInvestigator && topic.principalInvestigator.toLowerCase().includes(searchQuery.toLowerCase()))

    // const matchesFilter = activeFilter === "all" || topic.status === activeFilter

    // const matchesCouncilType =
    //   selectedCouncilType === "all" || councils.some(c => c.type === selectedCouncilType && c.topicCouncils.some(tc => tc.topicId === topic.id))

    // return matchesSearch && matchesFilter && matchesCouncilType
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nghiệm thu đề tài</h1>
          <p className="text-gray-600 mt-2">Quản lý quy trình nghiệm thu các đề tài nghiên cứu khoa học</p>
        </div>
        <div className="flex gap-3">
          <Button variant="default" onClick={() => navigate("/admin/councils/create")}>
            <Plus className="h-4 w-4" />
            Tạo hội đồng nghiệm thu
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đề tài</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTopics}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ nghiệm thu</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingAcceptance}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã nghiệm thu</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="topics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="topics">Đề tài cần nghiệm thu</TabsTrigger>
          <TabsTrigger value="councils">Hội đồng nghiệm thu</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên đề tài, mã đề tài, chủ nhiệm..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Select box chọn hội đồng nghiệm thu */}
                <div className="w-56">
                  <Select
                    value={selectedCouncil ? String(selectedCouncil.id) : undefined}
                    onValueChange={(v) => setSelectedCouncil(councils.find((c) => c.id === v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hội đồng nghiệm thu" />
                    </SelectTrigger>
                    <SelectContent>
                      {councils
                        .filter((c) => c.type === CouncilType.ACCEPTANCE_JURY)
                        .map((council) => (
                          <SelectItem key={council.id} value={String(council.id)}>
                            {council.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="flex gap-2 items-center">
                  <Button
                    variant={activeFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter("all")}
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={activeFilter === TopicStatus.IN_PROGRESS ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(TopicStatus.IN_PROGRESS)}
                  >
                    Đang thực hiện
                  </Button>
                  <Button
                    variant={activeFilter === TopicStatus.COMPLETED ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(TopicStatus.COMPLETED)}
                  >
                    Hoàn thành
                  </Button>
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Topics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đề tài</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Mã đề tài</TableHead>
                    <TableHead>Tên đề tài</TableHead>
                    <TableHead>Chủ nhiệm</TableHead>
                    <TableHead>Trạng thái nghiệm thu</TableHead>
                    <TableHead>Lần nộp</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Tài liệu</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(acceptancesGrouped).map((group, index) => {
                    const { topic, acceptances } = group;
                    const latestAcceptance = acceptances[acceptances.length - 1];
                    const isExpanded = openTopicId === topic.id;

                    return (
                      <React.Fragment key={topic.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-blue-50 transition"
                          onClick={() => setOpenTopicId(isExpanded ? null : topic.id)}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              <span>{topic.topicCode}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`/topic/${topic.id}`}
                              className="font-medium text-blue-700 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {topic.vietnameseName}
                            </a>
                          </TableCell>
                          <TableCell>{topic.principalInvestigator}</TableCell>
                          <TableCell><Badge>{getBadge(topic.status)}</Badge></TableCell>
                          <TableCell>
                            <Badge variant="outline">{acceptances.length} lần</Badge>
                          </TableCell>
                          <TableCell>
                            {latestAcceptance?.submissionDate
                              ? new Date(latestAcceptance.submissionDate).toLocaleDateString('vi-VN')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{latestAcceptance?.documents?.length || 0} tài liệu</Badge>
                          </TableCell>
                          <TableCell>
                            {/* <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button variant="outline" size="sm" onClick={() => navigate(`/topics/${topic.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/acceptance/submit/${topic.id}`)}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div> */}
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={9} className="p-0 bg-gray-50">
                              <div className="p-4 space-y-3">
                                <div className="font-semibold text-gray-700 mb-3">
                                  Lịch sử nộp hồ sơ nghiệm thu ({acceptances.length} lần):
                                </div>
                                <div className="space-y-2">
                                  {acceptances
                                    .slice()
                                    .sort((a, b) => (b.isFinal ? 1 : 0) - (a.isFinal ? 1 : 0))
                                    .map((acc, index) => (
                                      <Card key={acc.id} className="border border-gray-200">
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">Lần #{acceptances.length - index}</span>
                                                {acc.isFinal && (
                                                  <Badge className="bg-green-100 text-green-800">
                                                    Nghiệm thu chính thức
                                                  </Badge>
                                                )}
                                              </div>
                                              <div className="text-sm text-gray-600">
                                                <p>
                                                  <strong>Ngày nộp:</strong>{' '}
                                                  {new Date(acc.submissionDate).toLocaleDateString('vi-VN')}
                                                </p>
                                                <p>
                                                  <strong>Số tài liệu:</strong> {acc.documents?.length || 0}
                                                </p>
                                                {acc.notes && (
                                                  <p>
                                                    <strong>Ghi chú:</strong> {acc.notes}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex gap-2">
                                              <Button variant="default" size="sm" onClick={() => navigate(`/admin/acceptance/${acc.id}`)}>
                                                <Eye className="h-4 w-4" />
                                                Chi tiết
                                              </Button>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {Object.keys(acceptancesGrouped).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">Không có đề tài nào trong hội đồng này</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="councils" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hội đồng nghiệm thu</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên hội đồng</TableHead>
                    <TableHead>Số quyết định</TableHead>
                    <TableHead>Thời gian hoạt động</TableHead>
                    <TableHead>Số đề tài</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {councils.map((council) => (
                    <TableRow key={council.id}>
                      <TableCell className="font-medium">{council.name}</TableCell>
                      <TableCell>{council.decisionNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {new Date(council.startDate).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(council.endDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{council.topicCouncils?.length || 0} đề tài</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(getCouncilStatus(council))}>{getCouncilStatus(council)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/councils/${council.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
