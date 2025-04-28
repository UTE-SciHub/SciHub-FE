import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { InfoIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatFileSize } from "@/utils/common"

const getFieldLabel = (value) => {
    const options = {
        IT: "Công nghệ Thông tin",
        TELECOM: "Viễn thông",
        NATURAL: "Khoa học Tự nhiên",
        SOCIAL: "Khoa học Xã hội",
    }
    return options[value] || value
}

const getResearchTypeLabel = (value) => {
    const options = {
        BASIC: "Nghiên cứu cơ bản",
        APPLIED: "Nghiên cứu ứng dụng",
        TECH_DEV: "Phát triển công nghệ",
        MAINTENANCE: "Bảo trì và sửa chữa",
    }
    return options[value] || value
}

const getDepartmentLabel = (value) => {
    const options = {
        IT: "Khoa Công nghệ Thông tin",
        EE: "Khoa Điện và Điện tử",
        ME: "Khoa Cơ khí",
        CE: "Khoa Xây dựng",
    }
    return options[value] || value
}

const getCouncilLabel = (value) => {
    const options = {
        IT_COUNCIL: "Hội đồng Công nghệ Thông tin",
        EE_COUNCIL: "Hội đồng Điện và Điện tử",
        ME_COUNCIL: "Hội đồng Cơ khí",
    }
    return options[value] || value
}

const getRegistrationPeriodLabel = (value) => {
    const options = {
        "2025_1": "Đợt đăng ký 1 - 2025",
        "2025_2": "Đợt đăng ký 2 - 2025",
        "2026_1": "Đợt đăng ký 1 - 2026",
    }
    return options[value] || value
}

const getFundingSourceLabel = (value) => {
    const options = {
        GOVERNMENT: "Nhà nước",
        ENTERPRISE: "Doanh nghiệp",
        SELF_FUNDED: "Tự túc",
        OTHER: "Khác",
    }
    return options[value] || value
}

