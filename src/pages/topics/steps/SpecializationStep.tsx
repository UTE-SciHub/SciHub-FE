import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormRichTextEditor } from "@/components/editor/text-editor"
import { FormFileUploadPreview } from "@/components/file-upload-preview/file-upload-preview"
import DynamicTable, { TableColumn } from "@/components/data-table/dynamic-row-table"
import { useState } from "react"
import { MultiSelect } from "@/components/multiple-select/multiple-select"
import MultiFileUpload from "@/components/multiple-upload-file/multiple-upload-file"

const productColumns: TableColumn[] = [
    {
        id: "productName",
        header: "Tên sản phẩm dự kiến",
        type: "text",
        width: "400px",
        required: true,
        placeholder: "Nhập tên sản phẩm",
    },
    {
        id: "criteria",
        header: "Tiêu chí đánh giá (định lượng)",
        type: "text",
        width: "400px",
        required: true,
        placeholder: "Nhập tiêu chí",
    },
    {
        id: "description",
        header: "Ghi chú",
        type: "text",
        placeholder: "Nhập ghi chú (nếu có)",
    },
];

export default function SpecializationStep({ form }) {
    const [selectedTransferForm, setSelectedTransferForm] = useState([]);

    const councilOptions = [
        { value: "IT_COUNCIL", label: "Hội đồng Công nghệ Thông tin" },
        { value: "EE_COUNCIL", label: "Hội đồng Điện - Điện tử" },
        { value: "ME_COUNCIL", label: "Hội đồng Cơ khí" },
    ]

    const registrationPeriodOptions = [
        { value: "2025_1", label: "Đợt đăng ký 1 - 2025" },
        { value: "2025_2", label: "Đợt đăng ký 2 - 2025" },
        { value: "2026_1", label: "Đợt đăng ký 1 - 2026" },
    ]

    const transferFormOptions = [
        { value: "RESEARCH_TRANSFER", label: "Chuyển giao nghiên cứu" },
        { value: "PRODUCT_TRANSFER", label: "Chuyển giao sản phẩm" },
        { value: "TECHNOLOGY_TRANSFER", label: "Chuyển giao công nghệ" },
        { value: "OTHER", label: "Khác" }
    ]

    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Kết quả nghiên cứu dự kiến</div>

            {/* Hình thức chuyển giao */}
            <FormField
                control={form.control}
                name="transferForm"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hình thức chuyển giao</FormLabel>
                        <FormControl>
                            <MultiSelect
                                options={transferFormOptions}
                                selected={field.value || []}
                                onChange={(values) => field.onChange(values)}
                                placeholder="Chọn hình thức chuyển giao..."
                                searchPlaceholder="Tìm kiếm..."
                            />
                        </FormControl>
                        <FormDescription>Mô tả hình thức chuyển giao kết quả nghiên cứu (nếu có)</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Sản phẩm dự kiến */}
            <FormField
                control={form.control}
                name="expectedProducts"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Sản phẩm dự kiến <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <DynamicTable
                                columns={productColumns}
                                value={field.value || []}
                                onChange={(newValue) => {
                                    field.onChange(newValue);
                                    form.trigger("expectedProducts");
                                }}
                            />
                        </FormControl>
                        <FormDescription>Liệt kê các sản phẩm dự kiến sau khi hoàn thành đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Ứng dụng thực tiễn */}
            <FormField
                control={form.control}
                name="practicalApplications"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>
                            Ứng dụng thực tiễn <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <FormRichTextEditor
                                label="Nhập nội dung ứng dụng thực tiễn"
                                field={field}
                                placeholder="Mô tả ứng dụng của kết quả nghiên cứu"
                                height="400px"
                                maxLength={5000}
                                fieldState={fieldState}
                            />
                        </FormControl>
                        <FormDescription>Mô tả ứng dụng của kết quả nghiên cứu vào thực tiễn</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Rủi ro dự kiến */}
            <FormField
                control={form.control}
                name="expectedRisks"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Rủi ro dự kiến</FormLabel>
                        <FormControl>
                            <FormRichTextEditor
                                label="Nhập rủi ro dự kiến"
                                field={field}
                                placeholder="Mô tả các rủi ro có thể xảy ra và cách xử lý"
                                height="400px"
                                maxLength={5000}
                                fieldState={fieldState}
                            />
                        </FormControl>
                        <FormDescription>Liệt kê các rủi ro có thể xảy ra và biện pháp khắc phục</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Tài liệu đính kèm */}
            <FormField
                control={form.control}
                name="attachedDocuments"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tài liệu đính kèm</FormLabel>
                        <FormControl>
                            <MultiFileUpload
                                form={form}
                                field={field}
                                accept=".pdf,.docx"
                                maxSize={10}
                                label="Tài liệu đính kèm"
                                placeholder="Chọn file"
                                description="Tải lên tài liệu bổ sung (PDF, Word - tối đa 10MB)"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )

}
