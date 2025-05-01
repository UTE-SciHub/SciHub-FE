import StepNavigation from "@/components/step/StepNavigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import GeneralInformationStep from "@/pages/topics/steps/GeneralInformationStep"
import SpecializationStep from "@/pages/topics/steps/SpecializationStep"
import TimeAndBudgetStep from "@/pages/topics/steps/TimeAndBudgetStep"
import ReviewStep from "@/pages/topics/steps/ReviewStep"
import { ArrowLeft, ArrowRight, ClipboardCheck, CornerUpLeft, Loader2, RotateCcw, Save, Trash2, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Path, useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import CryptoJS from "crypto-js"
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
import { useNavigate } from "react-router-dom"
import { TopicService } from "@/service/topic-service"
import { DepartmentService } from "@/service/department-service"
import { Department } from "@/models/department"
import { ResearchType } from "@/models/research-type"
import { ResearchField } from "@/models/research-field"
import { ResearchTypeService } from "@/service/research-type-service"
import { ResearchFieldService } from "@/service/research-field-service"
import Loading from "@/components/loading/loading"
import { zodResolver } from "@hookform/resolvers/zod"
import TestStep from "@/pages/topics/steps/test-step"
import { Category } from "@/models/category"
import { CategoryService } from "@/service/category-service"
import { RegistrationPeriod } from "@/models/registraion-period"
import { RegistrationService } from "@/service/registration-service"
import AttachedDocuments from "@/pages/topics/steps/AttachedDocuments"

const topicFormSchema = z
    .object({
        vietnameseName: z.string().min(5, { message: "Tên tiếng Việt phải có ít nhất 5 ký tự" }),
        englishName: z.string().min(5, { message: "Tên tiếng Anh phải có ít nhất 5 ký tự" }),
        topicCode: z.string().optional(),
        principalInvestigator: z.string().optional(),
        objectives: z.string().min(10, { message: "Mục tiêu phải có ít nhất 10 ký tự" }),
        mainContent: z.string().min(20, { message: "Nội dung chính phải có ít nhất 20 ký tự" }),
        urgency: z.string().min(1, { message: "Tính cấp thiết là bắt buộc" }),
        keywords: z.array(z.string()).min(1, { message: "Cần ít nhất một từ khóa" }),
        department: z.string().min(1, { message: "Vui lòng chọn khoa" }),
        category: z.string().min(1, { message: "Vui lòng chọn loại đề tài" }),
        period: z.string().min(1, { message: "Vui lòng chọn đợt đăng ký" }),
        field: z.string().min(1, { message: "Vui lòng chọn lĩnh vực nghiên cứu" }),
        researchType: z.string().min(1, { message: "Vui lòng chọn loại hình nghiên cứu" }),
        transferForm: z.array(z.string()).optional(),
        expectedProducts: z.object({
            scientific: z
                .object({
                    domestic: z.number().min(0, { message: "Số bài báo trong nước không được âm" }).optional(),
                    international: z.number().min(0, { message: "Số bài báo quốc tế không được âm" }).optional(),
                })
                .optional(),
            training: z
                .object({
                    masters: z.number().min(0, { message: "Số lượng cao học không được âm" }).optional(),
                    students: z.number().min(0, { message: "Số lượng sinh viên không được âm" }).optional(),
                })
                .optional(),
            commercial: z
                .object({
                    details: z.string().optional(),
                })
                .optional(),
        }).optional(),
        practicalApplications: z.string().min(10, { message: "Ứng dụng thực tiễn phải có ít nhất 10 ký tự" }),
        attachedDocuments: z
            .array(
                z.object({
                    file: z.instanceof(File),
                    description: z.string(),
                })
            )
            .optional(),
        expectedRisks: z.string().optional(),
        registrationPeriod: z.string().optional(),
        startDate: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
        durationInMonths: z.number().min(1, { message: "Thời gian thực hiện phải lớn hơn 0" }),
        endYear: z.number().min(2023, { message: "Năm kết thúc không hợp lệ" }),
        totalBudget: z.number().min(0, { message: "Tổng kinh phí không được âm" }),
        remainingBudget: z.number().min(0, { message: "Kinh phí còn lại không được âm" }).optional(),
        fundingSource: z.string().min(1, { message: "Vui lòng chọn nguồn kinh phí" }),
        budgetBreakdown: z
            .array(
                z.object({
                    category: z.string().min(1, { message: "Hạng mục không được để trống" }),
                    amount: z.number().min(0, { message: "Số tiền không được âm" }),
                    description: z.string().optional(),
                })
            )
            .min(1, { message: "Cần ít nhất một hạng mục kinh phí" }),
        status: z.enum(["DRAFT", "PENDING"], { required_error: "Vui lòng chọn trạng thái" }),
        commitment: z.boolean().optional(),
        additionalNotes: z.string().optional(),
    })
    .refine(
        (data) => {
            const startYear = new Date(data.startDate).getFullYear();
            return data.endYear >= startYear;
        },
        {
            message: "Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu",
            path: ["endYear"],
        }
    )
    .refine(
        (data) => {
            const breakdownTotal = data.budgetBreakdown.reduce((sum, item) => sum + (item.amount || 0), 0);
            return breakdownTotal <= data.totalBudget;
        },
        {
            message: "Tổng chi tiết chi phí phải nhỏ hơn hoặc bằng tổng kinh phí",
            path: ["budgetBreakdown"],
        }
    );

type TopicFormValues = z.infer<typeof topicFormSchema>

const steps = [
    { id: 1, title: "Thông tin chung" },
    { id: 2, title: "Kết quả nghiên cứu (dự kiến)" },
    { id: 3, title: "Thời gian & kinh phí" },
    { id: 4, title: "Biểu mẫu đính kèm" },
    { id: 5, title: "Xác nhận & hoàn tất" },
]

const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY || "my-secure-16-byte-key-1234567890"

const saveDraftToLocalStorage = (data: TopicFormValues) => {
    try {
        const serializedData = {
            ...data,
            startDate: data.startDate ? data.startDate.toISOString() : null,
        }
        const dataString = JSON.stringify(serializedData)

        // Tạo IV ngẫu nhiên
        const iv = CryptoJS.lib.WordArray.random(16)
        const encrypted = CryptoJS.AES.encrypt(dataString, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        })

        // Lưu ciphertext và IV
        const draft = {
            ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
            iv: iv.toString(CryptoJS.enc.Base64),
        }
        localStorage.setItem("topicProposalDraft", JSON.stringify(draft))
        return true
    } catch (error) {
        console.error("Lỗi khi lưu bản nháp:", error)
        return false
    }
}

