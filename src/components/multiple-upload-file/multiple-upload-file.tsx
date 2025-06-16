import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type FileStatus = "pending" | "uploading" | "complete" | "error";

interface UploadFile {
    id: string;
    file: File;
    status: FileStatus;
    error?: string;
}

interface UploadSession {
    id: string;
    name: string;
    files: UploadFile[];
}

interface MultiFileUploadProps<TFieldValues extends FieldValues> {
    form: UseFormReturn<TFieldValues>;
    field: {
        value: { file: File; description: string }[] | undefined;
        onChange: (value: { file: File; description: string }[] | undefined) => void;
        name: FieldPath<TFieldValues>;
    };
    accept?: string;
    maxSize?: number;
    placeholder?: string;
    description?: string;
    label?: string;
    readOnly?: boolean;
}

export default function MultiFileUpload<TFieldValues extends FieldValues>({
    form,
    field,
    accept = ".pdf,.doc,.docx",
    maxSize = 10,
    placeholder = "Tải lên tài liệu",
    description = "Tải lên tài liệu bổ sung (PDF, Word - tối đa 10MB)",
    label = "Tài liệu đính kèm",
    readOnly = false,
}: MultiFileUploadProps<TFieldValues>) {
    const [sessions, setSessions] = useState<UploadSession[]>([{ id: "1", name: "", files: [] }]);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        const allDocs = sessions
            .map((session) => {
                return session.files
                    .filter((f) => f.status === "complete")
                    .map((f) => ({
                        file: f.file,
                        description: session.name || "",
                    }));
            })
            .flat();

        const newValue = allDocs.length > 0 ? allDocs : undefined;

        const timeout = setTimeout(() => {
            field.onChange(newValue);
        }, 100);

        return () => clearTimeout(timeout);
    }, [sessions, field]);

    const handleAddSession = () => {
        if (readOnly) return;
        setSessions([...sessions, { id: Date.now().toString(), name: "", files: [] }]);
    };

    const handleRemoveSession = (sessionId: string) => {
        if (readOnly || sessions.length <= 1) return;
        setSessions(sessions.filter((session) => session.id !== sessionId));
    };

    const handleSessionNameChange = (sessionId: string, name: string) => {
        if (readOnly) return;
        setSessions(sessions.map((session) => (session.id === sessionId ? { ...session, name } : session)));
    };

    const handleFileSelect = (sessionId: string, selectedFiles: FileList | null) => {
        if (readOnly || !selectedFiles) return;

        const file = selectedFiles[0];
        if (!file) return;

        const maxSizeBytes = maxSize * 1024 * 1024;
        const acceptedTypes = accept.split(",").map((type) => type.trim().toLowerCase());
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const isValidType = acceptedTypes.includes(fileExtension) || acceptedTypes.includes(file.type);
        const isValidSize = file.size <= maxSizeBytes;

        if (!isValidType) {
            form.setError(field.name, {
                type: "manual",
                message: `File ${file.name} không được hỗ trợ. Chỉ chấp nhận ${accept}.`,
            });
            return;
        }
        if (!isValidSize) {
            form.setError(field.name, {
                type: "manual",
                message: `File ${file.name} vượt quá kích thước tối đa ${maxSize}MB.`,
            });
            return;
        }

        const newFile = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            status: "pending" as FileStatus,
        };

        setSessions((prevSessions) => {
            const updatedSessions = prevSessions.map((session) => {
                if (session.id === sessionId) {
                    return {
                        ...session,
                        files: [newFile],
                    };
                }
                return session;
            });

            setTimeout(() => {
                simulateUpload(sessionId, newFile.id);
            }, 100);

            return updatedSessions;
        });
    };

    const handleRemoveFile = (sessionId: string, fileId: string) => {
        if (readOnly) return;
        setSessions(
            sessions.map((session) => {
                if (session.id === sessionId) {
                    return {
                        ...session,
                        files: session.files.filter((file) => file.id !== fileId),
                    };
                }
                return session;
            }),
        );
    };

    const simulateUpload = (sessionId: string, fileId: string) => {
        setSessions((prevSessions) => {
            return prevSessions.map((session) => {
                if (session.id === sessionId) {
                    return {
                        ...session,
                        files: session.files.map((file) => {
                            if (file.id === fileId) {
                                return { ...file, status: "uploading" as FileStatus };
                            }
                            return file;
                        }),
                    };
                }
                return session;
            });
        });

        setTimeout(() => {
            setSessions((prevSessions) => {
                return prevSessions.map((session) => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            files: session.files.map((file) => {
                                if (file.id === fileId && file.status === "uploading") {
                                    return { ...file, status: "complete" as FileStatus };
                                }
                                return file;
                            }),
                        };
                    }
                    return session;
                });
            });
        }, 1000);
    };

    const getStatusBadge = (status: FileStatus) => {
        const baseClass =
            "text-xs font-medium px-2 py-0.5 rounded border";
        switch (status) {
            case "pending":
                return <Badge className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}>Chờ</Badge>;
            case "uploading":
                return <Badge className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>Đang tải</Badge>;
            case "complete":
                return <Badge className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>Hoàn thành</Badge>;
            case "error":
                return <Badge className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Lỗi</Badge>;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="w-full">
            <div className="space-y-6">
                {sessions.map((session, index) => (
                    <div key={session.id} className="border rounded-md overflow-hidden relative">
                        {!readOnly && sessions.length > 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSession(session.id)}
                                className="absolute top-2 right-2 text-rose-500 z-10"
                            >
                                <X size={20} />
                            </Button>
                        )}

                        <div className="bg-white p-4 border-b">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">TT: {index + 1}</span>
                                <Input
                                    placeholder="Mô tả tệp tải lên"
                                    value={session.name}
                                    onChange={(e) => handleSessionNameChange(session.id, e.target.value)}
                                    className="max-w-xs h-8 text-sm"
                                    readOnly={readOnly}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-white">
                            {!readOnly && (
                                <div className="mb-4">
                                    <input
                                        type="file"
                                        accept={accept}
                                        className="hidden"
                                        ref={(el) => (fileInputRefs.current[session.id] = el)}
                                        onChange={(e) => handleFileSelect(session.id, e.target.files)}
                                    />
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (session.files.length > 0) {
                                                form.setError(field.name, {
                                                    type: "manual",
                                                    message: "Mỗi mục chỉ được tải lên 1 file duy nhất.",
                                                });
                                                return;
                                            }
                                            fileInputRefs.current[session.id]?.click();
                                        }}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white border-none"
                                    >
                                        <Plus size={16} />
                                        {placeholder}
                                    </Button>
                                </div>
                            )}

                            {session.files.length > 0 ? (
                                <div className="space-y-3">
                                    {session.files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between border rounded-md p-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-1">
                                                    <div className="truncate font-medium text-sm">{file.file.name}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatFileSize(file.file.size)}
                                                        </span>
                                                        {getStatusBadge(file.status)}
                                                    </div>
                                                </div>
                                            </div>
                                            {!readOnly && (
                                                <div className="ml-4">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveFile(session.id, file.id)}
                                                        className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-dashed rounded-md p-6 text-center text-gray-500">
                                    <p>Kéo thả file vào đây để tải lên.</p>
                                    <p className="text-sm text-red-500">
                                        (Chỉ chấp nhận {accept.replace(/,/g, ", ")} - tối đa {maxSize}MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!readOnly && (
                <div className="flex justify-center mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddSession}
                        className="border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    >
                        <Plus size={16} className="mr-1" />
                    </Button>
                </div>
            )}

            {!readOnly && (
                <p className="text-sm text-red-500 mt-2">
                    Kéo thả file vào đây để tải lên. (Cần chữ ký của các biểu mẫu trước khi upload lên)
                </p>
            )}
        </div>
    );
}
