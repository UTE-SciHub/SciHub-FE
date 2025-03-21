import React, { useRef, useState, useEffect } from 'react';
import { FileText, Upload, X, Eye, Download, EyeOff } from 'lucide-react';
import './file-upload-preview.css';

interface FileUploadPreviewProps {
    value: string;
    onChange: (value: string) => void;
    onFileChange?: (file: File | null) => void;
    accept?: string;
    maxSize?: number; // in MB
    label?: string;
    error?: string;
    placeholder?: string;
    className?: string;
}

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({
    value,
    onChange,
    onFileChange,
    accept = ".pdf,.doc,.docx",
    maxSize = 10, // Default 10MB
    label,
    error,
    placeholder = "Tải lên file",
    className = "",
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileType, setFileType] = useState<string>("");
    const [fileSize, setFileSize] = useState<string>("");
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string>("");

    useEffect(() => {
        if (value && !fileName) {
            try {
                const url = new URL(value);
                const pathParts = url.pathname.split('/');
                const name = pathParts[pathParts.length - 1];
                if (name) setFileName(decodeURIComponent(name));
            } catch (e) {
                const pathParts = value.split('/');
                setFileName(pathParts[pathParts.length - 1]);
            }
        }
    }, [value, fileName]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        processFile(file);
    };

    const processFile = (file: File | null | undefined) => {
        setFileError("");

        if (!file) {
            setFileName("");
            setFileType("");
            setFileSize("");
            onChange("");
            if (onFileChange) onFileChange(null);
            return;
        }

        // Check file size
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > maxSize) {
            setFileError(`File quá lớn. Kích thước tối đa là ${maxSize}MB.`);
            return;
        }

        // Check file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const acceptedTypes = accept.split(',').map(type =>
            type.trim().replace('.', '').toLowerCase()
        );

        if (fileExtension && !acceptedTypes.includes(fileExtension)) {
            setFileError(`Loại file không được hỗ trợ. Chấp nhận: ${accept}`);
            return;
        }

        setFileName(file.name);
        setFileType(file.type);
        setFileSize(formatFileSize(file.size));

        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        onChange(objectUrl);

        if (onFileChange) onFileChange(file);
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        processFile(file);
    };

    // Clear the selected file
    const clearFile = () => {
        setFileName("");
        setFileType("");
        setFileSize("");
        setShowPreview(false);
        onChange("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onFileChange) onFileChange(null);
    };

    // Toggle preview visibility
    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    return (
        <div className={`file-upload-container ${className}`}>
            {label && <div className="file-upload-label">{label}</div>}

            <div
                className={`file-upload-area ${isDragging ? 'dragging' : ''} ${error || fileError ? 'error' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="file-upload-content">
                    {!fileName ? (
                        <>
                            <div className="file-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="file-upload-icon" />
                                <span>{placeholder}</span>
                            </div>
                            <div className="file-upload-instructions">
                                Kéo và thả file vào đây hoặc <span className="file-upload-browse" onClick={() => fileInputRef.current?.click()}>chọn file</span>
                            </div>
                            <div className="file-upload-info">
                                {accept && <div className="file-upload-accept">Định dạng: {accept}</div>}
                                {maxSize && <div className="file-upload-size">Kích thước tối đa: {maxSize}MB</div>}
                            </div>
                        </>
                    ) : (
                        <div className="file-selected">
                            <div className="file-info">
                                <FileText className="file-icon" />
                                <div className="file-details">
                                    <div className="file-name" title={fileName}>{fileName}</div>
                                    {fileSize && <div className="file-size ml-2">{fileSize}</div>}
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
                                            onClick={() => window.open(value, "_blank")}
                                            aria-label="Tải xuống"
                                        >
                                            <Download className="file-action-icon" />
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="file-action-button remove text-rose-500"
                                    onClick={clearFile}
                                    aria-label="Xóa file"
                                >
                                    <X className="file-action-icon" />
                                </button>
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
                />
            </div>

            {(error || fileError) && (
                <div className="file-upload-error">{error || fileError}</div>
            )}

            {showPreview && value && (
                <div className="file-preview">
                    {fileType.includes('pdf') ? (
                        <iframe
                            src={`${value}#toolbar=0`}
                            className="pdf-preview"
                            title="PDF Preview"
                        />
                    ) : fileType.includes('image') ? (
                        <img src={value || "/placeholder.svg"} alt="Preview" className="image-preview" />
                    ) : (
                        <div className="generic-preview">
                            <FileText className="generic-preview-icon" />
                            <p>Xem trước không khả dụng. <a href={value} target="_blank" rel="noopener noreferrer">Mở file</a> để xem.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Form-specific version that works with React Hook Form
export const FormFileUploadPreview = ({
    field,
    fieldState,
    label,
    accept,
    maxSize,
    placeholder,
    className,
    onFileChange,
}: {
    field: any;
    fieldState: any;
    label?: string;
    accept?: string;
    maxSize?: number;
    placeholder?: string;
    className?: string;
    onFileChange?: (file: File | null) => void;
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
        />
    );
};
