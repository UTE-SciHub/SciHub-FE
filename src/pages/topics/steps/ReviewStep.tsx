import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDate } from "@/utils/dateTimeFormat";
import { formatVND } from "@/utils/common";
import { renderContent } from "@/utils/util";
import { ResearchField } from "@/models/research-field";
import useUserStore from "@/store/userStore";

interface ReviewStepProps {
    formValues: any;
    researchFields: ResearchField[];
    readOnly?: boolean;
}

export default function ReviewStep({
    formValues,
    researchFields,
    readOnly = false,
}: ReviewStepProps) {
    const [isExporting, setIsExporting] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    const user = useUserStore((state) => state.user);

    const exportToPdf = async () => {
        if (!pdfRef.current) {
            console.error("PDF reference element not found.");
            return;
        }

        setIsExporting(true);

        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
            window.scrollTo(0, 0);

            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                logging: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 210 * 3.78,
                windowHeight: pdfRef.current.scrollHeight,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210;
            const pageHeight = 297;
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

            pdf.save(`Đề xuất đề tài - ${formValues.topicCode || "Mẫu"}.pdf`);
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
                <h3 className="text-xl font-semibold"></h3>
                <div className="flex gap-2">
                    <Button
                        onClick={exportToPdf}
                        disabled={isExporting || readOnly}
                        className="flex items-center"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? "Đang xuất..." : "Xuất PDF"}
                    </Button>
                </div>
            </div>

            {/* PDF Preview */}
            <div className="w-full border rounded-lg shadow-lg bg-white">
                <div ref={pdfRef} className="p-4 mx-auto text-sm font-times">
                    {/* Header */}
                    <div className="flex justify-between mb-6">
                        <div className="text-left">
                            <div className="flex items-center">
                                <div className="w-10 h-10 mr-2">
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
                            <p className="text-xs">Mẫu số: BM.01-QT.01-KHCN</p>
                            <p className="text-xs">Đà Nẵng, ngày {formatDate(currentDate)}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold uppercase">
                            ĐỀ XUẤT ĐỀ TÀI KHOA HỌC VÀ CÔNG NGHỆ CẤP TRƯỜNG
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {/* 1. Tên đề tài */}
                        <div>
                            <p className="font-bold">
                                1. Tên đề tài: {formValues.vietnameseName || ""}
                            </p>
                        </div>

                        {/* 2. Lĩnh vực nghiên cứu */}
                        <div>
                            <p className="font-bold">2. Lĩnh vực nghiên cứu:</p>
                            <div className="ml-4 grid grid-cols-3 gap-2">
                                {researchFields.map((field) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formValues.field === String(field.id)}
                                            readOnly
                                            className="h-4 w-4"
                                        />
                                        <span>{field.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Tính cấp thiết */}
                        <div>
                            <p className="font-bold">3. Tính cấp thiết:</p>
                            <div className="ml-4">
                                {formValues.urgency ? renderContent(formValues.urgency) : ""}
                            </div>
                        </div>

                        {/* 4. Mục tiêu */}
                        <div>
                            <p className="font-bold">4. Mục tiêu:</p>
                            <div className="ml-4">
                                {formValues.objectives ? renderContent(formValues.objectives) : ""}
                            </div>
                        </div>

                        {/* 5. Nội dung chính */}
                        <div>
                            <p className="font-bold">5. Nội dung chính:</p>
                            <div className="ml-4">
                                {formValues.mainContent ? renderContent(formValues.mainContent) : ""}
                            </div>
                        </div>

                        {/* 6. Sản phẩm và kết quả dự kiến */}
                        <div>
                            <p className="font-bold">6. Sản phẩm và kết quả dự kiến:</p>

                            <div className="ml-4 space-y-2">
                                <p className="ml-2">6.1. Kết quả dự kiến</p>
                                <div className="ml-4">
                                    {formValues.expectedRisks ? renderContent(formValues.expectedRisks) : ""}
                                </div>
                                <p className="ml-2">6.2. Sản phẩm</p>
                                {/* Sản phẩm khoa học */}
                                {(formValues.expectedProducts?.scientific?.international > 0 || formValues.expectedProducts?.scientific?.domestic > 0) && (
                                    <div className="ml-6">
                                        <p>- Sản phẩm khoa học:</p>
                                        {formValues.expectedProducts?.scientific?.international > 0 && (
                                            <p className="ml-4">
                                                + Số bài báo khoa học đăng trên tạp chí nước ngoài:{" "}
                                                {formValues.expectedProducts.scientific.international}
                                            </p>
                                        )}
                                        {formValues.expectedProducts?.scientific?.domestic > 0 && (
                                            <p className="ml-4">
                                                + Số bài báo khoa học đăng trên tạp chí trong nước:{" "}
                                                {formValues.expectedProducts.scientific.domestic}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Sản phẩm đào tạo */}
                                {(formValues.expectedProducts?.training?.masters > 0 || formValues.expectedProducts?.training?.students > 0) && (
                                    <div className="ml-6">
                                        <p>- Sản phẩm đào tạo: Số lượng cao học, số lượng sinh viên tham gia</p>
                                        {formValues.expectedProducts?.training?.masters > 0 && (
                                            <p className="ml-4">+ Số lượng cao học: {formValues.expectedProducts.training.masters}</p>
                                        )}
                                        {formValues.expectedProducts?.training?.students > 0 && (
                                            <p className="ml-4">+ Số lượng sinh viên tham gia: {formValues.expectedProducts.training.students}</p>
                                        )}
                                    </div>
                                )}

                                {/* Sản phẩm ứng dụng */}
                                {formValues.expectedProducts?.commercial?.details && (
                                    <div className="ml-6">
                                        <p>- Sản phẩm ứng dụng: Mô tả tóm tắt về sản phẩm dự kiến, phạm vi, khả năng và địa chỉ ứng dụng,...</p>
                                        <p className="ml-4">
                                            {renderContent(formValues.expectedProducts.commercial.details)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 7. Hiệu quả dự kiến */}
                        <div>
                            <p className="font-bold">7. Hiệu quả dự kiến:</p>
                            <div className="ml-4">
                                {formValues.practicalApplications ? renderContent(formValues.practicalApplications) : ""}
                            </div>
                        </div>

                        {/* 8. Nhu cầu kinh phí dự kiến */}
                        <div>
                            <p className="font-bold">8. Nhu cầu kinh phí dự kiến:</p>
                            <div className="ml-4">
                                {formValues.totalBudget ? formatVND(formValues.totalBudget) : ""}
                            </div>
                        </div>

                        {/* 9. Thời gian nghiên cứu dự kiến */}
                        <div>
                            <p className="font-bold">9. Thời gian nghiên cứu dự kiến:</p>
                            <div className="ml-4">
                                {formValues.durationInMonths
                                    ? `${formValues.durationInMonths} tháng`
                                    : ""}
                            </div>
                        </div>

                        {/* 10. Thông tin liên lạc của người đề xuất */}
                        <div>
                            <p className="font-bold">10. Thông tin liên lạc của người đề xuất:</p>
                            <div className="ml-4">
                                <p>Họ và tên: {user.name || ""}</p>
                                <p>Điện thoại: {user.phoneNumber || ""}</p>
                                <p>Email: {user.email || ""}</p>
                            </div>
                        </div>

                        {/* 11. Danh sách tài liệu đính kèm */}
                        <div>
                            <p className="font-bold">11. Danh sách tài liệu đính kèm:</p>
                            <div className="ml-4">
                                {formValues.attachedDocuments && formValues.attachedDocuments.length > 0 ? (
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 p-2 text-left">STT</th>
                                                <th className="border border-gray-300 p-2 text-left">Tên tài liệu</th>
                                                <th className="border border-gray-300 p-2 text-left">Mô tả</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formValues.attachedDocuments.map((doc, index) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 p-2">{index + 1}</td>
                                                    <td className="border border-gray-300 p-2">{doc.file?.name || ""}</td>
                                                    <td className="border border-gray-300 p-2">{doc.description || ""}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>Không có tài liệu đính kèm.</p>
                                )}
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="mt-8">
                            <div className="flex justify-end">
                                <div className="text-center">
                                    <p>{`Đà Nẵng, ngày ${formatDate(currentDate)}`}</p>
                                    <p className="font-bold">Người đề xuất</p>
                                    <p>(Ký, họ và tên)</p>
                                    <div className="h-20"></div>
                                    <p>{formValues.principalInvestigator || ""}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}