import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import DynamicTable, { TableColumn } from "@/components/data-table/dynamic-row-table";
import { formatVND } from "@/utils/common";

const budgetColumns: TableColumn[] = [
    { id: "category", header: "Hạng mục", type: "text", width: "250px", required: true },
    { id: "amount", header: "Số tiền (VND)", type: "number", width: "250px", required: true, min: 0 },
    { id: "description", header: "Ghi chú", type: "text" },
];

interface TimeAndBudgetStepProps {
    form: any;
    readOnly?: boolean;
}

export default function TimeAndBudgetStep({
    form,
    readOnly = false
}: TimeAndBudgetStepProps) {
    const fundingSourceOptions = [
        { value: "GOVERNMENT", label: "Nhà nước" },
        { value: "ENTERPRISE", label: "Doanh nghiệp" },
        { value: "SELF_FUNDED", label: "Tự túc" },
        { value: "OTHER", label: "Khác" },
    ];

    const [breakdownTotal, setBreakdownTotal] = useState(0);

    useEffect(() => {
        const budgetBreakdown = form.getValues("budgetBreakdown") || [];
        const total = budgetBreakdown.reduce((sum, item) => sum + (item.amount || 0), 0);
        setBreakdownTotal(total);
    }, [form.watch("budgetBreakdown")]);

    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Thời gian & Kinh phí</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Start Date */}
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                            <FormLabel className="flex items-center gap-1">
                                Ngày bắt đầu <span className="text-destructive">*</span>
                            </FormLabel>
                            <Popover>
                                <PopoverTrigger asChild disabled={readOnly}>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn("w-full pl-3 text-left font-normal h-10", !field.value && "text-muted-foreground")}
                                            disabled={readOnly}
                                        >
                                            {field.value ? format(field.value, "dd/MM/yyyy", { locale: enUS }) : <span>Chọn ngày</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            const duration = form.getValues("durationInMonths");
                                            if (date && duration) {
                                                const endYear = new Date(date).getFullYear() + Math.floor(duration / 12);
                                                form.setValue("endYear", endYear);
                                            }
                                        }}
                                        initialFocus
                                        disabled={readOnly}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>Ngày bắt đầu chính thức của đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Duration */}
                <FormField
                    control={form.control}
                    name="durationInMonths"
                    render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                            <FormLabel className="flex items-center gap-1">
                                Thời gian (tháng) <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="Nhập số tháng"
                                    className="h-10"
                                    {...field}
                                    onChange={(e) => {
                                        const value = Number.parseInt(e.target.value) || 0;
                                        field.onChange(value);
                                        const startDate = form.getValues("startDate");
                                        if (startDate) {
                                            const endYear = new Date(startDate).getFullYear() + Math.floor(value / 12);
                                            form.setValue("endYear", endYear);
                                        }
                                    }}
                                    disabled={readOnly}
                                />
                            </FormControl>
                            <FormDescription>Thời gian thực hiện đề tài (đơn vị: tháng)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* End Year */}
                <FormField
                    control={form.control}
                    name="endYear"
                    render={({ field }) => (
                        <FormItem className="flex flex-col space-y-2">
                            <FormLabel className="flex items-center gap-1">
                                Năm kết thúc <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={2023}
                                    placeholder="Nhập năm kết thúc"
                                    className="h-10"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                    disabled={readOnly}
                                />
                            </FormControl>
                            <FormDescription>Năm dự kiến kết thúc đề tài</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Thông tin kinh phí</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Budget */}
                    <FormField
                        control={form.control}
                        name="totalBudget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Tổng kinh phí dự kiến (VND) <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Nhập tổng kinh phí"
                                        value={formatVND(field.value)}
                                        onChange={(e) => {
                                            const rawValue = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                                            field.onChange(rawValue);

                                            form.trigger("budgetBreakdown");
                                            form.trigger("approvedBudget");
                                        }}
                                        onBlur={(e) => {
                                            const rawValue = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                                            field.onChange(rawValue);
                                            e.target.value = formatVND(rawValue);
                                        }}
                                        disabled={readOnly}
                                    />
                                </FormControl>
                                <FormDescription>Tổng kinh phí dự kiến thực hiện đề tài</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Funding Source */}
                    <FormField
                        control={form.control}
                        name="fundingSource"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nguồn kinh phí <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={readOnly}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nguồn kinh phí" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {fundingSourceOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Nguồn tài trợ cho đề tài</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Budget Breakdown */}
                <FormField
                    control={form.control}
                    name="budgetBreakdown"
                    render={({ field }) => (
                        <FormItem className="mt-6">
                            <FormLabel>
                                Chi tiết kinh phí <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <DynamicTable
                                    columns={budgetColumns}
                                    value={field.value || []}
                                    onChange={(newValue) => {
                                        field.onChange(newValue);
                                        form.trigger("budgetBreakdown");
                                    }}
                                    control={form.control}
                                    name="budgetBreakdown"
                                    readOnly={readOnly}
                                />
                            </FormControl>
                            <FormDescription>
                                Liệt kê chi tiết các hạng mục kinh phí. Tổng chi tiết chi phí: {formatVND(breakdownTotal)} (phải nhỏ hơn hoặc bằng tổng kinh phí: {formatVND(form.getValues("totalBudget"))})
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}