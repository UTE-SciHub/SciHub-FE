import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Download, X } from "lucide-react"
import { formatDate } from "@/utils/dateTimeFormat"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import useUserStore from "@/store/userStore"
import { CRITERIA_DETAILS } from "@/models/evaluation-detail"

interface ReviewResultProps {
    topic: any
    reviewData: any
}

export default function ReviewResult({ topic, reviewData }: ReviewResultProps) {
    const [isExporting, setIsExporting] = useState(false)
    const pdfRef = useRef<HTMLDivElement>(null)
    const user = useUserStore((state) => state.user)

    const currentDate = new Date()

    // Calculate approval status
    const hasPassedMinimumScores = CRITERIA_DETAILS.every((criteria) => 
        (reviewData[criteria.id] || 0) >= criteria.minScore
    )
    // Use existing passed status if available, otherwise calculate
    const isApproved = reviewData.passedAssessment !== undefined 
        ? reviewData.passedAssessment 
        : (reviewData.totalScore >= 55 && hasPassedMinimumScores)

    const exportToPdf = async () => {
        if (!pdfRef.current) {
            return
        }

        setIsExporting(true)
        try {
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            // Add the captured canvas as an image
            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
            pdf.save(`Phiếu đánh giá - ${topic.topicCode}.pdf`)
        } catch (error) {
            console.error("Error exporting PDF:", error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="p-6 flex justify-between items-center border-b">
                <h2 className="text-lg font-medium">Kết quả đánh giá đề tài</h2>
                <Button onClick={exportToPdf} disabled={isExporting} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {isExporting ? "Đang xuất..." : "Xuất PDF"}
                </Button>
            </div>

            <div className="p-6 font-times">
                <Card className="shadow-lg">
                    <CardContent className="p-0">
                        <div ref={pdfRef} className="p-6 bg-white">
                            {/* Header */}
                            <div className="grid grid-cols-2 mb-8">
                                <div className="text-center">
                                    <p className="uppercase font-semibold">ĐẠI HỌC ĐÀ NẴNG</p>
                                    <p className="uppercase font-bold">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
                                </div>
                                <div className="text-center">
                                    <p className="uppercase font-semibold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                                    <p>Độc lập - Tự do - Hạnh phúc</p>
                                    <p className="text-xs">&#8727;</p>
                                    <p>Đà Nẵng, ngày {reviewData.councilDate ? formatDate(reviewData.councilDate) : "...."}</p>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="text-center mb-6">
                                <h1 className="text-base font-bold uppercase">PHIẾU ĐÁNH GIÁ THUYẾT MINH</h1>
                                <h2 className="text-base font-bold uppercase">ĐỀ TÀI KHOA HỌC & CÔNG NGHỆ CẤP TRƯỜNG</h2>
                            </div>

                            {/* Form Content */}
                            <div className="space-y-4 text-sm">
                                <p>1. Họ và tên thành viên hội đồng: {user.name}</p>
                                <p>2. Tên đề tài: {topic.vietnameseName}</p>
                                <p>3. Chủ nhiệm đề tài: {topic.principalInvestigator || "Chưa xác định"}</p>
                                <p>4. Quyết định thành lập hội đồng số: ....... / ....... ngày ...... tháng ...... năm ......</p>
                                <p>5. Cơ quan chủ trì: Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng</p>
                                <p>6. Ngày họp: {formatDate(currentDate)}</p>
                                <p>7. Địa điểm: .............................................</p>
                                <p>8. Đánh giá của thành viên hội đồng:</p>

                                {/* Scoring Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 p-2 text-center w-12">STT</th>
                                                <th className="border border-gray-300 p-2 text-left">Nội dung đánh giá</th>
                                                <th className="border border-gray-300 p-2 text-center w-28">Điểm tối thiểu</th>
                                                <th className="border border-gray-300 p-2 text-center w-28">Điểm tối đa</th>
                                                <th className="border border-gray-300 p-2 text-center w-28">Điểm đánh giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {CRITERIA_DETAILS.map((criteria, index) => (
                                                <tr key={criteria.id}>
                                                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                                    <td className="border border-gray-300 p-2">{criteria.name}</td>
                                                    <td className="border border-gray-300 p-2 text-center">{criteria.minScore}</td>
                                                    <td className="border border-gray-300 p-2 text-center">{criteria.maxScore}</td>
                                                    <td className="border border-gray-300 p-2 text-center">{reviewData[criteria.id] || 0}</td>
                                                </tr>
                                            ))}
                                            <tr className="font-bold">
                                                <td colSpan={2} className="border border-gray-300 p-2 text-right">
                                                    Cộng
                                                </td>
                                                <td className="border border-gray-300 p-2 text-center">55</td>
                                                <td className="border border-gray-300 p-2 text-center">100</td>
                                                <td className="border border-gray-300 p-2 text-center">{reviewData.totalScore || 0}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="text-sm">
                                    <p className="italic">
                                        Ghi chú: Phê duyệt: ≥ 55 điểm (trong đó, không có tiêu chí nào dưới điểm tối thiểu);
                                        <br />
                                        Không phê duyệt: &lt; 55 điểm
                                    </p>
                                </div>

                                {/* Additional Comments */}
                                <div>
                                    <p>9. Ý kiến khác:</p>
                                    <div className="border-b border-dotted border-gray-400 min-h-[60px] py-1">
                                        {reviewData.additionalComments}
                                    </div>
                                </div>

                                {/* Signature */}
                                <div className="mt-8">
                                    <div className="flex justify-end">
                                        <div className="text-center">
                                            <p>{`Ngày ${formatDate(currentDate)}`}</p>
                                            <p>(Ký, họ và tên)</p>
                                            <div className="h-16"></div>
                                            <p>{user.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Approval Status */}
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${isApproved ? "bg-green-100" : "bg-red-100"}`}>
                            {isApproved ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
                        </div>
                        <div>
                            <h3 className="font-medium">{isApproved ? "Đủ điều kiện phê duyệt" : "Không đủ điều kiện phê duyệt"}</h3>
                            <p className="text-sm text-muted-foreground">
                                {isApproved
                                    ? `Đề tài đạt ${reviewData.totalScore}/100 điểm, đủ điều kiện phê duyệt`
                                    : `Đề tài đạt ${reviewData.totalScore}/100 điểm, không đủ điều kiện phê duyệt`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