const getDraftFromLocalStorage = (): TopicFormValues | null => {
    try {
        const draft = localStorage.getItem("topicProposalDraft")
        if (!draft) return null

        let parsedDraft
        try {
            parsedDraft = JSON.parse(draft)
        } catch (e) {
            console.error("Dữ liệu bản nháp không phải JSON hợp lệ:", e)
            localStorage.removeItem("topicProposalDraft")
            return null
        }

        if (!parsedDraft || typeof parsedDraft !== "object" || !parsedDraft.ciphertext || !parsedDraft.iv) {
            console.error("Dữ liệu bản nháp không đúng định dạng:", parsedDraft)
            localStorage.removeItem("topicProposalDraft")
            return null
        }

        if (typeof parsedDraft.ciphertext !== "string" || typeof parsedDraft.iv !== "string") {
            console.error("Ciphertext hoặc IV không phải chuỗi hợp lệ:", parsedDraft)
            localStorage.removeItem("topicProposalDraft")
            return null
        }

        let ciphertext, iv;
        try {
            ciphertext = CryptoJS.enc.Base64.parse(parsedDraft.ciphertext)
            iv = CryptoJS.enc.Base64.parse(parsedDraft.iv)
        } catch (e) {
            console.error("Lỗi khi parse base64:", e)
            localStorage.removeItem("topicProposalDraft")
            return null
        }

        const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        })

        const decryptedData = decrypted.toString(CryptoJS.enc.Utf8)
        if (!decryptedData) {
            console.error("Giải mã thất bại: Dữ liệu trống hoặc khóa không đúng")
            localStorage.removeItem("topicProposalDraft")
            return null
        }

        let parsed
        try {
            parsed = JSON.parse(decryptedData)
        } catch (e) {
            console.error("Dữ liệu giải mã không phải JSON hợp lệ:", e)
            localStorage.removeItem("topicProposalDraft")
            return null
        }

        // Kiểm tra và chuyển đổi expectedProducts nếu cần
        if (parsed.expectedProducts && Array.isArray(parsed.expectedProducts)) {
            const convertedProducts = {
                scientific: { domestic: 0, international: 0 },
                training: { masters: 0, students: 0 },
                commercial: { details: "" },
            };

            parsed.expectedProducts.forEach((product) => {
                if (product.type === "scientific") {
                    convertedProducts.scientific.domestic = product.domestic || 0;
                    convertedProducts.scientific.international = product.international || 0;
                } else if (product.type === "training") {
                    convertedProducts.training.masters = product.masters || 0;
                    convertedProducts.training.students = product.students || 0;
                } else if (product.type === "commercial") {
                    convertedProducts.commercial.details = product.details || "";
                }
            });

            parsed.expectedProducts = convertedProducts;
        } else if (!parsed.expectedProducts) {
            // Nếu expectedProducts không tồn tại, đặt về giá trị mặc định
            parsed.expectedProducts = {
                scientific: { domestic: 0, international: 0 },
                training: { masters: 0, students: 0 },
                commercial: { details: "" },
            };
        }

        if (parsed.startDate) {
            parsed.startDate = new Date(parsed.startDate)
        }

        return parsed
    } catch (error) {
        console.error("Lỗi khi khôi phục bản nháp:", error)
        localStorage.removeItem("topicProposalDraft")
        return null
    }
}

