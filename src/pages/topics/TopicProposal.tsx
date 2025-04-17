import StepNavigation from "@/components/step/StepNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GeneralInformationStep from "@/pages/topics/steps/GeneralInformationStep";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ClipboardCheck, CornerUpLeft, Loader2, Save, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form"
import SpecializationStep from "@/pages/topics/steps/SpecializationStep";
import TimeAndBudgetStep from "@/pages/topics/steps/TimeAndBudgetStep";
import ReviewStep from "@/pages/topics/steps/ReviewStep";

const topicFormSchema = z.object({
    // Step 1: General Information
    vietNameseName: z.string().min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" }),
    englishName: z.string().min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" }),
    mucTieu: z.string().min(10, { message: "Mục tiêu phải có ít nhất 10 ký tự" }),
    noiDungChinh: z.string().min(20, { message: "Nội dung chính phải có ít nhất 20 ký tự" }),
    sanPhamDuKien: z.string().min(10, { message: "Sản phẩm dự kiến phải có ít nhất 10 ký tự" }),

    // Step 2: Specialization & Organization
    hinhThucChuyenGiao: z.string().optional(),
    maLinhVuc: z.string().min(1, { message: "Vui lòng chọn lĩnh vực" }),
    maLoaiHinhNghienCuu: z.string().min(1, { message: "Vui lòng chọn loại hình nghiên cứu" }),
    maKhoa: z.string().min(1, { message: "Vui lòng chọn khoa" }),
    maHoiDong: z.string().min(1, { message: "Vui lòng chọn hội đồng" }),
    maDotDangKy: z.string().min(1, { message: "Vui lòng chọn đợt đăng ký" }),

    // Step 3: Time & Budget
    ngayBatDau: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    thoiGianThucHien: z.number().min(1, { message: "Thời gian thực hiện phải lớn hơn 0" }),
    namKetThuc: z.number().min(2023, { message: "Năm kết thúc không hợp lệ" }),
    tongKinhPhi: z.number().min(0, { message: "Tổng kinh phí không được âm" }),
    kinhPhiDuocDuyet: z.number().min(0, { message: "Kinh phí được duyệt không được âm" }).optional(),
    kinhPhiConLai: z.number().min(0, { message: "Kinh phí còn lại không được âm" }).optional(),

    // Step 4: Status
    trangThai: z.enum(["DRAFT", "PENDING"], {
        required_error: "Vui lòng chọn trạng thái",
    }),
})

type TopicFormValues = z.infer<typeof topicFormSchema>

const steps = [
    { id: 1, title: "Thông tin chung" },
    { id: 2, title: "Kết quả nghiên cứu (dự kiến)" },
    { id: 3, title: "Thời gian & kinh phí" },
    { id: 4, title: "Xác nhận & hoàn tất" },
]

export default function TopicProposal() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<TopicFormValues>({
        resolver: zodResolver(topicFormSchema),
        defaultValues: {
            vietNameseName: "",
            englishName: "",
            mucTieu: "",
            noiDungChinh: "",
            sanPhamDuKien: "",
            hinhThucChuyenGiao: "",
            maLinhVuc: "",
            maLoaiHinhNghienCuu: "",
            maKhoa: "",
            maHoiDong: "",
            maDotDangKy: "",
            ngayBatDau: new Date(),
            thoiGianThucHien: 12,
            namKetThuc: new Date().getFullYear() + 1,
            tongKinhPhi: 0,
            kinhPhiDuocDuyet: 0,
            kinhPhiConLai: 0,
            trangThai: "DRAFT",
        },
        mode: "onChange",
    })

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            window.scrollTo(0, 0)
        }
    }

    const goToStep = (step: number) => {
        setCurrentStep(step)
        window.scrollTo(0, 0)
    }

    const formValues = form.watch()

    const handleNext = async () => {
        // let fieldsToValidate: string[] = []

        // switch (currentStep) {
        //     case 1:
        //         fieldsToValidate = ["tieuDe", "mucTieu", "noiDungChinh", "sanPhamDuKien"]
        //         break
        //     case 2:
        //         fieldsToValidate = ["maLinhVuc", "maLoaiHinhNghienCuu", "maKhoa", "maHoiDong", "maDotDangKy"]
        //         break
        //     case 3:
        //         fieldsToValidate = ["ngayBatDau", "thoiGianThucHien", "namKetThuc", "tongKinhPhi"]
        //         break
        //     default:
        //         break
        // }

        // const result = await form.trigger(fieldsToValidate as any)
        // if (!result) return

        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
            window.scrollTo(0, 0)
        }
    }

    const onSubmit = async (data: TopicFormValues) => {
        setIsSubmitting(true)
        try {
            console.log("Submitting form data:", data)
            // Call your API or perform any action here
            // await apiCall(data)
            alert("Đề tài đã được gửi thành công!")
        } catch (error) {
            console.error("Error submitting form:", error)
            alert("Đã xảy ra lỗi khi gửi đề tài.")
        } finally {
            setIsSubmitting(false)
        }
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
                            <Button variant="outline" className="text-rose-500" onClick={() => window.history.back()}>
                                <CornerUpLeft className="h-4 w-4" /> Thoát
                            </Button>
                        </div>
                    </div>
                    <StepNavigation steps={steps} currentStep={currentStep} onStepClick={goToStep} />
                </CardHeader>

                <Separator />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="pt-4">
                            {currentStep === 1 && <GeneralInformationStep form={form} />}

                            {currentStep === 2 && <SpecializationStep form={form} />}

                            {currentStep === 3 && <TimeAndBudgetStep form={form} />}

                            {currentStep === 4 && <ReviewStep form={form} formValues={formValues} />}
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
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && form.getValues("trangThai") === "DRAFT" && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <Save className="h-4 w-4" /> Lưu nháp
                                </Button>

                                {currentStep === steps.length ? (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            form.setValue("trangThai", "PENDING")
                                            form.handleSubmit(onSubmit)()
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && form.getValues("trangThai") === "PENDING" && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        <ClipboardCheck className="h-4 w-4" /> Đăng ký
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNext}>
                                        <ArrowRight className="h-4 w-4" />Tiếp theo
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}