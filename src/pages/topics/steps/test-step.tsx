import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDate } from "@/utils/dateTimeFormat";
import { formatVND } from "@/utils/common";
import { renderContent } from "@/utils/util";

const getFieldLabel = (value: string) => {
    const options: Record<string, string> = {
        IT: "Công nghệ Thông tin",
        TELECOM: "Viễn thông",
        NATURAL: "Khoa học Tự nhiên",
        SOCIAL: "Khoa học Xã hội",
    };
    return options[value] || value;
};

const getResearchTypeLabel = (value: string) => {
    const options: Record<string, string> = {
        BASIC: "Nghiên cứu cơ bản",
        APPLIED: "Nghiên cứu ứng dụng",
        TECH_DEV: "Phát triển công nghệ",
        MAINTENANCE: "Bảo trì và sửa chữa",
    };
    return options[value] || value;
};

const getDepartmentLabel = (value: string) => {
    const options: Record<string, string> = {
        IT: "Khoa Công nghệ Thông tin",
        EE: "Khoa Điện và Điện tử",
        ME: "Khoa Cơ khí",
        CE: "Khoa Xây dựng",
    };
    return options[value] || value;
};

const getCouncilLabel = (value: string) => {
    const options: Record<string, string> = {
        IT_COUNCIL: "Hội đồng Công nghệ Thông tin",
        EE_COUNCIL: "Hội đồng Điện và Điện tử",
        ME_COUNCIL: "Hội đồng Cơ khí",
    };
    return options[value] || value;
};

const getRegistrationPeriodLabel = (value: string) => {
    const options: Record<string, string> = {
        "2025_1": "Đợt đăng ký 1 - 2025",
        "2025_2": "Đợt đăng ký 2 - 2025",
        "2026_1": "Đợt đăng ký 1 - 2026",
    };
    return options[value] || value;
};

const getFundingSourceLabel = (value: string) => {
    const options: Record<string, string> = {
        GOVERNMENT: "Nhà nước",
        ENTERPRISE: "Doanh nghiệp",
        SELF_FUNDED: "Tự túc",
        OTHER: "Khác",
    };
    return options[value] || value;
};

const getTransferFormLabel = (value: string) => {
    const options: Record<string, string> = {
        PATENT: "Bằng sáng chế",
        PUBLICATION: "Bài báo khoa học",
        PRODUCT: "Sản phẩm thương mại",
        OTHER: "Khác",
    };
    return options[value] || value;
};

interface PdfReviewProps {
    formValues: any;
}