const clearDraftFromLocalStorage = () => {
    localStorage.removeItem("topicProposalDraft")
}

export default function TopicProposal() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSaveDraftConfirm, setShowSaveDraftConfirm] = useState(false)
    const [showRegistrationConfirm, setShowRegistrationConfirm] = useState(false)
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const [exitAction, setExitAction] = useState<(() => void) | null>(null)
    const [isReloading, setIsReloading] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [hasSavedDraft, setHasSavedDraft] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const [researchTypes, setResearchTypes] = useState<ResearchType[]>([])
    const [researchFields, setResearchFields] = useState<ResearchField[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [periods, setPeriods] = useState<RegistrationPeriod[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const navigate = useNavigate();

    const stepFieldsToValidate: Path<TopicFormValues>[][] = [
        // Step 1: Thông tin chung
        [
            "vietnameseName",
            "englishName",
            "topicCode",
            "principalInvestigator",
            "objectives",
            "mainContent",
            "urgency",
            "keywords",
            "department",
            "category",
            "period",
            "field",
            "researchType",
        ],
        // Step 2: Kết quả nghiên cứu (dự kiến)
        ["transferForm", "expectedProducts", "expectedRisks", "practicalApplications"],
        // Step 3: Thời gian & kinh phí
        ["startDate", "durationInMonths", "endYear", "fundingSource", "budgetBreakdown"],
        // Step 4: Biểu mẫu đính kèm
        ["attachedDocuments"],
        // Step 5: Xác nhận & hoàn tất
        ["commitment"],
    ];

    const form = useForm<TopicFormValues>({
        resolver: zodResolver(topicFormSchema),
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
                scientific: {
                    domestic: 0,
                    international: 0,
                },
                training: {
                    masters: 0,
                    students: 0,
                },
                commercial: {
                    details: "",
                },
            },
            practicalApplications: "",
            attachedDocuments: [{
                file: undefined,
                description: "",
            }],
            expectedRisks: "",
            registrationPeriod: "",
            startDate: new Date(),
            durationInMonths: 12,
            endYear: new Date().getFullYear() + 1,
            totalBudget: 0,
            remainingBudget: 0,
            fundingSource: "",
            budgetBreakdown: [{
                category: "",
                amount: 0,
                description: "",
            }],
            status: "DRAFT",
            commitment: false,
            additionalNotes: "",
        },
        mode: "onChange",
    })

    useEffect(() => {
        const draft = getDraftFromLocalStorage()
        if (draft) {
            form.reset(draft)
            setHasUnsavedChanges(false)
        }
    }, [form])

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                const [departmentResponse, researchTypeResponse, researchFieldResponse, categoriesResponse, periodResponse] = await Promise.all([
                    DepartmentService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
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
                        year: new Date().getFullYear(),
                    })
                ]);

                setDepartments(departmentResponse.data.data);
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
                setDepartments([]);
                setResearchTypes([]);
                setResearchFields([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handleSaveDraft = async () => {
        setIsSubmitting(true)
        const formData = {
            ...form.getValues(),
            status: "DRAFT" as "DRAFT" | "PENDING",
        }
        const success = saveDraftToLocalStorage(formData)
        if (success) {
            toast({
                title: "Lưu bản nháp thành công",
                description: "Bạn có thể tiếp tục chỉnh sửa bản nháp sau.",
                variant: "success",
            })
            form.reset(formData, { keepValues: true })
            setHasUnsavedChanges(false)
        } else {
            toast({
                title: "Lỗi khi lưu bản nháp",
                description: "Vui lòng thử lại sau.",
                variant: "error",
            })
        }
        setIsSubmitting(false)
        setShowSaveDraftConfirm(false)
        setHasSavedDraft(true)
    }

    const handlePrevious = () => {
        if (currentStep > 1 && hasUnsavedChanges) {
            setExitAction(() => () => {
                setCurrentStep((prev) => prev - 1)
                window.scrollTo(0, 0)
            })
            setShowExitConfirm(true)
        } else if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1)
            window.scrollTo(0, 0)
        }
    }

    const handleBack = () => {
        if (!hasSavedDraft) {
            setShowExitConfirm(true)
        } else {
            navigate(-1)
        }
    }

    const goToStep = (step: number) => {
        setCurrentStep(step)
        window.scrollTo(0, 0)
    }

    const formValues = form.watch()
    const handleNext = async () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const onSubmit = async (data: TopicFormValues) => {
        try {
            setIsSubmitting(true)
            const formData = new FormData();

            console.log("Dữ liệu trước khi gửi:", data)

            const topicData = {
                vietnameseName: data.vietnameseName,
                englishName: data.englishName,
                topicCode: data.topicCode,
                principalInvestigator: data.principalInvestigator,
                objectives: data.objectives,
                mainContent: data.mainContent,
                urgency: data.urgency,
                keywords: data.keywords,
                department: data.department,
                category: data.category,
                registrationPeriod: data.period,
                field: data.field,
                researchType: data.researchType,
                transferForm: data.transferForm,
                expectedProducts: data.expectedProducts,
                practicalApplications: data.practicalApplications,
                expectedRisks: data.expectedRisks,
                startDate: data.startDate.toISOString(),
                durationInMonths: data.durationInMonths,
                endYear: data.endYear,
                totalBudget: data.totalBudget,
                remainingBudget: data.remainingBudget,
                fundingSource: data.fundingSource,
                budgetBreakdown: data.budgetBreakdown,
                status: data.status,
                commitment: data.commitment,
                additionalNotes: data.additionalNotes,
            };

            console.log("Dữ liệu sau khi xử lý:", topicData)

            const jsonBlob = new Blob([JSON.stringify(topicData)], {
                type: "application/json",
            })
            formData.append("data", jsonBlob, "topicData.json");

            if (data.attachedDocuments && data.attachedDocuments.length > 0) {
                const descriptions = data.attachedDocuments.map((doc) => doc.description);
                const descriptionsBlob = new Blob([JSON.stringify(descriptions)], {
                    type: "application/json",
                });
                formData.append("descriptions", descriptionsBlob, "descriptions.json");

                data.attachedDocuments.forEach((doc) => {
                    formData.append("files", doc.file);
                });
            }

            const response = await TopicService.create(formData);

            if (response.data.code === 1000 && response.data.status === 201) {
                toast({
                    title: "Đăng ký thành công",
                    description: "Đề tài đã được gửi đi thành công.",
                    variant: "success",
                });

                clearDraftFromLocalStorage();
            } else {
                toast({
                    title: "Đăng ký thất bại",
                    description: "Có lỗi xảy ra khi gửi đề tài. Vui lòng thử lại.",
                    variant: "error",
                });
            }

        } catch (error) {
            console.error("Lỗi khi gửi dữ liệu:", error);
            toast({
                title: "Lỗi khi gửi dữ liệu",
                description: "Vui lòng thử lại sau.",
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
            setHasUnsavedChanges(false);
            setShowExitConfirm(false);
            setShowRegistrationConfirm(false);
            navigate("/my-topics");
        }
    }

    const handleExitWithSave = async () => {
        await handleSaveDraft()
        setShowExitConfirm(false)
        navigate(-1)
    }

    const handleExitWithoutSave = () => {
        setShowExitConfirm(false)
        setHasUnsavedChanges(false)
        navigate(-1)
    }

    if (isSubmitting || isLoading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="flex flex-col">
            <Card className="shadow-sm">
                <CardHeader className="sticky top-16 bg-white z-10 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Đăng ký đề tài nghiên cứu khoa học</CardTitle>
                            <CardDescription>Vui lòng điền đầy đủ thông tin để đăng ký đề tài nghiên cứu khoa học</CardDescription>
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

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="pt-4">
                            {currentStep === 1 &&
                                <GeneralInformationStep
                                    form={form}
                                    departmentOptions={departments}
                                    researchTypeOptions={researchTypes}
                                    researchFieldOptions={researchFields}
                                    categoriesOptions={categories}
                                    periodsOptions={periods}
                                    isLoadingOptions={isLoading}
                                />}
                            {currentStep === 2 && <SpecializationStep form={form} />}
                            {currentStep === 3 && <TimeAndBudgetStep form={form} />}
                            {currentStep === 4 && <AttachedDocuments form={form} />}
                            {currentStep === 5 &&
                                <ReviewStep
                                    formValues={formValues}
                                    researchFields={researchFields}
                                />}
                        </CardContent>

                        <Separator />

                        <CardFooter className="flex justify-between pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1 || isSubmitting}
                            >
                                <ArrowLeft className="h-4 w-4" /> Quay lại
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowSaveDraftConfirm(true)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && form.getValues("status") === "DRAFT" && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Save className="h-4 w-4" /> Lưu nháp
                                </Button>

                                {currentStep === steps.length ? (
                                    <Button
                                        type="button"
                                        onClick={() => { setShowRegistrationConfirm(true) }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && form.getValues("status") === "PENDING" && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        <ClipboardCheck className="h-4 w-4" /> Đăng ký
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNext}>
                                        <ArrowRight className="h-4 w-4" /> Tiếp theo
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            {/* Confirm Dialog cho Lưu nháp */}
            <AlertDialog open={showSaveDraftConfirm} onOpenChange={setShowSaveDraftConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Lưu bản nháp</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn lưu bản nháp đề tài này? Dữ liệu hiện tại sẽ được mã hóa và lưu trữ.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting} className="text-rose-500"><X className="h-4 w-4" /> Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleSaveDraft()
                            }}
                            disabled={isSubmitting}
                            className="bg-primary"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {!isSubmitting && <Save className="h-4 w-4" />}
                            {isSubmitting ? "Đang lưu..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isReloading ? "Reload trang" : "Thoát chỉnh sửa"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isReloading
                                ? "Bạn có muốn lưu bản nháp trước khi reload trang? Nếu không lưu, các thay đổi hiện tại sẽ bị mất."
                                : "Bạn có muốn lưu bản nháp trước khi thoát? Nếu không lưu, các thay đổi hiện tại sẽ bị mất."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowExitConfirm(false)} disabled={isSubmitting}>
                            <X className="h-4 w-4" />
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogCancel
                            className="text-rose-500"
                            onClick={handleExitWithoutSave}
                            disabled={isSubmitting}
                        >
                            {isReloading ? (
                                <>
                                    <RotateCcw className="h-4 w-4" />
                                    Reload không lưu
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Thoát không lưu
                                </>
                            )}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleExitWithSave();
                            }}
                            disabled={isSubmitting}
                            className="bg-primary"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSubmitting ? "Đang lưu..." : isReloading ? "Lưu và reload" : "Lưu và thoát"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Dialog cho Đăng ký */}
            <AlertDialog open={showRegistrationConfirm} onOpenChange={setShowRegistrationConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Gửi đơn đăng ký đề tài</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn Gửi đơn đăng ký đề tài?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting} className="text-rose-500"><X className="h-4 w-4" /> Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    form.setValue("status", "DRAFT", { shouldValidate: true });

                                    await form.handleSubmit(async (data) => {
                                        await onSubmit(data);
                                    }, (errors) => {
                                        console.error("Validation errors:", errors);
                                        toast({
                                            title: "Thông tin chưa hoàn thiện",
                                            description: "Vui lòng nhập đầy đủ các trường bắt buộc (có dấu * đỏ).",
                                            variant: "error",
                                        })
                                    })();
                                } catch (error) {
                                    toast({
                                        title: "Lỗi",
                                        description: "Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại.",
                                        variant: "error",
                                    })
                                }
                            }}
                            disabled={isSubmitting}
                            className="bg-primary"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {!isSubmitting && <Save className="h-4 w-4" />}
                            {isSubmitting ? "Đang gửi..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}