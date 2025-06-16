"use client"

import { useEffect, useState, useMemo } from "react"
import { Eye, FilePlus, Lock, Unlock, MoreHorizontal, BarChart3, Users, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { toast } from "@/hooks/use-toast"
import { TopicService } from "@/service/topic-service"
import type { Topic } from "@/models/topic"
import { getBadge, getStatusClass, type TopicStatus } from "@/models/enums/topic-status.enum"
import { formatVND } from "@/utils/common"
import DataTable from "@/components/data-table/data-table"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { useForm } from "react-hook-form"
import { RegistrationService } from "@/service/registration-service"
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status"
import Loading from "@/components/loading/loading"
import type { ResearchField } from "@/models/research-field"
import { ResearchFieldService } from "@/service/research-field-service"
import useDebounce from "@/hooks/use-debounce"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { RegistrationPeriod } from "@/models/registraion-period"
import useUserStore from "@/store/userStore"

interface SubmitFormValues {
    period: string
}

const LecturerTopicsPage = () => {
    const [myTopics, setMyTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPageTopics, setCurrentPageTopics] = useState(1)
    const [itemsPerPageTopics, setItemsPerPageTopics] = useState(10)
    const [totalItemsTopics, setTotalItemsTopics] = useState(0)
    const [sortByTopics, setSortByTopics] = useState<string | null>(null)
    const [orderTopics, setOrderTopics] = useState<string | null>(null)
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
    const [periods, setPeriods] = useState<RegistrationPeriod[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()
    const user = useUserStore((state) => state.user)

    const form = useForm<SubmitFormValues>({
        defaultValues: {
            period: "",
        },
    })

    // Fetch my topics
    const fetchMyTopics = async () => {
        setLoading(true)
        try {
            const response = await TopicService.getTopicsByPrincipalInvestigator(user.id)
            setMyTopics(response.data.data)
            setTotalItemsTopics(response.data.totalItems || response.data.data.length)
        } catch (error) {
            console.error("Error fetching topics:", error)
            toast({
                title: "Có lỗi xảy ra!",
                description: "Không thể tải danh sách đề tài. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setLoading(false)
        }
    }

    // Fetch open registration periods
    const fetchOpenPeriods = async () => {
        try {
            const response = await RegistrationService.getAll({
                p: 1,
                s: 1000,
                sort: "startDate",
                order: "desc",
                status: RegistrationPeriodStatus.OPEN,
                year: new Date().getFullYear(),
            })
            setPeriods(response.data.data)
        } catch (error) {
            console.error("Error fetching registration periods:", error)
            toast({
                title: "Có lỗi xảy ra!",
                description: "Không thể tải danh sách đợt đăng ký. Vui lòng thử lại sau.",
                variant: "error",
            })
        }
    }

    useEffect(() => {
        fetchMyTopics()
    }, [currentPageTopics, itemsPerPageTopics, sortByTopics, orderTopics])

    const handleDelete = async (topicId: string) => {
        if (!topicId) return

        setLoading(true)
        try {
            const response = await TopicService.deleteTopicById(topicId)
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Xóa đề tài thành công!",
                    description: "Đề tài đã được xóa thành công.",
                    variant: "success",
                })
                fetchMyTopics()
            } else {
                toast({
                    title: "Có lỗi xảy ra!",
                    description: "Không thể xóa đề tài. Vui lòng thử lại sau.",
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Error deleting topic:", error)
            toast({
                title: "Có lỗi xảy ra!",
                description: "Không thể xóa đề tài. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setLoading(false)
            setSelectedTopicId(null)
        }
    }

    const handleOpenSubmitModal = (topicId: string) => {
        setSelectedTopicId(topicId)
        fetchOpenPeriods()
    }

    const handleSubmitTopic = async (values: SubmitFormValues) => {
        if (!selectedTopicId) return
    }

    const confirmSubmitTopic = async () => {
        if (!selectedTopicId) return

        setIsSubmitting(true)
        try {
            const periodId = form.getValues("period")
            const response = await TopicService.submitTopic(selectedTopicId, periodId)
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Nộp đề tài thành công!",
                    description: "Đề tài đã được nộp thành công.",
                    variant: "success",
                })
            } else {
                toast({
                    title: "Có lỗi xảy ra!",
                    description: "Không thể nộp đề tài. Vui lòng thử lại sau.",
                    variant: "error",
                })
            }
            fetchMyTopics()
        } catch (error) {
            console.error("Error submitting topic:", error)
            toast({
                title: "Có lỗi xảy ra!",
                description: "Không thể nộp đề tài. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
            setSelectedTopicId(null)
            form.reset()
        }
    }

    const columnsTopics = useMemo(
        () => [
            {
                key: "vietnameseName",
                title: "Tên tiếng Việt",
                sortable: true,
                render: (value: string) => value || "N/A",
            },
            {
                key: "category.name",
                title: "Loại đề tài",
                render: (value: string) => value || "N/A",
            },
            {
                key: "field.name",
                title: "Lĩnh vực",
                render: (value: string) => value || "N/A",
            },
            {
                key: "department.name",
                title: "Đơn vị",
                render: (value: string) => value || "N/A",
            },
            {
                key: "startDate",
                title: "TG thực hiện",
                render: (_: any, record: Topic) => {
                    const start = record.startDate
                        ? new Date(record.startDate).toLocaleDateString("vi-VN")
                        : "N/A";
                    const duration = record.durationInMonths
                        ? `${record.durationInMonths} tháng`
                        : "N/A";
                    return `${start} - ${duration}`;
                },
            },
            {
                key: "totalBudget",
                title: "Chi phí dự kiến (đ)",
                sortable: true,
                render: (value: number) => (value ? formatVND(value) : "N/A"),
            },
            {
                key: "status",
                title: "Trạng thái",
                render: (value: TopicStatus, record: Topic) => (
                    <Badge className={getStatusClass(record.status)}>{getBadge(record.status)}</Badge>
                ),
            },
            {
                key: "actions",
                title: "Thao tác",
                render: (_: any, record: Topic) => (
                    <div className="flex gap-2">
                        <TooltipProvider>
                            <div className="flex items-center gap-2">
                                {/* Nút xem chi tiết */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => navigate(`/topic/${record.id}`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Xem chi tiết</TooltipContent>
                                </Tooltip>

                                {/* Nút tiến độ thực hiện */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/admin/lecturer/topic-progress/${record.id}`)}
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Tiến độ thực hiện</TooltipContent>
                                </Tooltip>

                                {/* Nút thành viên */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => navigate(`/admin/topics/${record.id}/members`)}
                                        >
                                            <Users className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Thành viên</TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                    </div>
                ),
            },
        ],
        [navigate],
    )

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                <div>
                    <h1 className="font-bold text-2xl tracking-tight">Danh sách đề tài chủ nhiệm của tôi</h1>
                    <p className="text-[#6b7280]">Xem, quản lý đề tài chủ nhiệm của bạn</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/topic-proposal")}
                    >
                        <FilePlus className="h-4 w-4" />
                        Tạo đề tài
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => navigate("/admin/acceptance/submit")}
                    >
                        <Save className="h-4 w-4" />
                        Nộp hồ sơ nghiệm thu
                    </Button>
                </div>
            </div>

            {/* Topics Section */}
            <Card>
                <CardContent className="p-4">
                    <DataTable
                        columns={columnsTopics}
                        data={myTopics}
                        emptyMessage="Chưa có đề tài nào"
                        rowKey="id"
                        loading={loading}
                        pagination
                        currentPage={currentPageTopics}
                        totalItems={totalItemsTopics}
                        itemsPerPage={itemsPerPageTopics}
                        pageSizeOptions={[5, 10, 15, 20]}
                        selectable={false}
                        selectedRowKeys={[]}
                        onSelectionChange={() => { }}
                        onPageChange={(page) => setCurrentPageTopics(page)}
                        onPageSizeChange={(size) => {
                            setItemsPerPageTopics(size)
                            setCurrentPageTopics(1)
                        }}
                        onSortChange={(field, order) => {
                            setSortByTopics(field)
                            setOrderTopics(order)
                            setCurrentPageTopics(1)
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default LecturerTopicsPage
