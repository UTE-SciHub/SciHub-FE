import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle, Download, FileText, Info, ArrowLeft, ChevronLeft, Save, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { formatVND, getInitialsAvt } from "@/utils/common"
import { CouncilService } from "@/service/council-service"
import Loading from "@/components/loading/loading"
import CouncilDecisionDocument from "./CouncilDecisionDocument"
import { TopicService } from "@/service/topic-service"

export default function ApproveTopicsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const councilId = Number(id)

    const [topics, setTopics] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [decisionNumber, setDecisionNumber] = useState("")
    const [selectAll, setSelectAll] = useState(true)
    const [step, setStep] = useState<"review" | "preview" | "confirm" | "success">("review")
    const [totalBudget, setTotalBudget] = useState(0)

    useEffect(() => {
        const fetchApprovedTopics = async () => {
            setLoading(true)
            try {
                const response = await CouncilService.getApprovedTopicsByCouncil(councilId)
                const data = response.data.data.map((topic: any) => ({
                    ...topic,
                    selected: true,
                    expectedProducts: topic.expectedProducts ? JSON.parse(topic.expectedProducts) : [],
                }))
                setTopics(data)
                const total = data.reduce((sum, topic) => sum + (topic.approvedBudget || 0), 0)
                setTotalBudget(total)
            } catch (error) {
                console.error("Error fetching approved topics:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách đề tài đã được chọn chủ nhiệm",
                    variant: "error",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchApprovedTopics()
    }, [councilId])

    const handleBudgetChange = (id: number, value: string) => {
        const numericValue = value === "" ? 0 : Number.parseFloat(value.replace(/,/g, ""))
        setTopics((prevTopics) =>
            prevTopics.map((topic) => (topic.id === id ? { ...topic, approvedBudget: numericValue } : topic)),
        )
        const updatedTopics = topics.map((topic) => (topic.id === id ? { ...topic, approvedBudget: numericValue } : topic))
        const total = updatedTopics.reduce((sum, topic) => (topic.selected ? sum + topic.approvedBudget : sum), 0)
        setTotalBudget(total)
    }

    const handleNotesChange = (id: number, value: string) => {
        setTopics((prevTopics) => prevTopics.map((topic) => (topic.id === id ? { ...topic, notes: value } : topic)))
    }

    const handleTopicSelection = (id: number, checked: boolean) => {
        setTopics((prevTopics) => prevTopics.map((topic) => (topic.id === id ? { ...topic, selected: checked } : topic)))
        const updatedTopics = topics.map((topic) => (topic.id === id ? { ...topic, selected: checked } : topic))
        const total = updatedTopics.reduce((sum, topic) => (topic.selected ? sum + topic.approvedBudget : sum), 0)
        setTotalBudget(total)
        const allSelected = updatedTopics.every((topic) => topic.selected)
        setSelectAll(allSelected)
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked)
        const updatedTopics = topics.map((topic) => ({
            ...topic,
            selected: checked,
        }))
        setTopics(updatedTopics)
        const total = updatedTopics.reduce((sum, topic) => (topic.selected ? sum + topic.approvedBudget : sum), 0)
        setTotalBudget(total)
    }

    const handleReview = () => {
        if (!decisionNumber) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập số quyết định",
                variant: "error",
            })
            return
        }

        const selectedTopics = topics.filter((topic) => topic.selected)
        if (selectedTopics.length === 0) {
            toast({
                title: "Chưa chọn đề tài",
                description: "Vui lòng chọn ít nhất một đề tài để phê duyệt",
                variant: "error",
            })
            return
        }

        setStep("preview")
    }

    const handleApprove = async () => {
        setSubmitting(true)

        try {
            const selectedTopics = topics.filter((topic) => topic.selected)

            const approvalData = {
                councilId,
                decisionNumber,
                topics: selectedTopics.map((topic) => ({
                    topicId: topic.id,
                    approvedBudget: topic.approvedBudget,
                })),
            }

            const response = await TopicService.approveTopicsByCouncil(approvalData)
            if (response.status !== 200) {
                toast({
                    title: "Lỗi",
                    description: "Không thể phê duyệt đề tài. Vui lòng thử lại.",
                    variant: "error",
                })
                return
            }

            toast({
                title: "Thành công",
                description: `Đã phê duyệt ${selectedTopics.length} đề tài thành công.`,
                variant: "success",
            })

            setStep("success")
        } catch (error) {
            console.error("Error approving topics:", error)
            toast({
                title: "Lỗi",
                description: "Không thể phê duyệt đề tài. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleBackToCouncil = () => {
        navigate(`/admin/councils/${councilId}`)
    }

    if (loading) {
        return <Loading />
    }

    // Render review step
    if (step === "review") {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 mr-2"
                        onClick={handleBackToCouncil}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/")}>
                            Trang chủ
                        </span>
                        <span className="mx-2">/</span>
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/admin/councils")}>
                            Hội đồng
                        </span>
                        <span className="mx-2">/</span>
                        <span className="hover:text-gray-900 cursor-pointer" onClick={handleBackToCouncil}>
                            Chi tiết hội đồng
                        </span>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-gray-900">Phê duyệt đề tài</span>
                    </div>
                </div>

                <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4 pt-6 border-b">
                        <CardTitle className="text-xl">Phê duyệt đề tài</CardTitle>
                        <p className="text-gray-600">Phê duyệt danh sách đề tài đã được chọn chủ nhiệm trong hội đồng này</p>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="decisionNumber">
                                Số quyết định <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="decisionNumber"
                                placeholder="Nhập số quyết định"
                                value={decisionNumber}
                                onChange={(e) => setDecisionNumber(e.target.value)}
                                className="max-w-md"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Danh sách đề tài</h3>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="selectAll" checked={selectAll} onCheckedChange={handleSelectAll} />
                                    <Label htmlFor="selectAll" className="cursor-pointer">
                                        Chọn tất cả
                                    </Label>
                                </div>
                            </div>

                            {topics.length === 0 ? (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Không có đề tài</AlertTitle>
                                    <AlertDescription>Không có đề tài nào đã được chọn chủ nhiệm trong hội đồng này.</AlertDescription>
                                </Alert>
                            ) : (
                                <div className="border rounded-md overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]"></TableHead>
                                                <TableHead>Đề tài</TableHead>
                                                <TableHead>Chủ nhiệm</TableHead>
                                                <TableHead className="w-[200px]">Kinh phí (VNĐ)</TableHead>
                                                <TableHead className="w-[250px]">Ghi chú</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topics.map((topic) => (
                                                <TableRow key={topic.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={topic.selected}
                                                            onCheckedChange={(checked) => handleTopicSelection(topic.id, checked === true)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{topic.vietnameseName}</div>
                                                            <div className="text-xs text-muted-foreground">{topic.topicCode}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src="avatar-default.jpg" />
                                                                <AvatarFallback>{getInitialsAvt(topic.principalInvestigator)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{topic.principalInvestigator}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="text"
                                                            value={topic.approvedBudget?.toLocaleString()}
                                                            onChange={(e) => handleBudgetChange(topic.id, e.target.value)}
                                                            className="w-full"
                                                            disabled={!topic.selected}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            placeholder="Ghi chú"
                                                            value={topic.notes}
                                                            onChange={(e) => handleNotesChange(topic.id, e.target.value)}
                                                            className="w-full"
                                                            disabled={!topic.selected}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">Tổng kinh phí:</span>
                                    <span className="font-bold text-blue-800 text-lg">{formatVND(totalBudget)} VNĐ</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
                        <Button variant="outline" onClick={handleBackToCouncil}>
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Button>
                        <Button onClick={handleReview} disabled={topics.length === 0}>
                            <ArrowRight className="h-4 w-4" />
                            Tiếp tục
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    // Render preview step
    if (step === "preview") {
        const selectedTopics = topics.filter((topic) => topic.selected)

        return (
            <div className="space-y-6">
                {/* Breadcrumb & Navigation */}
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => setStep("review")}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/")}>
                            Trang chủ
                        </span>
                        <span className="mx-2">/</span>
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/admin/councils")}>
                            Hội đồng
                        </span>
                        <span className="mx-2">/</span>
                        <span className="hover:text-gray-900 cursor-pointer" onClick={handleBackToCouncil}>
                            Chi tiết hội đồng
                        </span>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-gray-900">Xem trước quyết định</span>
                    </div>
                </div>

                <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 pb-4 pt-6 border-b">
                        <CardTitle className="text-xl">Xem trước quyết định phê duyệt</CardTitle>
                        <p className="text-gray-600">Xem trước quyết định trước khi xác nhận phê duyệt</p>
                    </CardHeader>

                    <CardContent className="p-6">
                        <CouncilDecisionDocument
                            decisionNumber={decisionNumber}
                            decisionDate={new Date().toISOString().split("T")[0]}
                            topics={selectedTopics}
                            onClose={() => setStep("review")}
                        />
                    </CardContent>

                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
                        <Button variant="outline" onClick={() => setStep("review")}>
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Button>
                        <Button onClick={handleApprove} disabled={submitting}>
                            <Save className="h-4 w-4" />
                            {submitting ? "Đang xử lý..." : "Xác nhận"}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    // Render success step
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8 pb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Phê duyệt thành công!</h2>
                        <p className="text-gray-500 mb-6">
                            Đã phê duyệt thành công {topics.filter((t) => t.selected).length} đề tài với tổng kinh phí{" "}
                            {formatVND(totalBudget)} VNĐ. Quyết định phê duyệt đã được tạo với số {decisionNumber}.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button variant="outline" onClick={() => setStep("preview")}>
                                <Download className="h-4 w-4" />
                                Xem quyết định
                            </Button>
                            <Button onClick={handleBackToCouncil}>
                                <FileText className="h-4 w-4" />
                                Quay lại hội đồng
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
