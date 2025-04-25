import type React from "react";
import { useRef, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface SelectOption {
    value: string;
    label: string;
}

export interface TableColumn {
    id: string;
    header: string;
    type: "text" | "textarea" | "number" | "select" | "checkbox" | "date";
    width?: string;
    options?: SelectOption[];
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    defaultValue?: any;
    className?: string;
}

export interface TableRow {
    id: string;
    [key: string]: any;
}

interface DynamicTableProps {
    title?: string;
    description?: string;
    columns: TableColumn[];
    value?: TableRow[]; // Thêm prop value để nhận dữ liệu từ form
    onChange?: (data: TableRow[]) => void; // Thêm prop onChange để cập nhật dữ liệu form
    maxRows?: number;
    minRows?: number;
    className?: string;
    rowClassName?: string;
    headerClassName?: string;
    cellClassName?: string;
    addButtonText?: string;
    noDataText?: string;
}

export default function DynamicTable({
    title,
    description,
    columns,
    value = [], // Giá trị từ form, mặc định là mảng rỗng
    onChange, // Hàm cập nhật giá trị form
    maxRows,
    minRows = 0,
    className,
    rowClassName,
    headerClassName,
    cellClassName,
    noDataText = "Chưa có dữ liệu. Nhấn nút '+' để thêm dòng mới.",
}: DynamicTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const firstInputRef = useRef<HTMLElement | null>(null);

    // Đảm bảo đủ số hàng tối thiểu (minRows)
    useEffect(() => {
        if (value.length < minRows) {
            const newRows = [...value];
            for (let i = value.length; i < minRows; i++) {
                newRows.push(createEmptyRow());
            }
            onChange?.(newRows);
        }
    }, [minRows, value, onChange]);

    const createEmptyRow = (): TableRow => {
        const newRow: TableRow = { id: Date.now().toString() };
        columns.forEach((column) => {
            newRow[column.id] = column.defaultValue !== undefined ? column.defaultValue : "";
        });
        return newRow;
    };

    const handleAddRow = () => {
        if (maxRows !== undefined && value.length >= maxRows) {
            return;
        }

        const newRow = createEmptyRow();
        onChange?.([...value, newRow]);
        setEditingId(newRow.id);

        setTimeout(() => {
            if (firstInputRef.current) {
                firstInputRef.current.focus();
            }
        }, 0);
    };

    const handleDeleteRow = (id: string) => {
        if (value.length <= minRows) {
            return;
        }

        const newRows = value.filter((row) => row.id !== id);
        onChange?.(newRows);
        if (editingId === id) {
            setEditingId(null);
        }
    };

    const handleInputChange = (id: string, field: string, newValue: any) => {
        const newRows = value.map((row) =>
            row.id === id ? { ...row, [field]: newValue } : row
        );
        onChange?.(newRows);
    };

    const renderInputField = (row: TableRow, column: TableColumn, isFirstColumn: boolean) => {
        const isFirstInput = isFirstColumn && row.id === editingId;
        const inputValue = row[column.id] !== undefined ? row[column.id] : "";

        switch (column.type) {
            case "textarea":
                return (
                    <Textarea
                        ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLTextAreaElement>) : null}
                        value={inputValue}
                        onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                        placeholder={column.placeholder}
                        required={column.required}
                        className={cn("min-h-[40px] border-blue-200 focus:border-blue-500", column.className)}
                    />
                );

            case "number":
                return (
                    <Input
                        ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
                        type="number"
                        value={inputValue}
                        onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            handleInputChange(row.id, column.id, val);
                        }}
                        min={column.min}
                        max={column.max}
                        step={column.step || 1}
                        placeholder={column.placeholder}
                        required={column.required}
                        className={cn("border-blue-200 focus:border-blue-500", column.className)}
                    />
                );

            case "select":
                return (
                    <Select
                        value={inputValue?.toString() || ""}
                        onValueChange={(val) => handleInputChange(row.id, column.id, val)}
                    >
                        <SelectTrigger
                            className={cn("border-blue-200 focus:border-blue-500", column.className)}
                            ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLButtonElement>) : null}
                        >
                            <SelectValue placeholder={column.placeholder || "Chọn..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {column.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case "checkbox":
                return (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={!!inputValue}
                            onCheckedChange={(checked) => handleInputChange(row.id, column.id, checked)}
                            ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLButtonElement>) : null}
                            className={cn("data-[state=checked]:bg-blue-500", column.className)}
                        />
                    </div>
                );

            case "date":
                return (
                    <Input
                        ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
                        type="date"
                        value={inputValue || ""}
                        onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                        placeholder={column.placeholder}
                        required={column.required}
                        className={cn("border-blue-200 focus:border-blue-500", column.className)}
                    />
                );

            case "text":
            default:
                return (
                    <Input
                        ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
                        value={inputValue || ""}
                        onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                        placeholder={column.placeholder}
                        required={column.required}
                        className={cn("border-blue-200 focus:border-blue-500", column.className)}
                    />
                );
        }
    };

    const canAddMoreRows = maxRows === undefined || value.length < maxRows;
    const canDeleteRows = value.length > minRows;

    return (
        <div className={cn("w-full mx-auto p-4 border rounded-lg bg-white", className)}>
            {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
            {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className={cn("bg-gray-50", headerClassName)}>
                            <th className="border p-2 text-center w-16">TT</th>
                            {columns.map((column) => (
                                <th
                                    key={column.id}
                                    className="border p-2 text-center"
                                    style={column.width ? { width: column.width } : {}}
                                >
                                    {column.header}
                                    {column.required && <span className="text-red-500 ml-1">*</span>}
                                </th>
                            ))}
                            <th className="border p-2 text-center w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {value.map((row, index) => (
                            <tr key={row.id} className={rowClassName}>
                                <td className={cn("border p-2 text-center", cellClassName)}>{index + 1}</td>
                                {columns.map((column, colIndex) => (
                                    <td key={column.id} className={cn("border p-2", cellClassName)}>
                                        {renderInputField(row, column, colIndex === 0)}
                                    </td>
                                ))}
                                <td className={cn("border p-2", cellClassName)}>
                                    <div className="flex flex-col items-center gap-2">
                                        {canDeleteRows && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteRow(row.id)}
                                                title="Xóa dòng"
                                            >
                                                <X size={18} />
                                            </Button>
                                        )}
                                        {canAddMoreRows && (
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={handleAddRow}
                                                title="Thêm dòng"
                                            >
                                                <Plus size={18} />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {value.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 2} className="border p-4 text-center text-gray-500">
                                    {noDataText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {canAddMoreRows && (
                <div className="flex justify-center mt-4">
                    <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={handleAddRow}
                    >
                        <Plus size={20} />
                    </Button>
                </div>
            )}
        </div>
    );
}