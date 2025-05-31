import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatDate } from "@/utils/dateTimeFormat";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Topic } from "@/models/topic";
import { UserService } from "@/service/user-service"; // Giả định bạn có service này
import { toast } from "@/hooks/use-toast";
import Loading from "@/components/loading/loading";

interface CouncilDecisionDocumentProps {
    decisionNumber?: string;
    decisionDate?: string;
    signedBy?: string;
    topics?: Topic[];
    onClose?: () => void;
}

interface User {
    name: string;
    email: string;
    // Thêm các trường khác nếu cần
}

const CouncilDecisionDocument: React.FC<CouncilDecisionDocumentProps> = ({
    decisionNumber = "",
    decisionDate = "",
    signedBy = "PGS.TS. PHAN CAO THỌ",
    topics = [],
    onClose,
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [principalInvestigators, setPrincipalInvestigators] = useState<{ [email: string]: string }>({}); // Lưu tên theo email
    const pdfRef = useRef<HTMLDivElement>(null);
    const currentDate = new Date();

    // Lấy thông tin người dùng từ email
    useEffect(() => {
        const fetchPrincipalInvestigators = async () => {
            setIsLoading(true);
            try {
                const emailPromises = topics.map(async (topic) => {
                    const email = topic.principalInvestigator;
                    if (!email || principalInvestigators[email]) return; // Bỏ qua nếu không có email hoặc đã lấy
                    const response = await UserService.getUserByEmail(email);
                    return { email, name: response.data.data.name };
                });

                const results = await Promise.all(emailPromises);
                const investigatorsMap = results.reduce((acc, result) => {
                    if (result) acc[result.email] = result.name;
                    return acc;
                }, {} as { [email: string]: string });

                setPrincipalInvestigators((prev) => ({ ...prev, ...investigatorsMap }));
            } catch (error) {
                console.error("Error fetching principal investigators:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin chủ nhiệm đề tài. Vui lòng thử lại sau.",
                    variant: "error",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (topics.length > 0) {
            fetchPrincipalInvestigators();
        } else {
            setIsLoading(false);
        }
    }, [topics]);

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
            pdf.save(`Quyết định phê duyệt đề tài.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xuất PDF. Vui lòng thử lại sau.",
                variant: "error",
            });
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6 w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-xl font-semibold">Quyết định phê duyệt đề tài</h3>
                <div className="space-x-2 flex-shrink-0">
                    <Button
                        onClick={exportToPdf}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? "Đang xuất..." : "Xuất PDF"}
                    </Button>
                    {onClose && (
                        <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                            Đóng
                        </Button>
                    )}
                </div>
            </div>

            <div className="w-full border rounded-lg shadow-lg bg-white">
                <div ref={pdfRef} className="p-6 mx-auto font-times text-[12px] leading-[1.5]">
                    {/* Page 1 - Decision Document */}
                    <div className="mb-10">
                        {/* Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="text-left">
                                <p className="text-sm font-semibold">ĐẠI HỌC ĐÀ NẴNG</p>
                                <p className="text-sm font-bold">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
                                <p className="text-sm">Số: {decisionNumber || "........"}/QĐ-ĐHSPKT</p>
                            </div>
                            <div className="text-right mt-4 md:mt-0">
                                <p className="text-sm">BM.21-QT.01-KHCN</p>
                                <p className="text-sm">
                                    <span className="font-bold">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</span>
                                    <br />
                                    <span>Độc lập - Tự do - Hạnh phúc</span>
                                </p>
                                <p className="text-sm italic">
                                    Đà Nẵng, ngày {decisionDate || formatDate(currentDate)}
                                </p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h1 className="font-bold text-base">QUYẾT ĐỊNH</h1>
                            <p className="text-sm">Về việc phê duyệt kinh phí và giao nhiệm vụ thực hiện</p>
                            <p className="text-sm">đề tài khoa học và công nghệ cấp Trường năm {new Date().getFullYear()}</p>
                            <h2 className="font-bold text-base mt-2">HIỆU TRƯỞNG TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</h2>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 text-sm">
                            <p className="text-justify">
                                <span className="italic">Căn cứ Quyết định số 1749/QĐ-TTg ngày 08 tháng 11 năm 2017 của Thủ
                                    tướng Chính phủ về việc thành lập Trường Đại học Sư phạm Kỹ thuật thuộc
                                    Đại học Đà Nẵng;</span>
                            </p>
                            <p className="text-justify">
                                <span className="italic">Căn cứ Quyết định số 216/QĐ-ĐHSPKT ngày 09 tháng 3 năm 2018 của
                                    Hiệu trưởng Trường Đại học Sư phạm Kỹ thuật về việc ban hành Quy định quản
                                    lý đề tài khoa học và công nghệ cấp cơ sở (cấp Trường) do Trường Đại học Sư
                                    phạm Kỹ thuật quản lý;</span>
                            </p>
                            <p className="text-justify">
                                <span className="italic">Căn cứ Kết luận của Chủ tịch Hội đồng tuyển chọn các đề tài khoa học và
                                    công nghệ cấp Trường năm {new Date().getFullYear()};</span>
                            </p>
                            <p className="text-justify">
                                <span className="italic">Theo đề nghị của Ông Trưởng phòng Phòng Quản lý Khoa học và Hợp tác
                                    Quốc tế (QLKH&HTQT).</span>
                            </p>
                        </div>

                        {/* Decision */}
                        <div className="text-center my-4">
                            <h2 className="font-bold">QUYẾT ĐỊNH:</h2>
                        </div>

                        <div className="space-y-4 text-sm">
                            <p>
                                <span className="font-bold">Điều 1.</span>{" "}
                                Phê duyệt kinh phí và giao nhiệm vụ thực hiện đề tài khoa học và
                                công nghệ cấp Trường của Trường Đại học Sư phạm Kỹ thuật năm {new Date().getFullYear()} gồm các
                                đề tài trong Danh mục kèm theo.
                            </p>
                            <p>
                                <span className="font-bold">Điều 2.</span>{" "}
                                Giao Phòng QLKH&HTQT, Phòng Kế hoạch – Tài chính, các Khoa
                                và các Chủ nhiệm đề tài tổ chức triển khai thực hiện theo đúng quy định hiện hành
                                của Nhà trường.
                            </p>
                            <p>
                                <span className="font-bold">Điều 3.</span>{" "}
                                Các Ông (Bà) Trưởng phòng Phòng QLKH&HTQT, Trưởng phòng
                                Phòng Kế hoạch – Tài chính, Trưởng các Khoa và các Chủ nhiệm đề tài có tên tại
                                Điều 1 căn cứ quyết định thi hành.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 mt-6">
                            <div className="text-left text-sm">
                                <p className="font-bold">Nơi nhận:</p>
                                <p>- Như điều 3;</p>
                                <p>- Lưu: VT, QLKH&HTQT.</p>
                            </div>
                            <div className="text-center flex flex-col justify-end h-32">
                                <p className="font-bold text-sm">HIỆU TRƯỞNG</p>
                                <p className="font-bold text-sm mt-auto">{signedBy}</p>
                            </div>
                        </div>
                    </div>

                    {/* Page 2 - Topic List */}
                    <div className="page-break-before">
                        {/* Header */}
                        <div className="text-center mb-4">
                            <p className="text-sm font-semibold">ĐẠI HỌC ĐÀ NẴNG</p>
                            <p className="text-sm font-bold">TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT</p>
                            <div className="my-4">
                                <p className="font-bold text-sm">DANH MỤC ĐỀ TÀI KHOA HỌC VÀ CÔNG NGHỆ CẤP</p>
                                <p className="font-bold text-sm">TRƯỜNG NĂM {new Date().getFullYear()}</p>
                            </div>
                            <p className="text-sm italic">
                                (Kèm theo Quyết định số {decisionNumber || "........"}/QĐ-ĐHSPKT, ngày {decisionDate || formatDate(currentDate)} của Hiệu trưởng
                                <br />Trường Đại học Sư phạm Kỹ thuật)
                            </p>
                        </div>

                        <Table className="w-full border-collapse">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-sm text-center border font-bold w-[50px]">STT</TableHead>
                                    <TableHead className="text-sm text-center border font-bold min-w-[100px]">Mã số đề tài</TableHead>
                                    <TableHead className="text-sm text-center border font-bold min-w-[200px] max-w-[300px]">Tên đề tài</TableHead>
                                    <TableHead className="text-sm text-center border font-bold min-w-[150px]">Chủ nhiệm đề tài</TableHead>
                                    <TableHead className="text-sm text-center border font-bold min-w-[150px]">Thành viên tham gia</TableHead>
                                    <TableHead className="text-sm text-center border font-bold min-w-[150px]">Sản phẩm đề tài</TableHead>
                                    <TableHead className="text-sm text-center border font-bold w-[100px]">Thời gian thực hiện</TableHead>
                                    <TableHead className="text-sm text-center border font-bold w-[120px]">Kinh phí phê duyệt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topics && topics.length > 0 ? (
                                    topics.map((topic, index) => (
                                        <TableRow key={topic.id || index}>
                                            <TableCell className="text-sm border text-center w-[50px]">{index + 1}</TableCell>
                                            <TableCell className="text-sm border min-w-[100px]">{topic.topicCode}</TableCell>
                                            <TableCell className="text-sm border min-w-[200px] max-w-[300px] truncate">{topic.vietnameseName}</TableCell>
                                            <TableCell className="text-sm border min-w-[150px]">
                                                {`${principalInvestigators[topic.principalInvestigator] || topic.principalInvestigator} - ${topic.principalInvestigator}`}
                                            </TableCell>
                                            <TableCell className="text-sm border min-w-[150px]">
                                                {/* Placeholder for team members */}
                                                {/* {topic.teamMembers?.join(", ") || "Chưa có thông tin"} */}
                                            </TableCell>
                                            <TableCell className="text-sm border min-w-[150px]">
                                                {/* {topic.expectedProducts
                                                    ? topic.expectedProducts.map((product: any, i: number) => (
                                                        <div key={i}>{product.productName || "Chưa xác định"}</div>
                                                    ))
                                                    : "Chưa có sản phẩm"} */}
                                            </TableCell>
                                            <TableCell className="text-sm border text-center w-[100px]">
                                                {topic.durationInMonths} tháng
                                            </TableCell>
                                            <TableCell className="text-sm border text-right w-[120px]">
                                                {topic.approvedBudget?.toLocaleString()} VNĐ
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-sm border text-center py-4">
                                            Chưa có đề tài được phê duyệt
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouncilDecisionDocument;