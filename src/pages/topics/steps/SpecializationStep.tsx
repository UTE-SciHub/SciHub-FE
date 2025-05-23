import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormRichTextEditor } from "@/components/editor/text-editor";
import { useState, useEffect } from "react";
import { MultiSelect } from "@/components/multiple-select/multiple-select";
import { Checkbox } from "@/components/ui/checkbox";

interface SpecializationStepProps {
    form: any;
    readOnly?: boolean;
}

export default function SpecializationStep({
    form,
    readOnly = false
}: SpecializationStepProps) {
    const [selectedTransferForm, setSelectedTransferForm] = useState([]);
    const [productTypes, setProductTypes] = useState({
        scientific: false,
        training: false,
        commercial: false,
    });

    const transferFormOptions = [
        { value: "Chuyển giao nghiên cứu", label: "Chuyển giao nghiên cứu" },
        { value: "Chuyển giao sản phẩm", label: "Chuyển giao sản phẩm" },
        { value: "Chuyển giao công nghệ", label: "Chuyển giao công nghệ" },
        { value: "Khác", label: "Khác" },
    ];

    useEffect(() => {
        const expectedProducts = form.getValues("expectedProducts") || {};

        setProductTypes({
            scientific:
                (expectedProducts.scientific?.domestic > 0 || expectedProducts.scientific?.international > 0) || false,
            training:
                (expectedProducts.training?.masters > 0 || expectedProducts.training?.students > 0) || false,
            commercial: !!expectedProducts.commercial?.details || false,
        });
    }, [form]);

    const handleProductTypeChange = (type: string, checked: boolean) => {
        if (readOnly) return; // Prevent changes in readOnly mode
        setProductTypes((prev) => ({
            ...prev,
            [type]: checked,
        }));
    };

    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Kết quả nghiên cứu dự kiến</div>

            {/* Transfer Form */}
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
                                disabled={readOnly}
                            />
                        </FormControl>
                        <FormDescription>Mô tả hình thức chuyển giao kết quả nghiên cứu (nếu có)</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Expected Risks */}
            <FormField
                control={form.control}
                name="expectedRisks"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Kết quả dự kiến <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                            <FormRichTextEditor
                                label="Nhập rủi ro dự kiến"
                                field={field}
                                placeholder="Mô tả các kết quả dự kiến của nghiên cứu"
                                height="400px"
                                maxLength={5000}
                                fieldState={fieldState}
                                readOnly={readOnly}
                            />
                        </FormControl>
                        <FormDescription>Mô tả các kết quả dự kiến của nghiên cứu</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Expected Products */}
            <div>
                <FormLabel>
                    Sản phẩm dự kiến <span className="text-destructive">*</span>
                </FormLabel>
                <div className="space-y-4 mt-2">
                    {/* Scientific Products */}
                    <div className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                                id="scientific"
                                checked={productTypes.scientific}
                                onCheckedChange={(checked) => handleProductTypeChange("scientific", !!checked)}
                                disabled={readOnly}
                            />
                            <FormLabel htmlFor="scientific" className="font-medium">
                                Sản phẩm khoa học
                            </FormLabel>
                        </div>
                        {productTypes.scientific && (
                            <div className="space-y-4 ml-6">
                                <FormField
                                    control={form.control}
                                    name="expectedProducts.scientific.domestic"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số bài báo khoa học đăng trên tạp chí trong nước</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Nhập số lượng"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    disabled={readOnly}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="expectedProducts.scientific.international"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số bài báo khoa học đăng trên tạp chí quốc tế</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Nhập số lượng"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    disabled={readOnly}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Training Products */}
                    <div className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                                id="training"
                                checked={productTypes.training}
                                onCheckedChange={(checked) => handleProductTypeChange("training", !!checked)}
                                disabled={readOnly}
                            />
                            <FormLabel htmlFor="training" className="font-medium">
                                Sản phẩm đào tạo
                            </FormLabel>
                        </div>
                        {productTypes.training && (
                            <div className="space-y-4 ml-6">
                                <FormField
                                    control={form.control}
                                    name="expectedProducts.training.masters"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số lượng cao học</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Nhập số lượng"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    disabled={readOnly}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="expectedProducts.training.students"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số lượng sinh viên tham gia</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Nhập số lượng"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    disabled={readOnly}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Commercial Products */}
                    <div className="border rounded-md p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                                id="commercial"
                                checked={productTypes.commercial}
                                onCheckedChange={(checked) => handleProductTypeChange("commercial", !!checked)}
                                disabled={readOnly}
                            />
                            <FormLabel htmlFor="commercial" className="font-medium">
                                Sản phẩm ứng dụng
                            </FormLabel>
                        </div>
                        {productTypes.commercial && (
                            <div className="space-y-4 ml-6">
                                <FormField
                                    control={form.control}
                                    name="expectedProducts.commercial.details"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>Thông tin sản phẩm ứng dụng</FormLabel>
                                            <FormControl>
                                                <FormRichTextEditor
                                                    label="Nhập thông tin sản phẩm ứng dụng"
                                                    field={field}
                                                    placeholder="Mô tả sản phẩm dự kiến, phạm vi, khả năng và địa chỉ ứng dụng..."
                                                    height="400px"
                                                    maxLength={5000}
                                                    fieldState={fieldState}
                                                    readOnly={readOnly}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Mô tả sản phẩm dự kiến, phạm vi, khả năng và địa chỉ ứng dụng.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <FormDescription>Lựa chọn và nhập thông tin chi tiết về các sản phẩm dự kiến</FormDescription>
            </div>

            {/* Practical Applications */}
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
                                readOnly={readOnly}
                            />
                        </FormControl>
                        <FormDescription>Mô tả ứng dụng của kết quả nghiên cứu vào thực tiễn</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}