import type React from "react"
import { useRef, useState, useEffect } from "react"
import { FileText, Upload, X, Eye, Download, EyeOff } from "lucide-react"
import "./file-upload-preview.css"

interface FileUploadPreviewProps {
    value: string
    onChange: (value: string) => void
    onFileChange: (file: File | null) => void
    accept?: string
    maxSize?: number // in MB
    label?: string
    error?: string
    placeholder?: string
    className?: string
    existingFile?: string // URL to an existing file
    height?: string | number // New prop for preview height
    disabled?: boolean // New prop to disable the component
    displayName?: string // New prop to show a custom name instead of the actual file name
}

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({
    value,
    onChange,
    onFileChange,
    accept = ".pdf",
    maxSize = 10,
    label,
    error,
    placeholder = "Tải lên file",
    className = "",
    existingFile,
    height = "500px", // Default height
    disabled = false, // Default to enabled
    displayName = "" // Default to empty (use actual file name)
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string>("")
    const [fileType, setFileType] = useState<string>("")
    const [fileSize, setFileSize] = useState<string>("")
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [fileError, setFileError] = useState<string>("")
    const [isExistingFile, setIsExistingFile] = useState<boolean>(false)
    const [isCleared, setIsCleared] = useState<boolean>(false)
    const [previewUrl, setPreviewUrl] = useState<string>("")

    useEffect(() => {
        if (existingFile && !isCleared) {
            onChange(existingFile)
            setIsExistingFile(true)
            setPreviewUrl(existingFile)
            const name = extractFileName(existingFile)
            setFileName(name || "")
            setFileType(determineFileType(existingFile))
        } else if (value && !fileName && !isExistingFile) {
            setPreviewUrl(value)
            const name = extractFileName(value)
            setFileName(name || "")
            setFileType(determineFileType(value))
        }
    }, [existingFile, value, onChange, fileName, isExistingFile, isCleared])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return
        const file = e.target.files?.[0]
        processFile(file)
    }

    const processFile = (file: File | null | undefined) => {
        if (disabled) return

        setFileError("")
        setIsExistingFile(false)

        if (!file) {
            setFileName("")
            setFileType("")
            setFileSize("")
            setPreviewUrl("")
            onChange("")
            if (onFileChange) onFileChange(null)
            return
        }

        const fileSizeInMB = file.size / (1024 * 1024)
        if (fileSizeInMB > maxSize) {
            setFileError(`File quá lớn. Kích thước tối đa là ${maxSize}MB.`)
            return
        }

        const fileExtension = file.name.split(".").pop()?.toLowerCase()
        const acceptedTypes = accept.split(",").map((type) => type.trim().replace(".", "").toLowerCase())

        if (fileExtension && !acceptedTypes.includes(fileExtension)) {
            setFileError(`Loại file không được hỗ trợ. Chấp nhận: ${accept}`)
            return
        }

        setFileName(file.name)
        setFileType(file.type)
        setFileSize(formatFileSize(file.size))

        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)
        onChange(objectUrl)

        if (onFileChange) onFileChange(file)
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " bytes"
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
        else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }

    const handleDragEnter = (e: React.DragEvent) => {
        if (disabled) return
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        if (disabled) return
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
        if (disabled) return
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        if (disabled) return
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        processFile(file)
    }

    const clearFile = () => {
        if (disabled) return

        setFileName("")
        setFileType("")
        setFileSize("")
        setShowPreview(false)
        setIsExistingFile(false)
        setIsCleared(true)
        setPreviewUrl("")
        onChange("")
        if (fileInputRef.current) fileInputRef.current.value = ""
        if (onFileChange) onFileChange(null)
    }

    const togglePreview = () => {
        setShowPreview(!showPreview)
    }

    const extractFileName = (url: string): string => {
        try {
            const pathParts = new URL(url).pathname.split("/")
            return decodeURIComponent(pathParts[pathParts.length - 1])
        } catch {
            const pathParts = url.split("/")
            return pathParts[pathParts.length - 1]
        }
    }

    const determineFileType = (url: string): string => {
        const extension = url.split(".").pop()?.toLowerCase()
        switch (extension) {
            case "pdf":
                return "application/pdf"
            case "doc":
                return "application/msword"
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            default:
                return ""
        }
    }

    // Style object for preview area
    const previewStyle = {
        height: typeof height === 'number' ? `${height}px` : height,
    }

    return (
        <div className={`file-upload-container ${className}`}>
            {label && <div className="file-upload-label">{label}</div>}

            <div
                className={`file-upload-area ${isDragging ? "dragging" : ""} ${error || fileError ? "error" : ""} ${disabled ? "disabled" : ""}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="file-upload-content">
                    {!fileName ? (
                        <>
                            <div
                                className="file-upload-placeholder"
                                onClick={() => !disabled && fileInputRef.current?.click()}
                                style={disabled ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                            >
                                <Upload className="file-upload-icon" />
                                <span>{placeholder}</span>
                            </div>
                            <div className="file-upload-instructions">
                                {disabled ? (
                                    "Chỉ có thể xem"
                                ) : (
                                    <>
                                        Kéo và thả file vào đây hoặc{" "}
                                        <span className="file-upload-browse" onClick={() => fileInputRef.current?.click()}>
                                            chọn file
                                        </span>
                                    </>
                                )}
                            </div>
                            {!disabled && (
                                <div className="file-upload-info">
                                    {accept && <div className="file-upload-accept">Định dạng: {accept}</div>}
                                    {maxSize && <div className="file-upload-size">Kích thước tối đa: {maxSize}MB</div>}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="file-selected">
                            <div className="file-info">
                                <FileText className="file-icon" />
                                <div className="file-details">
                                    <div className="file-name" title={displayName || fileName}>
                                        {displayName || fileName}
                                    </div>
                                    {fileSize && <div className="file-size ml-2">{fileSize}</div>}
                                    {isExistingFile && <div className="file-badge">File hiện tại</div>}
                                </div>
                            </div>
                            <div className="file-actions">
                                {value && (
                                    <>
                                        <button
                                            type="button"
                                            className="file-action-button preview"
                                            onClick={togglePreview}
                                            aria-label={showPreview ? "Ẩn xem trước" : "Xem trước"}
                                        >
                                            {showPreview ? <EyeOff className="file-action-icon" /> : <Eye className="file-action-icon" />}
                                        </button>
                                        <button
                                            type="button"
                                            className="file-action-button download"
                                            onClick={() => window.open(previewUrl, "_blank")}
                                            aria-label="Tải xuống"
                                        >
                                            <Download className="file-action-icon" />
                                        </button>
                                    </>
                                )}
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="file-action-button remove text-rose-500"
                                        onClick={clearFile}
                                        aria-label="Xóa file"
                                    >
                                        <X className="file-action-icon" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden-file-input"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={disabled}
                />
            </div>

            {(error || fileError) && <div className="file-upload-error">{error || fileError}</div>}

            {showPreview && previewUrl && (
                <div className="file-preview" style={previewStyle}>
                    {fileType.includes("pdf") ? (
                        <object
                            data={previewUrl}
                            type="application/pdf"
                            className="pdf-preview"
                            title="PDF Preview"
                            style={previewStyle}
                        >
                            <div className="generic-preview">
                                <FileText className="generic-preview-icon" />
                                <p>
                                    Không thể hiển thị PDF trực tiếp.{" "}
                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                        Mở file
                                    </a>{" "}
                                    để xem.
                                </p>
                            </div>
                        </object>
                    ) : fileType.includes("image") ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="image-preview"
                            crossOrigin="anonymous"
                            style={previewStyle}
                        />
                    ) : (
                        <div className="generic-preview">
                            <FileText className="generic-preview-icon" />
                            <p>
                                Xem trước không khả dụng.{" "}
                                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                    Mở file
                                </a>{" "}
                                để xem.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export const FormFileUploadPreview = ({
    field,
    fieldState,
    label,
    accept,
    maxSize,
    placeholder,
    className,
    onFileChange,
    existingFile,
    height,
    disabled,
    displayName,
}: {
    field: any
    fieldState: any
    label?: string
    accept?: string
    maxSize?: number
    placeholder?: string
    className?: string
    onFileChange?: (file: File | null) => void
    existingFile?: string
    height?: string | number
    disabled?: boolean
    displayName?: string
}) => {
    return (
        <FileUploadPreview
            value={field.value || ""}
            onChange={field.onChange}
            onFileChange={onFileChange}
            accept={accept}
            maxSize={maxSize}
            label={label}
            error={fieldState.error?.message}
            placeholder={placeholder}
            className={className}
            existingFile={existingFile}
            height={height}
            disabled={disabled}
            displayName={displayName}
        />
    )
}