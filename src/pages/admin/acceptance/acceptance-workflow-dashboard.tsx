import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Search, Plus, FileText, Users, Clock, CheckCircle, Eye, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Topic } from "@/models/topic"
import { type Council, CouncilType, getCouncilStatus, getStatusVariant } from "@/models/council"
import { TopicStatus } from "@/models/enums/topic-status.enum"

interface AcceptanceDashboardStats {
  totalTopics: number
  pendingAcceptance: number
  inProgress: number
  completed: number
}

export default function AcceptanceDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AcceptanceDashboardStats>({
    totalTopics: 0,
    pendingAcceptance: 0,
    inProgress: 0,
    completed: 0,
  })
  const [topics, setTopics] = useState<Topic[]>([])
  const [councils, setCouncils] = useState<Council[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch topics eligible for acceptance (IN_PROGRESS status)
      // const topicsResponse = await TopicService.getAll({ status: TopicStatus.IN_PROGRESS })

      // Fetch acceptance councils
      // const councilsResponse = await CouncilService.getAll({ type: CouncilType.ACCEPTANCE_JURY })

      // Mock data for demonstration
      const mockTopics: Topic[] = [
        {
          id: "1",
          vietnameseName: "Nghiên cứu ứng dụng AI trong giáo dục",
          topicCode: "NCKH-2024-001",
          principalInvestigator: "TS. Nguyễn Văn A",
          status: TopicStatus.IN_PROGRESS,
          startDate: "2024-01-01",
          durationInMonths: 12,
          endYear: 2024,
          totalBudget: 100000000,
          expectedProducts: {
            scientific: { domestic: 2, international: 1 },
            training: { masters: 1, students: 2 },
            commercial: { details: "Phần mềm giáo dục" },
          },
          urgency: "Cao",
          keywords: ["AI", "Giáo dục"],
          transferForm: ["Báo cáo"],
          registrationPeriod: {} as any,
          budgetBreakdown: [],
          documents: [],
        },
      ]

      const mockCouncils: Council[] = [
        {
          id: "1",
          name: "Hội đồng nghiệm thu CNTT 2024",
          decisionNumber: "123/QĐ-ĐHBK",
          establishmentDate: "2024-01-15",
          startDate: "2024-02-01",
          endDate: "2024-12-31",
          type: CouncilType.ACCEPTANCE_JURY,
          councilMembers: [],
          topicCouncils: [],
        },
      ]

      setTopics(mockTopics)
      setCouncils(mockCouncils)

      // Calculate stats
      setStats({
        totalTopics: mockTopics.length,
        pendingAcceptance: mockTopics.filter((t) => t.status === TopicStatus.IN_PROGRESS).length,
        inProgress: 0,
        completed: 0,
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

  const getTopicStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case TopicStatus.IN_PROGRESS:
        return <Badge className="bg-blue-100 text-blue-800">Đang thực hiện</Badge>
      case TopicStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case TopicStatus.REVIEWED:
        return <Badge className="bg-purple-100 text-purple-800">Đã duyệt</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      searchQuery === "" ||
      topic.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.topicCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.principalInvestigator && topic.principalInvestigator.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter = activeFilter === "all" || topic.status === activeFilter

    return matchesSearch && matchesFilter
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm font-medium text-gray-600">Đang nghiệm thu</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
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
                <div className="flex gap-2">
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Topics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đề tài</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đề tài</TableHead>
                    <TableHead>Tên đề tài</TableHead>
                    <TableHead>Chủ nhiệm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Tài liệu</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTopics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.topicCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{topic.vietnameseName}</p>
                          <p className="text-sm text-gray-500">{topic.englishName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{topic.principalInvestigator}</TableCell>
                      <TableCell>{getTopicStatusBadge(topic.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Bắt đầu: {new Date(topic.startDate).toLocaleDateString("vi-VN")}</p>
                          <p>Thời gian: {topic.durationInMonths} tháng</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{topic.documents?.length || 0} tài liệu</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                        <Button variant="outline" size="sm" onClick={() => navigate(`/councils/${council.id}`)}>
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