export default function ReviewStep({ form, formValues }) {
    return (
        <div className="space-y-8">
            <div className="text-2xl font-semibold text-center">Xác nhận và hoàn tất</div>

            <Alert className="z-5">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Xác nhận thông tin</AlertTitle>
                <AlertDescription>
                    Vui lòng kiểm tra kỹ thông tin đề tài trước khi nộp. Sau khi nộp, bạn không thể chỉnh sửa thông tin cho đến khi được phê duyệt.
                </AlertDescription>
            </Alert>

            <div className="space-y-8">
                {/* Phần 1: Thông tin chung */}
                <div className="border rounded-md p-6 bg-muted/50">
                    <h3 className="font-medium text-lg mb-4">1. Thông tin chung</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Mã số đề tài</h4>
                            <p className="font-medium">{formValues.topicCode || "Chưa nhập"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Tên tiếng Việt</h4>
                            <p className="font-medium">{formValues.vietnameseName || "Chưa nhập"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Tên tiếng Anh</h4>
                            <p className="font-medium">{formValues.englishName || "Chưa nhập"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Đơn vị chủ trì</h4>
                            <p className="font-medium">{formValues.leadOrganization || "Chưa nhập"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Chủ nhiệm đề tài</h4>
                            <p className="font-medium">{formValues.principalInvestigator || "Chưa nhập"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Từ khóa</h4>
                            <p className="font-medium">{formValues.keywords?.join(", ") || "Chưa nhập"}</p>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Mục tiêu</h4>
                            <ScrollArea className="h-24 w-full rounded-md border p-4">
                                <p className="whitespace-pre-line">{formValues.objectives || "Chưa nhập"}</p>
                            </ScrollArea>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Nội dung chính</h4>
                            <ScrollArea className="h-24 w-full rounded-md border p-4">
                                <p className="whitespace-pre-line">{formValues.mainContent || "Chưa nhập"}</p>
                            </ScrollArea>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Tính mới</h4>
                            <ScrollArea className="h-24 w-full rounded-md border p-4">
                                <p className="whitespace-pre-line">{formValues.novelty || "Chưa nhập"}</p>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                {/* Phần 2: Kết quả nghiên cứu dự kiến */}
                <div className="border rounded-md p-6 bg-muted/50">
                    <h3 className="font-medium text-lg mb-4">2. Kết quả nghiên cứu dự kiến</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Hình thức chuyển giao</h4>
                            <p className="font-medium">{formValues.transferForm || "Không có"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ứng dụng thực tiễn</h4>
                            <ScrollArea className="h-24 w-full rounded-md border p-4">
                                <p className="whitespace-pre-line">{formValues.practicalApplications || "Chưa nhập"}</p>
                            </ScrollArea>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Rủi ro dự kiến</h4>
                            <ScrollArea className="h-24 w-full rounded-md border p-4">
                                <p className="whitespace-pre-line">{formValues.expectedRisks}</p>
                            </ScrollArea>

                            {formValues.expectedRisks?.trim() ? (
                                <ScrollArea className="h-24 w-full rounded-md border p-4">
                                    <p className="whitespace-pre-line">{formValues.expectedRisks}</p>
                                </ScrollArea>
                            ) : (
                                <p className="text-sm text-muted-foreground">Chưa nhập</p>
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Tài liệu đính kèm</h4>
                            {formValues.attachedDocuments && formValues.attachedDocuments.length > 0 ? (
                                <ul className="mt-1 space-y-1">
                                    {formValues.attachedDocuments.map((doc, index) => (
                                        <li key={index} className="font-medium text-sm">
                                            {doc.file.name} ({formatFileSize(doc.file.size)})
                                            {doc.description && (
                                                <span className="text-muted-foreground"> - {doc.description}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="font-medium text-sm">Không có</p>
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Lĩnh vực</h4>
                            <p className="font-medium">{getFieldLabel(formValues.field) || "Chưa chọn"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Loại hình nghiên cứu</h4>
                            <p className="font-medium">{getResearchTypeLabel(formValues.researchType) || "Chưa chọn"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Khoa</h4>
                            <p className="font-medium">{getDepartmentLabel(formValues.department) || "Chưa chọn"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Hội đồng xét duyệt</h4>
                            <p className="font-medium">{getCouncilLabel(formValues.council) || "Chưa chọn"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Đợt đăng ký</h4>
                            <p className="font-medium">{getRegistrationPeriodLabel(formValues.registrationPeriod) || "Chưa chọn"}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Sản phẩm dự kiến</h4>
                        {formValues.expectedProducts?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên sản phẩm dự kiến</TableHead>
                                        <TableHead>Tiêu chí đánh giá (định lượng)</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formValues.expectedProducts.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.criteria}</TableCell>
                                            <TableCell>{item.description || ""}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">Chưa có chi tiết kinh phí</p>
                        )}
                    </div>
                </div>

                {/* Phần 3: Thời gian & Kinh phí */}
                <div className="border rounded-md p-6 bg-muted/50">
                    <h3 className="font-medium text-lg mb-4">3. Thời gian & Kinh phí</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</h4>
                            <p className="font-medium">
                                {formValues.startDate ? format(formValues.startDate, "dd/MM/yyyy", { locale: vi }) : "Chưa chọn"}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Thời gian thực hiện</h4>
                            <p className="font-medium">{formValues.durationInMonths ? `${formValues.durationInMonths} tháng` : "Chưa nhập"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Năm kết thúc</h4>
                            <p className="font-medium">{formValues.endYear || "Chưa nhập"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Nguồn kinh phí</h4>
                            <p className="font-medium">{getFundingSourceLabel(formValues.fundingSource) || "Chưa chọn"}</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <h4 className="font-medium mb-4">Thông tin kinh phí</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Tổng kinh phí</h4>
                                <p className="font-medium">{formValues.totalBudget?.toLocaleString("vi-VN") || 0} VND</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Kinh phí được duyệt</h4>
                                <p className="font-medium">{formValues.approvedBudget?.toLocaleString("vi-VN") || 0} VND</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Kinh phí còn lại</h4>
                                <p className="font-medium">{formValues.remainingBudget?.toLocaleString("vi-VN") || 0} VND</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Chi tiết kinh phí</h4>
                            {formValues.budgetBreakdown?.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hạng mục</TableHead>
                                            <TableHead>Số tiền (VND)</TableHead>
                                            <TableHead>Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formValues.budgetBreakdown.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.amount.toLocaleString("vi-VN")} VND</TableCell>
                                                <TableCell>{item.description || ""}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">Chưa có chi tiết kinh phí</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phần 4: Chi tiết nộp hồ sơ */}
                <div className="border rounded-md p-6 bg-muted/50">
                    <h3 className="font-medium text-lg mb-4">4. Chi tiết nộp hồ sơ</h3>

                    {/* Commitment */}
                    <FormField
                        control={form.control}
                        name="commitment"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel>
                                    Tôi xác nhận rằng thông tin cung cấp là chính xác và cam kết thực hiện đề tài
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Additional Notes */}
                    <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                            <FormItem className="mt-4">
                                <FormLabel>Ghi chú bổ sung</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Nhập ghi chú bổ sung (nếu có)"
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Ghi chú hoặc thông tin bổ sung cho hội đồng xét duyệt</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Status */}
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="space-y-3 mt-4">
                                <FormLabel>Chọn trạng thái đề tài</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="DRAFT" id="draft" />
                                            <label
                                                htmlFor="draft"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Lưu bản nháp - Có thể chỉnh sửa sau
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="PENDING" id="pending" />
                                            <label
                                                htmlFor="pending"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Nộp đề tài - Chờ phê duyệt
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}