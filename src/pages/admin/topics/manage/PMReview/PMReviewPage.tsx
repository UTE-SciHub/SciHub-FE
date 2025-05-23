import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { Topic } from "@/models/topic";
import { TopicService } from "@/service/topic-service";
import { toast } from "@/hooks/use-toast";
import Loading from "@/components/loading/loading";
import ReviewForm from "@/pages/admin/topics/manage/PMReview/ReviewForm";
import ReviewResult from "@/pages/admin/topics/manage/PMReview/ReviewResult";
import { EvaluationDetail } from "@/models/evaluation-detail";
import { EvaluationService } from "@/service/evaluation-service";

export default function PMReviewPage() {
    const [topic, setTopic] = useState<Topic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [reviewData, setReviewData] = useState<EvaluationDetail>(null);
    const { id } = useParams<{ id: string }>();

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

    const handleSubmitReview = async () => {
        if (!id || !reviewData) return;

        setIsLoading(true);
        try {

            console.log("Submitting review data:", reviewData);
            // const response = await EvaluationService.submitEvaluate(id, reviewData);

            // if (response.status === 200 && response.data.code === 1000) {
            //     toast({
            //         title: "Đánh giá thành công",
            //         description: "Đã gửi kết quả đánh giá đề tài thành công.",
            //     });
            //     // Optionally navigate back or to another page
            //     // window.history.back();
            // } else {
            //     throw new Error(response.data.message || "Không thể gửi đánh giá");
            // }
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
                    <h1 className="text-2xl font-bold">Đánh giá đề tài</h1>
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
                        <ReviewForm topic={topic} onNextStep={handleNextStep} formData={reviewData} />
                    ) : (
                        <div className="space-y-6">
                            <ReviewResult topic={topic} reviewData={reviewData} />

                            <div className="flex justify-between p-6 border-t">
                                <Button variant="outline" onClick={handlePreviousStep}>
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