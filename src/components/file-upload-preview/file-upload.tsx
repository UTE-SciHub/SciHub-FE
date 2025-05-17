import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText } from "lucide-react"

interface FileUploadProps {
    value: File | null
    onChange: (file: File | null) => void
    accept?: string
    initialFileName?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({ value, onChange, accept, initialFileName }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string | undefined>(initialFileName)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (value) {
            setFileName(value.name)
        } else if (initialFileName) {
            setFileName(initialFileName)
        } else {
            setFileName(undefined)
        }
    }, [value, initialFileName])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            const file = files[0]
            onChange(file)
            setFileName(file.name)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            const file = files[0]
            if (accept) {
                const fileType = file.type
                const fileExtension = `.${file.name.split(".").pop()}`
                const acceptTypes = accept.split(",")

                if (acceptTypes.some((type) => type.trim() === fileType || type.trim() === fileExtension)) {
                    onChange(file)
                    setFileName(file.name)
                } else {
                    alert("Định dạng file không được hỗ trợ")
                }
            } else {
                onChange(file)
                setFileName(file.name)
            }
        }
    }

    const handleRemoveFile = () => {
        onChange(null)
        setFileName(undefined)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    return (
        <div className="space-y-2">
            <div
                className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleButtonClick}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={accept} />
                <div className="flex flex-col items-center justify-center py-2">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Kéo thả file vào đây hoặc nhấn để chọn file</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {accept ? `Hỗ trợ: ${accept.replace(/\./g, "")}` : "Tất cả các loại file"}
                    </p>
                </div>
            </div>

            {fileName && (
                <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{fileName}</span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={handleRemoveFile}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Xóa file</span>
                    </Button>
                </div>
            )}
        </div>
    )
}
