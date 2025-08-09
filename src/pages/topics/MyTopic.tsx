import { useEffect, useState, useMemo } from "react"
import { Eye, Pencil, Trash2, FilePlus, Send, X, Save, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { toast } from "@/hooks/use-toast"
import { TopicService } from "@/service/topic-service"
import type { Topic } from "@/models/topic"
import { getBadge, getStatusClass, TopicStatus } from "@/models/enums/topic-status.enum"
import { formatVND } from "@/utils/common"
import DataTable from "@/components/data-table/data-table"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RegistrationService } from "@/service/registration-service"
import type { RegistrationPeriod } from "@/models/registraion-period"
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status"
import Loading from "@/components/loading/loading"
import FeedbackList from "@/pages/admin/topics/feedback/FeedbackList"
import type { Milestone } from "@/models/milestone"

interface SubmitFormValues {
  period: string
}

const MyTopic = () => {
  const [myTopics, setMyTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [order, setOrder] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [periods, setPeriods] = useState<RegistrationPeriod[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)

  // New states for milestone and feedback functionality
  const [viewingReviews, setViewingReviews] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

  const navigate = useNavigate()

  const form = useForm<SubmitFormValues>({
    defaultValues: {
      period: "",
    },
  })

  const fetchMyTopics = async () => {
    setLoading(true)
    try {
      const response = await TopicService.getUserTopics()
      setMyTopics(response.data.data)
      setTotalItems(response.data.totalItems || response.data.data.length)
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

  // Function to view milestones and feedback for a topic
  const handleViewMilestones = (topic: Topic) => {
    navigate(`/my-topic/${topic.id}/milestones`)
  }

  // Function to view reviews for a milestone
  const handleViewReviews = (milestone: Milestone) => {
    setSelectedMilestone(milestone)
    setViewingReviews(true)
  }

  useEffect(() => {
    fetchMyTopics()
  }, [currentPage, itemsPerPage, sortBy, order])

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
      setOpenConfirmDelete(false)
      setSelectedTopicId(null)
    }
  }

  const handleOpenSubmitModal = (topicId: string) => {
    setSelectedTopicId(topicId)
    fetchOpenPeriods()
    setOpenModal(true)
  }

  const handleSubmitTopic = async (values: SubmitFormValues) => {
    if (!selectedTopicId) return

    setOpenConfirm(true)
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
      setOpenConfirm(false)
      setOpenModal(false)
      setSelectedTopicId(null)
      form.reset()
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "topicCode",
        title: "Mã đề tài",
        width: "150px",
        sortable: true,
        render: (value: string) => value || "N/A",
      },
      {
        key: "vietnameseName",
        title: "Tên tiếng Việt",
        width: "350px",
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

            {/* New button for viewing milestones and feedback */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleViewMilestones(record)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <BarChart2 className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xem tiến độ và đánh giá</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {(record.status === TopicStatus.DRAFT || record.status === TopicStatus.REVIEWED) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/topic/edit/${record.id}`)}
                      className="bg-[#f59e0b] text-white hover:bg-[#f4b122] transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chỉnh sửa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {record.status === TopicStatus.DRAFT && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setOpenConfirmDelete(true)
                          setSelectedTopicId(record.id)
                        }}
                        className="bg-[#ef4444] hover:bg-[#b91c1c] text-white transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Xoá</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-[#8b5cf6] hover:bg-[#6d28d9] text-white transition-all"
                        onClick={() => handleOpenSubmitModal(record.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Nộp đề tài</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        ),
      },
    ],
    [navigate],
  )

  if (loading || isSubmitting) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Danh sách đề tài</h1>
          <p className="text-[#6b7280]">Xem và quản lý các đề tài nghiên cứu khoa học của bạn</p>
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

      <DataTable
        columns={columns}
        data={myTopics}
        emptyMessage="Chưa có đề tài nào"
        rowKey="id"
        loading={loading}
        pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        pageSizeOptions={[5, 10, 15, 20]}
        selectable={false}
        selectedRowKeys={[]}
        onSelectionChange={() => { }}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setItemsPerPage(size)
          setCurrentPage(1)
        }}
        onSortChange={(field, order) => {
          setSortBy(field)
          setOrder(order)
          setCurrentPage(1)
        }}
      />

      {/* Modal for selecting registration period */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Chọn đợt đăng ký đề tài</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitTopic)} className="space-y-4">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Các đợt đăng ký đề tài đang mở</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Lựa chọn" />
                        </SelectTrigger>
                        <SelectContent className="w-full min-w-[600px]">
                          {periods.length === 0 ? (
                            <div className="px-4 py-2 text-muted-foreground text-sm">
                              Không có đợt đăng ký nào đang mở
                            </div>
                          ) : (
                            periods.map((period) => (
                              <SelectItem key={period.id} value={String(period.id)} className="truncate">
                                {period.title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" className="text-rose-500" onClick={() => setOpenModal(false)}>
                  <X className="h-4 w-4" /> Hủy
                </Button>
                <Button type="submit" disabled={!form.watch("period")}>
                  <Save className="h-4 w-4" /> Nộp
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận nộp đề tài</AlertDialogTitle>
            <AlertDialogDescription className="text-rose-500">
              Bạn có chắc chắn muốn nộp đề tài này? Sau khi nộp, bạn sẽ không thể chỉnh sửa đề tài nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-rose-500" onClick={() => setOpenConfirm(false)}>
              <X className="h-4 w-4" /> Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitTopic} disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? "Đang nộp..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete Dialog */}
      <AlertDialog open={openConfirmDelete} onOpenChange={setOpenConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đề tài</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đề tài này? Bạn sẽ không thể khôi phục lại đề tài này sau khi xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenConfirmDelete(false)}>
              <X className="h-4 w-4" /> Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 text-white hover:bg-rose-600"
              onClick={() => handleDelete(selectedTopicId)}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4" />
              {isSubmitting ? "Đang xóa..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default MyTopic