export default function TestStep({ formValues }: PdfReviewProps) {
    const [isExporting, setIsExporting] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    const exportToPdf = async () => {
        if (!pdfRef.current) {
            console.error("PDF reference element not found.");
            return;
        }

        setIsExporting(true);

        try {
            window.scrollTo(0, 0);

            // Capture the content with html2canvas
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Handle cross-origin images (e.g., logo)
                logging: true, // Enable logging for debugging
                scrollX: 0,
                scrollY: 0,
                windowWidth: 210 * 3.78, // Approximate pixel width of 210mm (A4 width) at 96 DPI
                windowHeight: pdfRef.current.scrollHeight, // Ensure the entire height is captured
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save(`Đơn đăng ký đề tài - ${formValues.topicCode || "Mẫu"}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.");
        } finally {
            setIsExporting(false);
        }
    };
    const currentDate = new Date();

    return (
        <div className="space-y-6 w-full">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Xem trước & Xuất PDF</h3>
                <div className="flex gap-2">
                    <Button onClick={exportToPdf} disabled={isExporting} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {isExporting ? "Đang xuất..." : "Xuất PDF"}
                    </Button>
                </div>
            </div>

            {/* PDF Preview */}
            <div className="w-full border rounded-lg shadow-lg bg-white">
                <div
                    ref={pdfRef}
                    className="p-4 mx-auto"
                >
                    {/* Header */}
                    <div className="flex justify-between mb-6">
                        <div className="text-left">
                            <div className="flex items-center">
                                <div className="w-16 h-16 mr-2">
                                    <img src="/logo/UTE.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
                                    <p className="text-xs font-bold">
                                        TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT - ĐẠI HỌC ĐÀ NẴNG
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs">Mẫu: ĐKĐT-2024</p>
                            <p className="text-xs">Đà Nẵng, ngày {formatDate(currentDate)}</p>
                            <p className="text-xs">Mã số: {formValues.topicCode || "_______________"}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold uppercase">ĐƠN ĐĂNG KÝ</h1>
                        <h2 className="text-lg font-bold uppercase">ĐỀ TÀI KHOA HỌC VÀ CÔNG NGHỆ</h2>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 text-sm">
                        {/* Section 1: General Information */}
                        <div>
                            <h3 className="font-bold text-base mb-2">A. THÔNG TIN CHUNG</h3>

                            <div className="mb-2">
                                <span className="font-bold">1. Tên đề tài: </span>
                                <span className="font-bold">{formValues.vietnameseName || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span>Tên tiếng Anh: </span>
                                <span>{formValues.englishName || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">2. Mã số đề tài: </span>
                                <span>{formValues.topicCode || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">3. Lĩnh vực nghiên cứu: </span>
                                <span>{getFieldLabel(formValues.field) || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">4. Loại hình nghiên cứu: </span>
                                <span>{getResearchTypeLabel(formValues.researchType) || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">5. Thời gian thực hiện: </span>
                                <span>
                                    {formValues.durationInMonths
                                        ? `${formValues.durationInMonths} tháng`
                                        : "_____ tháng"}
                                </span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">6. Kinh phí: </span>
                                <span>
                                    {formValues.totalBudget
                                        ? formatVND(formValues.totalBudget)
                                        : "_____________ VND"}
                                </span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">7. Cơ quan chủ trì: </span>
                                <span>{getDepartmentLabel(formValues.department) || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">8. Đợt đăng ký: </span>
                                <span>
                                    {getRegistrationPeriodLabel(formValues.registrationPeriod) || "_______________"}
                                </span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">9. Ngày bắt đầu: </span>
                                <span>
                                    {formValues.startDate
                                        ? formatDate(new Date(formValues.startDate))
                                        : "_______________"}
                                </span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">10. Năm kết thúc: </span>
                                <span>{formValues.endYear || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">11. Trạng thái: </span>
                                <span>{formValues.status || "_______________"}</span>
                            </div>
                        </div>

                        {/* Section 2: Principal Investigator */}
                        <div>
                            <h3 className="font-bold text-base mb-2">B. CHỦ NHIỆM ĐỀ TÀI</h3>

                            <div className="mb-2">
                                <span className="font-bold">1. Họ và tên: </span>
                                <span>{formValues.principalInvestigator || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">2. Học hàm, học vị: </span>
                                <span>{formValues.academicTitle || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">3. Chức vụ: </span>
                                <span>{formValues.position || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">4. Điện thoại: </span>
                                <span>{formValues.phone || "_______________"}</span>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold">5. Email: </span>
                                <span>{formValues.email || "_______________"}</span>
                            </div>
                        </div>

                        {/* Section 3: Research Content */}
                        <div>
                            <h3 className="font-bold text-base mb-2">C. NỘI DUNG NGHIÊN CỨU</h3>

                            <div className="mb-2">
                                <p className="font-bold">1. Mục tiêu:</p>
                                <div className="ml-4">
                                    {formValues.objectives
                                        ? renderContent(formValues.objectives)
                                        : "_______________"}
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">2. Tính cấp thiết:</p>
                                <div className="ml-4">
                                    {formValues.urgency ? renderContent(formValues.urgency) : "_______________"}
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">3. Nội dung chính:</p>
                                <div className="ml-4">
                                    {formValues.mainContent
                                        ? renderContent(formValues.mainContent)
                                        : "_______________"}
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">4. Tính mới và sáng tạo:</p>
                                <div className="ml-4">
                                    {formValues.novelty ? renderContent(formValues.novelty) : "_______________"}
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">5. Từ khóa:</p>
                                <p className="ml-4">{formValues.keywords?.join(", ") || "_______________"}</p>
                            </div>
                        </div>

                        {/* Section 4: Expected Results */}
                        <div>
                            <h3 className="font-bold text-base mb-2">D. KẾT QUẢ DỰ KIẾN</h3>

                            <div className="mb-4">
                                <p className="font-bold mb-2">1. Sản phẩm khoa học:</p>

                                {formValues.expectedProducts?.length > 0 ? (
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 p-1 text-left">TT</th>
                                                <th className="border border-gray-300 p-1 text-left">Tên sản phẩm</th>
                                                <th className="border border-gray-300 p-1 text-left">Chỉ tiêu chất lượng</th>
                                                <th className="border border-gray-300 p-1 text-left">Ghi chú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formValues.expectedProducts.map((product: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 p-1">{index + 1}</td>
                                                    <td className="border border-gray-300 p-1">{product.productName}</td>
                                                    <td className="border border-gray-300 p-1">{product.criteria}</td>
                                                    <td className="border border-gray-300 p-1">{product.description || ""}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="ml-4 italic">Chưa có thông tin</p>
                                )}
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">2. Hình thức chuyển giao:</p>
                                <p className="ml-4">
                                    {formValues.transferForm?.length > 0
                                        ? formValues.transferForm.map(getTransferFormLabel).join(", ")
                                        : "_______________"}
                                </p>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">3. Địa chỉ ứng dụng:</p>
                                <div className="ml-4">
                                    {formValues.practicalApplications
                                        ? renderContent(formValues.practicalApplications)
                                        : "_______________"}
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">4. Rủi ro dự kiến:</p>
                                <div className="ml-4">
                                    {formValues.expectedRisks
                                        ? renderContent(formValues.expectedRisks)
                                        : "_______________"}
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">5. Tác động và lợi ích:</p>
                                <div className="ml-4">
                                    {formValues.benefits ? renderContent(formValues.benefits) : "_______________"}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Budget */}
                        <div>
                            <h3 className="font-bold text-base mb-2">E. KINH PHÍ THỰC HIỆN</h3>

                            <div className="mb-2">
                                <p className="font-bold">
                                    1. Tổng kinh phí:{" "}
                                    {formValues.totalBudget
                                        ? formatVND(formValues.totalBudget)
                                        : "_____________ VND"}
                                </p>
                                <p className="ml-4">Trong đó:</p>
                                <p className="ml-8">
                                    - Từ ngân sách nhà nước:{" "}
                                    {formValues.fundingSource === "GOVERNMENT" && formValues.totalBudget
                                        ? formatVND(formValues.totalBudget)
                                        : "_____________ VND"}
                                </p>
                                <p className="ml-8">
                                    - Từ nguồn tự có:{" "}
                                    {formValues.fundingSource === "SELF_FUNDED" && formValues.totalBudget
                                        ? formatVND(formValues.totalBudget)
                                        : "_____________ VND"}
                                </p>
                                <p className="ml-8">
                                    - Từ nguồn khác:{" "}
                                    {formValues.fundingSource === "OTHER" && formValues.totalBudget
                                        ? formatVND(formValues.totalBudget)
                                        : "_____________ VND"}
                                </p>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">
                                    2. Kinh phí được phê duyệt:{" "}
                                    {formValues.approvedBudget !== undefined
                                        ? formatVND(formValues.approvedBudget)
                                        : "_____________ VND"}
                                </p>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">
                                    3. Kinh phí còn lại:{" "}
                                    {formValues.remainingBudget !== undefined
                                        ? formatVND(formValues.remainingBudget)
                                        : "_____________ VND"}
                                </p>
                            </div>

                            <div className="mb-2">
                                <p className="font-bold">4. Nguồn kinh phí: </p>
                                <p className="ml-4">
                                    {getFundingSourceLabel(formValues.fundingSource) || "_______________"}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="font-bold mb-2">5. Chi tiết kinh phí:</p>

                                {formValues.budgetBreakdown?.length > 0 ? (
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 p-1 text-left">TT</th>
                                                <th className="border border-gray-300 p-1 text-left">Nội dung</th>
                                                <th className="border border-gray-300 p-1 text-left">Thành tiền (VND)</th>
                                                <th className="border border-gray-300 p-1 text-left">Ghi chú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formValues.budgetBreakdown.map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 p-1">{index + 1}</td>
                                                    <td className="border border-gray-300 p-1">{item.category}</td>
                                                    <td className="border border-gray-300 p-1">{formatVND(item.amount)}</td>
                                                    <td className="border border-gray-300 p-1">{item.description || ""}</td>
                                                </tr>
                                            ))}
                                            <tr className="font-bold">
                                                <td className="border border-gray-300 p-1"></td>
                                                <td className="border border-gray-300 p-1">Tổng cộng</td>
                                                <td className="border border-gray-300 p-1">
                                                    {formatVND(
                                                        formValues.budgetBreakdown.reduce(
                                                            (sum: number, item: any) => sum + (item.amount || 0),
                                                            0
                                                        )
                                                    )}
                                                </td>
                                                <td className="border border-gray-300 p-1"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="ml-4 italic">Chưa có thông tin</p>
                                )}
                            </div>
                        </div>

                        {/* Section 6: Additional Notes */}
                        <div>
                            <h3 className="font-bold text-base mb-2">F. GHI CHÚ BỔ SUNG</h3>

                            <div className="ml-4">
                                {formValues.additionalNotes
                                    ? renderContent(formValues.additionalNotes)
                                    : "_______________"}
                            </div>
                        </div>

                        {/* Section 7: Attached Documents */}
                        <div>
                            <h3 className="font-bold text-base mb-2">G. TÀI LIỆU ĐÍNH KÈM</h3>

                            {formValues.attachedDocuments?.length > 0 ? (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-1 text-left">TT</th>
                                            <th className="border border-gray-300 p-1 text-left">Tên tài liệu</th>
                                            <th className="border border-gray-300 p-1 text-left">Mô tả</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formValues.attachedDocuments.map((doc: any, index: number) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 p-1">{index + 1}</td>
                                                <td className="border border-gray-300 p-1">{doc.file?.name || "_______________"}</td>
                                                <td className="border border-gray-300 p-1">{doc.description || ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="ml-4 italic">Chưa có tài liệu đính kèm</p>
                            )}
                        </div>

                        {/* Section 8: Commitment */}
                        <div>
                            <h3 className="font-bold text-base mb-2">H. CAM KẾT</h3>

                            <p className="mb-4">
                                Tôi xin cam đoan những nội dung và thông tin kê khai trong hồ sơ này là đúng sự thật. Tôi xin hoàn toàn
                                chịu trách nhiệm trước cơ quan quản lý về những nội dung đã kê khai.
                            </p>

                            <div className="flex justify-between mt-8">
                                <div className="text-center">
                                    <p className="font-bold">XÁC NHẬN CỦA ĐƠN VỊ</p>
                                    <p>(Ký tên, đóng dấu)</p>
                                    <div className="h-20"></div>
                                </div>

                                <div className="text-center">
                                    <p>{`Đà Nẵng, ngày ${formatDate(currentDate)}`}</p>
                                    <p className="font-bold">CHỦ NHIỆM ĐỀ TÀI</p>
                                    <p>(Ký, ghi rõ họ tên)</p>
                                    <div className="h-20"></div>
                                    <p>{formValues.principalInvestigator || "_______________"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}