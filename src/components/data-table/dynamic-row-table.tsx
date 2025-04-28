import React, { useEffect, useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { formatVND } from "@/utils/common";

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
    value?: TableRow[];
    onChange?: (data: TableRow[]) => void;
    control: Control<any>;
    name: string;
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
    value = [],
    onChange,
    control,
    name,
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
            newRow[column.id] = column.defaultValue !== undefined ? column.defaultValue : column.type === "number" ? 0 : "";
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

    const renderInputField = (row: TableRow, column: TableColumn, rowIndex: number, isFirstColumn: boolean) => {
        const fieldName = `${name}.${rowIndex}.${column.id}` as const;
        const isFirstInput = isFirstColumn && row.id === editingId;

        return (
            <FormField
                control={control}
                name={fieldName}
                render={({ field, fieldState }) => (
                    <FormItem className="relative">
                        <FormControl>
                            {(() => {
                                switch (column.type) {
                                    case "textarea":
                                        return (
                                            <Textarea
                                                ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLTextAreaElement>) : null}
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder={column.placeholder}
                                                required={column.required}
                                                className={cn("min-h-[40px] border-blue-200 focus:border-blue-500", fieldState.error && "border-red-500 focus:border-red-500", column.className)}
                                            />
                                        );

                                    case "number":
                                        return (
                                            <Input
                                                ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
                                                type="text"
                                                {...field}
                                                value={field.value !== undefined ? formatVND(field.value) : ""}
                                                onChange={(e) => {
                                                    const rawValue = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                                                    field.onChange(rawValue);
                                                }}
                                                onBlur={(e) => {
                                                    const rawValue = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                                                    field.onChange(rawValue);
                                                    e.target.value = formatVND(rawValue);
                                                }}
                                                min={column.min}
                                                max={column.max}
                                                step={column.step || 1}
                                                placeholder={column.placeholder}
                                                required={column.required}
                                                className={cn("border-blue-200 focus:border-blue-500", fieldState.error && "border-red-500 focus:border-red-500", column.className)}
                                            />
                                        );

                                    case "select":
                                        return (
                                            <Select
                                                {...field}
                                                value={field.value?.toString() || ""}
                                                onValueChange={(val) => field.onChange(val)}
                                            >
                                                <SelectTrigger
                                                    className={cn("border-blue-200 focus:border-blue-500", fieldState.error && "border-red-500 focus:border-red-500", column.className)}
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
                                                    {...field}
                                                    checked={!!field.value}
                                                    onCheckedChange={(checked) => field.onChange(checked)}
                                                    ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLButtonElement>) : null}
                                                    className={cn("data-[state=checked]:bg-blue-500", fieldState.error && "border-red-500", column.className)}
                                                />
                                            </div>
                                        );

                                    case "date":
                                        return (
                                            <Input
                                                ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
                                                type="date"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder={column.placeholder}
                                                required={column.required}
                                                className={cn("border-blue-200 focus:border-blue-500", fieldState.error && "border-red-500 focus:border-red-500", column.className)}
                                            />
                                        );

                                    case "text":
                                    default:
                                        return (
                                            <Input
                                                ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder={column.placeholder}
                                                required={column.required}
                                                className={cn("border-blue-200 focus:border-blue-500", fieldState.error && "border-red-500 focus:border-red-500", column.className)}
                                            />
                                        );
                                }
                            })()}
                        </FormControl>
                        {fieldState.error && (
                            <div className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0 w-full">
                                {fieldState.error.message}
                            </div>
                        )}
                    </FormItem>
                )}
            />
        );
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
                            <tr key={row.id} className={cn("relative", rowClassName)}>
                                <td className={cn("border p-2 text-center", cellClassName)}>{index + 1}</td>
                                {columns.map((column, colIndex) => (
                                    <td key={column.id} className={cn("border p-2 relative", cellClassName)}>
                                        <div className="min-h-[60px] flex flex-col">
                                            {renderInputField(row, column, index, colIndex === 0)}
                                        </div>
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