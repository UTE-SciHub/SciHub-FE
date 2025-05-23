import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDate } from "@/utils/dateTimeFormat";

interface CouncilMeetingMinutesProps {
    topicName?: string;
    principalInvestigator?: string;
    institution?: string;
    councilDecisionNumber?: string;
    meetingDate?: string;
    meetingLocation?: string;
    totalMembers?: number;
    presentMembers?: number;
    absentMembers?: number;
    guests?: string;
    initialAverageScore?: number;
    qualifiedVotes?: number;
    unqualifiedVotes?: number;
    qualifiedTotal?: number;
    finalAverageScore?: number;
    councilConclusions?: string;
    chairmanName?: string;
    secretaryName?: string;
}

const CouncilMeetingMinutes: React.FC<CouncilMeetingMinutesProps> = ({
    topicName = "",
    principalInvestigator = "",
    institution = "Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng",
    councilDecisionNumber = "",
    meetingDate = "",
    meetingLocation = "",
    totalMembers = 0,
    presentMembers = 0,
    absentMembers = 0,
    guests = "",
    initialAverageScore = 0,
    qualifiedVotes = 0,
    unqualifiedVotes = 0,
    qualifiedTotal = 0,
    finalAverageScore = 0,
    councilConclusions = "",
    chairmanName = "",
    secretaryName = "",
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    const currentDate = new Date();

    const exportToPdf = async () => {
        if (!pdfRef.current) {
            console.error("PDF reference element not found.");
            return;
        }

        setIsExporting(true);

        try {
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`Biên bản họp hội đồng.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Biên bản họp hội đồng</h3>
                <Button
                    onClick={exportToPdf}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Đang xuất..." : "Xuất PDF"}
                </Button>
            </div>

            <div className="w-full border rounded-lg shadow-lg bg-white font-times">
                <div ref={pdfRef} className="p-6 mx-auto text-sm">
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
                            <p>Đà Nẵng, ngày {formatDate(currentDate)}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="font-bold text-base">BIÊN BẢN HỌP HỘI ĐỒNG TUYỂN CHỌN</h1>
                        <h2 className="font-bold text-base">CHỦ NHIỆM ĐỀ TÀI KHOA HỌC & CÔNG NGHỆ CẤP TRƯỜNG</h2>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <p>1. Tên đề tài: {topicName}</p>
                        <p>2. Chủ nhiệm đề tài: {principalInvestigator}</p>
                        <p>3. Cơ quan chủ trì đề tài: {institution}</p>
                        <p>4. Quyết định thành lập hội đồng: {councilDecisionNumber}</p>
                        <p>5. Ngày họp: {meetingDate || formatDate(currentDate)}</p>
                        <p>6. Địa điểm: {meetingLocation}</p>
                        <p>7. Thành viên của hội đồng: Tổng số: {totalMembers} &nbsp; có mặt: {presentMembers} &nbsp; vắng mặt: {absentMembers}</p>
                        <p>8. Khách mời dự: {guests}</p>
                        <p>9. Tổng số điểm: {qualifiedTotal}</p>
                        <p>10. Điểm trung bình ban đầu: {initialAverageScore}</p>
                        <p>11. Tổng số đầu điểm: &nbsp; trong đó: - hợp lệ: {qualifiedVotes} &nbsp; - không hợp lệ: {unqualifiedVotes}</p>
                        <p>12. Tổng số điểm hợp lệ: {qualifiedTotal}</p>
                        <p>13. Điểm trung bình cuối cùng: {finalAverageScore}</p>
                        <p>14. Kết luận và ý kiến nghị của hội đồng: {councilConclusions}</p>
                    </div>

                    {/* Notes */}
                    <div className="mt-8">
                        <p className="font-bold underline">Ghi chú:</p>
                        <p>- Phê duyệt: ≥ 55 điểm (trong đó, không có tiêu chí nào dưới mức điểm tối thiểu);</p>
                        <p>- Không phê duyệt: &lt; 55 điểm</p>
                        <p>- Điểm của thành viên hội đồng chênh lệch &gt; 20 điểm so với điểm trung bình ban đầu coi là điểm không hợp lệ và không được tính vào tổng số điểm hợp lệ.</p>
                    </div>

                    {/* Signatures */}
                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="font-bold">Chủ tịch hội đồng</p>
                            <p>(Ký, họ và tên)</p>
                            <div className="h-24"></div>
                            <p>{chairmanName}</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold">Thư ký</p>
                            <p>(Ký, họ và tên)</p>
                            <div className="h-24"></div>
                            <p>{secretaryName}</p>
                        </div>
                    </div>

                    {/* School confirmation */}
                    <div className="mt-12 text-center">
                        <p className="font-bold">XÁC NHẬN CỦA TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
                        <div className="h-24"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouncilMeetingMinutes;