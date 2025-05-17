"use client"

import { useEffect, useState, useMemo } from "react"
import { Eye, FilePlus, Lock, Unlock, MoreHorizontal, BarChart3 } from "lucide-react"
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

interface SubmitFormValues {
    period: string
}

const LecturerTopicsPage = () => {
    const [myTopics, setMyTopics] = useState<Topic[]>([])
    const [researchFields, setResearchFields] = useState<ResearchField[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPageTopics, setCurrentPageTopics] = useState(1)
    const [itemsPerPageTopics, setItemsPerPageTopics] = useState(10)
    const [totalItemsTopics, setTotalItemsTopics] = useState(0)
    const [currentPageFields, setCurrentPageFields] = useState(1)
    const [itemsPerPageFields, setItemsPerPageFields] = useState(5)
    const [totalItemsFields, setTotalItemsFields] = useState(0)
    const [sortByTopics, setSortByTopics] = useState<string | null>(null)
    const [orderTopics, setOrderTopics] = useState<string | null>(null)
    const [sortByFields, setSortByFields] = useState<string | null>("createdAt")
    const [orderFields, setOrderFields] = useState<string | null>("desc")
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
    const [periods, setPeriods] = useState<RegistrationPeriod[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedResearchField, setSelectedResearchField] = useState<ResearchField | null>(null)
    const [searchQueryFields, setSearchQueryFields] = useState("")
    const [delFlagFields, setDelFlagFields] = useState<string>("all")

    const navigate = useNavigate()

    const form = useForm<SubmitFormValues>({
        defaultValues: {
            period: "",
        },
    })

    const debouncedSearchQueryFields = useDebounce(searchQueryFields, 300)

    // Fetch my topics
    const fetchMyTopics = async () => {
        setLoading(true)
        try {
            const response = await TopicService.getUserTopics()
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

    // Fetch research fields
    const fetchResearchFields = async () => {
        setLoading(true)
        try {
            const requestParams = {
                p: currentPageFields,
                s: itemsPerPageFields,
                q: debouncedSearchQueryFields,
                sort: sortByFields,
                order: orderFields,
                delFlag: delFlagFields === "all" ? undefined : delFlagFields === "true",
            }
            const response = await ResearchFieldService.getAll(requestParams)
            setResearchFields(response.data.data)
            setTotalItemsFields(response.data.totalItems)
        } catch (error) {
            console.error("Error fetching research fields:", error)
            toast({
                title: "Có lỗi trong quá trình lấy dữ liệu!",
                variant: "error",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMyTopics()
    }, [currentPageTopics, itemsPerPageTopics, sortByTopics, orderTopics])

    useEffect(() => {
        fetchResearchFields()
    }, [currentPageFields, itemsPerPageFields, debouncedSearchQueryFields, sortByFields, orderFields, delFlagFields])

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

    const handleViewResearchField = (researchField: ResearchField) => {
        setSelectedResearchField(researchField)
    }

    const handleStatusChange = async (researchField: ResearchField, newStatus: boolean) => {
        setLoading(true)
        try {
            const response = await ResearchFieldService.updateStatus(researchField.id!, newStatus)
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: `Đã ${newStatus ? "mở khóa" : "khóa"} lĩnh vực ${researchField.name} thành công!`,
                    variant: "success",
                })
                fetchResearchFields()
            } else {
                toast({
                    title: `Có lỗi trong quá trình ${newStatus ? "mở khóa" : "khóa"} lĩnh vực ${researchField.name}!`,
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Error updating status:", error)
            toast({
                title: `Có lỗi trong quá trình ${newStatus ? "mở khóa" : "khóa"} lĩnh vực ${researchField.name}!`,
                variant: "error",
            })
        } finally {
            setLoading(false)
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
                key: "englishName",
                title: "Tên tiếng Anh",
                sortable: true,
                render: (value: string) => value || "N/A",
            },
            {
                key: "durationInMonths",
                title: "TG thực hiện (tháng)",
                sortable: true,
                render: (value: number) => value || "N/A",
            },
            {
                key: "totalBudget",
                title: "Tổng chi phí dự kiến (đ)",
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="default" size="sm" onClick={() => navigate(`/topic/${record.id}`)}>
                                        <Eye className="h-4 w-4 text-white" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Xem chi tiết</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/lecturer/topic-progress/${record.id}`)}>
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Tiến độ thực hiện</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                ),
            },
        ],
        [navigate],
    )

    const columnsFields = useMemo(
        () => [
            { key: "name", title: "Tên lĩnh vực", width: "100px", sortable: true },
            { key: "description", title: "Mô tả", width: "150px" },
            { key: "delFlag", title: "Trạng thái", width: "80px", render: (_, record) => getStatusBadge(record.delFlag) },
            { key: "createdAt", title: "Ngày tạo", width: "150px", sortable: true },
            {
                key: "actions",
                title: "Thao tác",
                width: "80px",
                render: (_, record) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault()
                                    handleViewResearchField(record)
                                }}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            {record.delFlag ? (
                                <DropdownMenuItem
                                    className="text-green-500"
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        handleStatusChange(record, false)
                                    }}
                                >
                                    <Unlock className="mr-2 h-4 w-4" />
                                    Mở khóa
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        handleStatusChange(record, true)
                                    }}
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Khóa
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    )

    const getStatusBadge = (status: boolean | string) => {
        const isLocked = status === true
        const badgeConfig = {
            text: isLocked ? "Khóa" : "Mở khóa",
            bgColor: isLocked ? "bg-rose-100" : "bg-green-100",
            textColor: isLocked ? "text-rose-700" : "text-green-700",
            icon: isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />,
        }

        return (
            <div className="flex">
                <span
                    className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${badgeConfig.bgColor} ${badgeConfig.textColor}
            transition-colors duration-200 hover:${badgeConfig.bgColor.replace("100", "200")}
          `}
                >
                    {badgeConfig.icon}
                    {badgeConfig.text}
                </span>
            </div>
        )
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                <div>
                    <h1 className="font-bold text-2xl tracking-tight">Danh sách đề tài & lĩnh vực nghiên cứu</h1>
                    <p className="text-[#6b7280]">Xem, quản lý đề tài và lĩnh vực nghiên cứu của bạn</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        className="bg-[#2563eb] hover:bg-[#1e40af] transition-all"
                        onClick={() => navigate("/topic-proposal")}
                    >
                        <FilePlus className="h-4 w-4" />
                        Tạo đề tài
                    </Button>
                </div>
            </div>

            {/* Topics Section */}
            <Card>
                <CardContent className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Danh sách đề tài của tôi</h2>
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
