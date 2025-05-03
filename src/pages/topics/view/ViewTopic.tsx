import StepNavigation from "@/components/step/StepNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GeneralInformationStep from "@/pages/topics/steps/GeneralInformationStep";
import SpecializationStep from "@/pages/topics/steps/SpecializationStep";
import TimeAndBudgetStep from "@/pages/topics/steps/TimeAndBudgetStep";
import ReviewStep from "@/pages/topics/steps/ReviewStep";
import { ArrowLeft, ArrowRight, CornerUpLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { TopicService } from "@/service/topic-service";
import { DepartmentService } from "@/service/department-service";
import { Department } from "@/models/department";
import { ResearchType } from "@/models/research-type";
import { ResearchField } from "@/models/research-field";
import { ResearchTypeService } from "@/service/research-type-service";
import { ResearchFieldService } from "@/service/research-field-service";
import Loading from "@/components/loading/loading";
import { Category } from "@/models/category";
import { CategoryService } from "@/service/category-service";
import { RegistrationPeriod } from "@/models/registraion-period";
import { RegistrationService } from "@/service/registration-service";
import AttachedDocuments from "@/pages/topics/steps/AttachedDocuments";
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status";
import { TopicFormValues } from "@/models/TopicFormValues";

const steps = [
    { id: 1, title: "Thông tin chung" },
    { id: 2, title: "Kết quả nghiên cứu (dự kiến)" },
    { id: 3, title: "Thời gian & kinh phí" },
    { id: 4, title: "Biểu mẫu đính kèm" },
    { id: 5, title: "Xác nhận & hoàn tất" },
];

export default function ViewTopic() {
    const [currentStep, setCurrentStep] = useState(1);
    const [topicData, setTopicData] = useState<TopicFormValues | null>(null);
    const [researchTypes, setResearchTypes] = useState<ResearchType[]>([]);
    const [researchFields, setResearchFields] = useState<ResearchField[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [periods, setPeriods] = useState<RegistrationPeriod[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const form = useForm<TopicFormValues>({
        defaultValues: {
            vietnameseName: "",
            englishName: "",
            topicCode: "",
            principalInvestigator: "",
            objectives: "",
            mainContent: "",
            urgency: "",
            keywords: [],
            department: "",
            category: "",
            period: "",
            field: "",
            researchType: "",
            transferForm: [],
            expectedProducts: {
                scientific: { domestic: 0, international: 0 },
                training: { masters: 0, students: 0 },
                commercial: { details: "" },
            },
            practicalApplications: "",
            attachedDocuments: [],
            expectedRisks: "",
            startDate: new Date(),
            durationInMonths: 0,
            endYear: 0,
            totalBudget: 0,
            remainingBudget: 0,
            fundingSource: "",
            budgetBreakdown: [{ category: "", amount: 0, description: "" }],
            status: "DRAFT",
            commitment: false,
            additionalNotes: "",
        },
        mode: "onChange",
    });

    const fetchTopicData = async () => {
        if (!id) {
            toast({
                title: "Không tìm thấy đề tài",
                description: "Vui lòng kiểm tra lại thông tin đề tài.",
                variant: "error",
            });
            navigate("/my-topics");
            return;
        }

        try {
            const response = await TopicService.getById(id);
            const data = response.data.data;

            const formattedData: TopicFormValues = {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                department: data.department?.id ? String(data.department.id) : "",
                category: data.category?.id ? String(data.category.id) : "",
                period: data.registrationPeriod?.id ? String(data.registrationPeriod.id) : "",
                field: data.field?.id ? String(data.field.id) : "",
                researchType: data.researchType?.id ? String(data.researchType.id) : "",
                keywords: data.keywords || [],
                topicCode: data.topicCode ?? "",
                expectedProducts: data.expectedProducts
                    ? JSON.parse(data.expectedProducts)
                    : {
                        scientific: { domestic: 0, international: 0 },
                        training: { masters: 0, students: 0 },
                        commercial: { details: "" },
                    },
                budgetBreakdown: data.budgetBreakdown
                    ? JSON.parse(data.budgetBreakdown)
                    : [{ category: "", amount: 0, description: "" }],
                transferForm: data.transferForm || [],
                attachedDocuments: data.attachedDocuments?.map(doc => ({
                    file: undefined,
                    description: doc.description || "",
                    url: doc.filePath || "",
                    id: doc.publicId || "",
                    originalFileName: doc.originalFileName || "",
                })) || [],
            };

            setTopicData(formattedData);

            // Set form values after fetching topic data
            form.reset(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu đề tài:", error);
            toast({
                title: "Lỗi khi tải dữ liệu",
                description: "Không thể tải thông tin đề tài. Vui lòng thử lại.",
                variant: "error",
            });
            navigate("/my-topics");
        }
    };

    useEffect(() => {
        fetchTopicData();
    }, [id, navigate]);

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                const [researchTypeResponse, researchFieldResponse, categoriesResponse, periodResponse] = await Promise.all([
                    ResearchTypeService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
                    ResearchFieldService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
                    CategoryService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
                    RegistrationService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "startDate",
                        order: "desc",
                        status: RegistrationPeriodStatus.OPEN,
                        year: new Date().getFullYear(),
                    }),
                ]);

                setResearchTypes(researchTypeResponse.data.data);
                setResearchFields(researchFieldResponse.data.data);
                setCategories(categoriesResponse.data.data);
                setPeriods(periodResponse.data.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải danh sách khoa, loại hình hoặc lĩnh vực. Vui lòng thử lại.",
                    variant: "error",
                });
                setResearchTypes([]);
                setResearchFields([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handlePrevious = () => {
        goToStep(currentStep - 1);
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            goToStep(currentStep + 1);
        }
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (isLoading || !topicData) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col">
            <Card className="shadow-sm">
                <CardHeader className="sticky top-16 bg-white z-10 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Xem đề tài nghiên cứu khoa học</CardTitle>
                            <CardDescription>Thông tin chi tiết của đề tài nghiên cứu khoa học</CardDescription>
                        </div>
                        <div>
                            <Button variant="outline" className="text-rose-500" onClick={handleBack}>
                                <CornerUpLeft className="h-4 w-4" /> Quay lại
                            </Button>
                        </div>
                    </div>
                    <StepNavigation steps={steps} currentStep={currentStep} onStepClick={goToStep} />
                </CardHeader>

                <Separator />

                {/* Wrap the CardContent with FormProvider */}
                <FormProvider {...form}>
                    <CardContent className="pt-4">
                        {currentStep === 1 && (
                            <GeneralInformationStep
                                form={form}
                                researchTypeOptions={researchTypes}
                                researchFieldOptions={researchFields}
                                categoriesOptions={categories}
                                periodsOptions={periods}
                                isLoadingOptions={isLoading}
                                readOnly={true}
                            />
                        )}
                        {currentStep === 2 && (
                            <SpecializationStep
                                form={form}
                                readOnly={true}
                            />
                        )}
                        {currentStep === 3 && (
                            <TimeAndBudgetStep
                                form={form}
                                readOnly={true}
                            />
                        )}
                        {currentStep === 4 && (
                            <AttachedDocuments
                                form={form}
                                readOnly={true}
                            />
                        )}
                        {currentStep === 5 && (
                            <ReviewStep
                                formValues={topicData}
                                researchFields={researchFields}
                                readOnly={true}
                            />
                        )}
                    </CardContent>
                </FormProvider>

                <Separator />

                <div className="flex justify-between pt-6 px-6 pb-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="h-4 w-4" /> Quay lại
                    </Button>
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={currentStep === steps.length}
                    >
                        <ArrowRight className="h-4 w-4" /> Tiếp theo
                    </Button>
                </div>
            </Card>
        </div>
    );
}