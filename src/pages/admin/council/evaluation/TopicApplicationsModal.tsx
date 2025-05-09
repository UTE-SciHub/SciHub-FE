import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, User, FileText, Check, X, Clock } from "lucide-react"
import { type TopicApplication, ApplicationStatus } from "@/models/topic-application"
import { toast } from "@/hooks/use-toast"
import Loading from "@/components/loading/loading"
import useDebounce from "@/hooks/use-debounce"
import { TopicApplicationService } from "@/service/topic-application-service"

interface TopicApplicationsModalProps {
    topic: any
    onSelectApplication: (application: TopicApplication) => void
    onClose: () => void
}

const TopicApplicationsModal = forwardRef(({ topic, onSelectApplication, onClose }: TopicApplicationsModalProps, ref) => {
    const [applications, setApplications] = useState<TopicApplication[]>([])
    const [filteredApplications, setFilteredApplications] = useState<TopicApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    const loadApplications = async () => {
        setLoading(true)
        try {
            const response = await TopicApplicationService.getApplicationsByTopic(topic.id)

            if (response.status !== 200) {
                throw new Error("Failed to fetch applications")
            }

            const fetchedApplications = Array.isArray(response.data.data) ? response.data.data : []

            setApplications(fetchedApplications)
            setFilteredApplications(fetchedApplications)
        } catch (error) {
            console.error("Error fetching applications:", error)
            toast({
                title: "Lỗi khi tải dữ liệu",
                description: "Không thể tải danh sách ứng viên. Vui lòng thử lại sau.",
                variant: "error",
            })
            setApplications([])
            setFilteredApplications([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadApplications()
    }, [topic.id])

    useEffect(() => {
        if (!applications.length) {
            setFilteredApplications([])
            return
        }

        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase()
            const filtered = applications.filter(
                (app) =>
                    app.user.name.toLowerCase().includes(query) ||
                    app.user.email.toLowerCase().includes(query) ||
                    false,
            )
            setFilteredApplications(filtered)
        } else {
            setFilteredApplications(applications)
        }
    }, [applications, debouncedSearchQuery])

    // Expose loadApplications via ref
    useImperativeHandle(ref, () => ({
        loadApplications,
    }))

    const getStatusBadge = (status: ApplicationStatus) => {
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

    const getStatusIcon = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.APPROVED:
                return <Check className="h-4 w-4 text-green-600" />
            case ApplicationStatus.REJECTED:
                return <X className="h-4 w-4 text-red-600" />
            case ApplicationStatus.IN_PROGRESS:
                return <Clock className="h-4 w-4 text-blue-600" />
            case ApplicationStatus.PENDING:
            default:
                return <Clock className="h-4 w-4 text-yellow-600" />
        }
    }

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <DialogTitle>Danh sách ứng viên đăng ký</DialogTitle>
                <DialogDescription>
                    {topic.vietnameseName} - {topic.topicCode}
                </DialogDescription>
            </DialogHeader>

            <div className="p-6 flex-1 overflow-auto">
                {loading ? (
                    <Loading />
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm theo tên, email hoặc đơn vị..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">{filteredApplications.length} ứng viên</div>
                        </div>

                        {filteredApplications.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Ứng viên</TableHead>
                                            <TableHead className="w-[120px]">Trạng thái</TableHead>
                                            <TableHead className="w-[120px] text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApplications.map((application, index) => (
                                            <TableRow key={application.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{application.user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{application.user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(application.status)}
                                                        {getStatusBadge(application.status)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8"
                                                        onClick={() => onSelectApplication(application)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        {application.hasEvaluated ? "Xem đánh giá" : "Đánh giá"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium mb-2">Không tìm thấy ứng viên</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Không có ứng viên nào phù hợp với tiêu chí tìm kiếm. Vui lòng thử lại với từ khóa khác.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
                <Button variant="outline" onClick={onClose}>
                    Đóng
                </Button>
            </div>
        </div>
    )
})
export default TopicApplicationsModal