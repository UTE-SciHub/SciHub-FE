import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DynamicTable, { TableColumn } from "@/components/data-table/dynamic-row-table"

const columns: TableColumn[] = [
    {
        id: "productName",
        header: "Tên sản phẩm",
        type: "text",
        width: "400px",
    },
    {
        id: "criteria",
        header: "Chỉ tiêu đánh giá (định lượng)",
        type: "text",
        width: "400px",
    },
    {
        id: "description",
        header: "Ghi chú",
        type: "text",
    },
]

export default function SpecializationStep({ form }) {
    return (
        <div className="space-y-6">
            <div className="text-2xl font-semibold text-center">Kết quả nghiên cứu (dự kiến)</div>

            <FormField
                control={form.control}
                name="hinhThucChuyenGiao"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hình thức chuyển giao</FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập hình thức chuyển giao" {...field} />
                        </FormControl>
                        <FormDescription>Mô tả hình thức chuyển giao kết quả nghiên cứu (nếu có)</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="sanPhamDuKien"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Sản phẩm dự kiến <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <DynamicTable
                                columns={columns}
                            />
                        </FormControl>
                        <FormDescription>Liệt kê các sản phẩm dự kiến sẽ đạt được sau khi hoàn thành đề tài</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            </div>
        </div>
    )
}
