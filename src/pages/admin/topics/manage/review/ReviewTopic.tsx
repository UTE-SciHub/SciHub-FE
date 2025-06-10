import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ChevronLeft } from "lucide-react";
import { Topic } from "@/models/topic";
import { TopicService } from "@/service/topic-service";
import { toast } from "@/hooks/use-toast";
import Loading from "@/components/loading/loading";
import ReviewForm from "@/pages/admin/topics/manage/review/ReviewForm";
import ReviewResult from "@/pages/admin/topics/manage/review/ReviewResult";
import jsPDF from "jspdf";
import html2canvas from 'html2canvas-pro';

export default function ReviewTopic() {
    const [topic, setTopic] = useState<Topic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [reviewData, setReviewData] = useState({
        councilDate: new Date().toISOString().split('T')[0],
        meetingLocation: "Phòng họp Khoa học Công nghệ - Đại học Sư phạm Kỹ thuật Đà Nẵng",
        councilDecisionNumber: "",
        totalMembers: 1,
        totalPresent: 0,
        totalAbsent: 0,
        guests: "",
        approveCount: 0,
        rejectCount: 0,
        approved: false,
        topicCode: "",
        passedCriteria: [] as string[],
        comments: {
            topicName: "",
            objectives: "",
            content: "",
            products: "",
            budget: "",
            additionalNotes: "",
        },
    });
    const { id } = useParams<{ id: string }>();
    const pdfRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopicData = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const response = await TopicService.getById(id);
                if (response.status === 200 && response.data.code === 1000) {
                    setTopic(response.data.data);
                } else {
                    toast({
                        title: "Lỗi khi tải dữ liệu",
                        description: "Không thể tải thông tin đề tài. Vui lòng thử lại.",
                        variant: "error",
                    });
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu đề tài:", error);
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải thông tin đề tài. Vui lòng thử lại.",
                    variant: "error",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopicData();
    }, [id]);

    const handleNextStep = (data: any) => {
        setReviewData(data);
        setCurrentStep(2);
    };

    const handlePreviousStep = () => {
        setCurrentStep(1);
    };

    const handleFormChange = (data: any) => {
        setReviewData(data);
    };

    const exportToPdf = async () => {
        if (!pdfRef.current) {
            console.error("PDF reference element not found.");
            return null;
        }

        try {
            window.scrollTo(0, 0);

            const canvas = await html2canvas(pdfRef.current, {
                scale: 1.5,
                useCORS: true,
                logging: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 210 * 3.78,
                windowHeight: pdfRef.current.scrollHeight,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.7);
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
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

            const pdfBlob = pdf.output("blob");
            const file = new File([pdfBlob], `BM.05-QT.01-KHCN.pdf`, { type: "application/pdf" });

            // Tự động tải về
            const link = document.createElement("a");
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            link.click();
            URL.revokeObjectURL(link.href);

            return file;
        } catch (error) {
            console.error("Error exporting PDF:", error);
            toast({
                title: "Lỗi khi xuất PDF",
                description: "Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.",
                variant: "error",
            });
            return null;
        }
    };

    const handleSubmitReview = async () => {
        if (!id || !topic) return;

        setIsLoading(true);
        try {
            const pdfFile = await exportToPdf();
            if (!pdfFile) throw new Error("Không thể tạo file PDF");

            const approvedData = { 
                approved: reviewData.approved,
                topicCode: reviewData.topicCode
            };
            const jsonBlob = new Blob([JSON.stringify(approvedData)], {
                type: "application/json",
            });

            const formData = new FormData();
            formData.append("pdfFile", pdfFile);
            formData.append("approved", jsonBlob);

            const response = await TopicService.newReviewTopic(id, formData);

            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: "Đánh giá thành công",
                    description: "Đã gửi kết quả đánh giá đề tài thành công.",
                });

                navigate(-1);
            } else {
                throw new Error(response.data.message || "Đã xảy ra lỗi khi gửi đánh giá.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá đề tài:", error);
            toast({
                title: "Lỗi khi gửi đánh giá",
                description: "Không thể gửi kết quả đánh giá. Vui lòng thử lại.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!topic) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Không tìm thấy thông tin đề tài</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Xác định danh mục</h1>
                    <p className="text-sm text-muted-foreground">
                        {currentStep === 1 ? "Biên bản họp Hội đồng xác định danh mục" : "Xem kết quả đánh giá"}
                    </p>
                </div>
                <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {currentStep === 1 ? (
                        <ReviewForm 
                            topic={topic} 
                            onNextStep={handleNextStep} 
                            formData={reviewData}
                            onChange={handleFormChange}
                        />
                    ) : (
                        <div className="space-y-6">
                            <ReviewResult
                                ref={pdfRef}
                                topic={topic}
                                reviewData={reviewData}
                            />

                            <div className="flex justify-between p-6 border-t">
                                <Button variant="outline" onClick={handlePreviousStep}>
                                    <ChevronLeft className="h-4 w-4" />
                                    Quay lại chỉnh sửa
                                </Button>
                                <Button onClick={handleSubmitReview} disabled={isLoading}>
                                    <Check className="h-4 w-4" />
                                    {isLoading ? "Đang xử lý..." : "Hoàn tất đánh giá"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}