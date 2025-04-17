import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface TableColumn {
    id: string
    header: string
    type: "text" | "textarea"
    width?: string
}

export interface TableRow {
    id: string
    [key: string]: any
}

interface DynamicTableProps {
    title?: string
    description?: string
    columns: TableColumn[]
    initialData?: TableRow[]
    onDataChange?: (data: TableRow[]) => void
}

export default function DynamicTable({
    title,
    description,
    columns,
    initialData = [],
    onDataChange,
}: DynamicTableProps) {
    const [rows, setRows] = useState<TableRow[]>(initialData)
    const [editingId, setEditingId] = useState<string | null>(null)
    const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

    useEffect(() => {
        if (onDataChange) {
            onDataChange(rows)
        }
    }, [rows, onDataChange])

    const createEmptyRow = (): TableRow => {
        const newRow: TableRow = { id: Date.now().toString() }

        columns.forEach((column) => {
            newRow[column.id] = ""
        })

        return newRow
    }

    const handleAddRow = () => {
        const newRow = createEmptyRow()
        setRows([...rows, newRow])
        setEditingId(newRow.id)

        setTimeout(() => {
            if (firstInputRef.current) {
                firstInputRef.current.focus()
            }
        }, 0)
    }

    const handleDeleteRow = (id: string) => {
        setRows(rows.filter((row) => row.id !== id))
        if (editingId === id) {
            setEditingId(null)
        }
    }

    const handleInputChange = (id: string, field: string, value: string) => {
        setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
    }

    const renderInputField = (row: TableRow, column: TableColumn, isFirstColumn: boolean) => {
        const isFirstInput = isFirstColumn && row.id === editingId

        if (column.type === "textarea") {
            return (
                <Textarea
                    ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLTextAreaElement>) : null}
                    value={row[column.id] || ""}
                    onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                    className="min-h-[40px] border-blue-200 focus:border-blue-500"
                />
            )
        }

        return (
            <Input
                ref={isFirstInput ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
                value={row[column.id] || ""}
                onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                className="border-blue-200 focus:border-blue-500"
            />
        )
    }

    return (
        <div className="w-full mx-auto p-4 border rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>

            {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border p-2 text-center w-16 ">TT</th>
                            {columns.map((column) => (
                                <th
                                    key={column.id}
                                    className="border p-2 text-center"
                                    style={column.width ? { width: column.width } : {}}
                                >
                                    {column.header}
                                </th>
                            ))}
                            <th className="border p-2 text-center w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row.id}>
                                <td className="border p-2 text-center">{index + 1}</td>
                                {columns.map((column, colIndex) => (
                                    <td key={column.id} className="border p-2">
                                        {renderInputField(row, column, colIndex === 0)}
                                    </td>
                                ))}
                                <td className="border p-2">
                                    <div className="flex flex-col items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteRow(row.id)}
                                        >
                                            <X size={18} />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleAddRow}
                                        >
                                            <Plus size={18} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 2} className="border p-4 text-center text-gray-500">
                                    Chưa có dữ liệu. Nhấn nút "+" để thêm dòng mới.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
        </div>
    )
}
