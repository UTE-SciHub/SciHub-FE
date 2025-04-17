import type React from "react"

import { useState, useRef } from "react"
import { z } from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Upload,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
    X,
    Download,
    Loader2,
    Info,
    FileWarning,
    FilePlus,
    Save,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { UserImportResponse } from "@/models/user-import-dto"
import Loading from "@/components/loading/loading"
import { UserService } from "@/service/user-service"

interface ValidationError {
    row: number
    email: string
    errors: string[]
}

interface DuplicateError {
    row: number
    id?: string
    email: string
    name?: string
    phone?: string
    type: "file" | "system"
}

interface ImportUsersModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImportComplete?: (data: { success: number; failed: number }) => void
}

const ImportUsersModal: React.FC<ImportUsersModalProps> = ({ open, onOpenChange, onImportComplete }) => {
    const [file, setFile] = (useState<File | null>(null))
    const [isUploading, setIsUploading] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")

    const [validRecords, setValidRecords] = useState<UserImportResponse[]>([])
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
    const [duplicateErrors, setDuplicateErrors] = useState<DuplicateError[]>([])

    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Stats
    const totalRecords = validRecords.length + validationErrors.length + duplicateErrors.length
    const validCount = validRecords.length
    const errorCount = validationErrors.length
    const duplicateCount = duplicateErrors.length

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Kiểm tra định dạng file (chỉ cho phép .xlsx)
        const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
        if (!["xlsx"].includes(fileType || "")) {
            toast({
                title: "Định dạng file không hợp lệ",
                variant: "error",
            });
            return;
        }

        // Kiểm tra kích thước file (tối đa 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast({
                title: "Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.",
                variant: "error",
            });
            return;
        }

        setFile(selectedFile);
        setIsUploading(true);

        try {
            await processFile(selectedFile);
        } catch (error) {
            console.error("Error uploading file:", error);
            toast({
                title: "Có lỗi xảy ra khi tải lên file.",
                variant: "error",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const IMPORT_TIMEOUT_MS = 30000; // 30 giây timeout

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setProgress(0);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            toast({
                title: "Import quá lâu",
                description: "Import mất quá nhiều thời gian, vui lòng thử lại.",
                variant: "error",
            });
            setIsProcessing(false);
        }, IMPORT_TIMEOUT_MS);

        try {
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await UserService.importUsers(file, {
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            clearInterval(progressInterval);
            setProgress(100);

            if (response && response.data) {
                const { validRecords, validationErrors, duplicateErrors, errorCount, successCount } = response.data;

                console.log({ validRecords, validationErrors, duplicateErrors, errorCount, successCount });

                const formattedValidationErrors: ValidationError[] = validationErrors.map((error, index) => ({
                    row: index + 2,
                    email: error.Email || "",
                    errors: [`Lỗi tại trường: ${error.errorField}`],
                }));

                const formattedDuplicateErrors: DuplicateError[] = duplicateErrors.map((error, index) => ({
                    row: index + validationErrors.length + 2,
                    id: error.id,
                    email: error.email,
                    name: error.name,
                    phone: error.phoneNumber,
                    type: error.type,
                }));

                setValidRecords(validRecords);
                setValidationErrors(formattedValidationErrors);
                setDuplicateErrors(formattedDuplicateErrors);
                setActiveTab("overview");

                if (errorCount > 0 && successCount === 0) {
                    toast({
                        title: "Không có bản ghi hợp lệ để nhập",
                        description: `Có ${errorCount} bản ghi lỗi trong file.`,
                        variant: "warning",
                    });
                }
            } else {
                toast({
                    title: "Có lỗi xảy ra khi xử lý file.",
                    variant: "error",
                });
            }
        } catch (error) {
            if (error.name === "AbortError") {
                console.error("Import bị hủy do quá thời gian chờ.");
            } else {
                console.error("Lỗi khi gửi file:", error);
                toast({
                    title: "Có lỗi xảy ra khi gửi file.",
                    variant: "error",
                });
            }
        } finally {
            clearTimeout(timeoutId);
            setIsProcessing(false);
        }
    };


    const handleImport = async () => {
        if (validRecords.length === 0) {
            toast({
                title: "Không có bản ghi hợp lệ để nhập",
                variant: "error",
            });
            return;
        }

        setIsImporting(true);

        try {
            const payload = validRecords.map((record) => ({
                id: record.id,
                name: record.name,
                email: record.email,
                phoneNumber: record.phoneNumber,
            }));

            const response = await UserService.confirmImport(payload);

            if (response.status === 200) {
                toast({
                    title: `Đã nhập ${validRecords.length} người dùng thành công`,
                    variant: "success",
                });

                onImportComplete?.({
                    success: validRecords.length,
                    failed: validationErrors.length + duplicateErrors.length,
                });

                onOpenChange(false);

                resetState();
            } else {
                toast({
                    title: "Có lỗi xảy ra khi nhập người dùng.",
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error importing users:", error);
            toast({
                title: "Có lỗi xảy ra khi nhập người dùng.",
                variant: "error",
            });
        } finally {
            setIsImporting(false);
        }
    };

    const resetState = () => {
        setFile(null)
        setValidRecords([])
        setValidationErrors([])
        setDuplicateErrors([])
        setProgress(0)
        setActiveTab("overview")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleDownloadTemplate = () => {
        const templatePath = "/template/user-import-template.xlsx";

        const link = document.createElement("a");
        link.href = templatePath;
        link.setAttribute("download", "import-user-template.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Đã tải xuống mẫu.",
            variant: "success",
        });
    };

    return (
        <>
            {isImporting && <Loading />}
            <Dialog
                open={open}
                onOpenChange={(newOpen) => {
                    if (!isProcessing && !isImporting) {
                        onOpenChange(newOpen)
                        if (!newOpen) resetState()
                    }
                }}
            >
                <DialogContent className="sm:max-w-[800px] max-h-[100vh] min-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <FilePlus className="h-5 w-5 text-primary" />
                            Nhập người dùng từ file
                        </DialogTitle>
                        <DialogDescription>
                            Tải lên file Excel hoặc CSV chứa thông tin người dùng để nhập vào hệ thống
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6">
                        {!file && !isProcessing ? (
                            <div className="space-y-6">
                                <div
                                    className="border-2 border-dashed rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                                    <div className="space-y-2">
                                        <h3 className="font-medium">Kéo thả file hoặc nhấp để tải lên</h3>
                                        <p className="text-sm text-muted-foreground">Hỗ trợ định dạng .xlsx, .xls, .csv (tối đa 5MB)</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            fileInputRef.current?.click()
                                        }}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Chọn file
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="text-sm font-medium">Hướng dẫn nhập liệu</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <p className="font-medium">Cấu trúc file:</p>
                                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                                <li>Dòng đầu tiên là tiêu đề cột</li>
                                                <li>Các cột bắt buộc: ID, Email, Name, Phone</li>
                                                <li>Các cột tùy chọn: Role, Department</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-medium">Quy định dữ liệu:</p>
                                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                                <li>ID phải là duy nhất trong hệ thống</li>
                                                <li>Email phải đúng định dạng và duy nhất</li>
                                                <li>Số điện thoại phải đúng định dạng Việt Nam</li>
                                                <li>Role (nếu có) phải là: ADMIN, TEACHER hoặc STUDENT</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Tải xuống mẫu nhập liệu
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : isUploading || isProcessing ? (
                            <div className="py-10 space-y-6 text-center">
                                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                                <div className="space-y-2">
                                    <h3 className="font-medium text-lg">
                                        {isUploading ? "Đang tải lên file..." : "Đang xử lý dữ liệu..."}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isUploading
                                            ? "Vui lòng đợi trong khi chúng tôi tải lên file của bạn."
                                            : "Đang kiểm tra và xác thực dữ liệu từ file."}
                                    </p>
                                </div>
                                <div className="w-full max-w-md mx-auto space-y-2">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-xs text-muted-foreground">{progress}% hoàn thành</p>
                                </div>
                            </div>
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid grid-cols-3 mb-4">
                                    <TabsTrigger value="overview" className="flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        <span>Tổng quan</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="valid" className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Hợp lệ</span>
                                        <Badge variant="secondary">{validCount}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="errors" className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span>Lỗi</span>
                                        <Badge variant="secondary">{errorCount + duplicateCount}</Badge>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-muted/50 rounded-lg p-4 border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Tổng số bản ghi</p>
                                                    <p className="text-2xl font-bold">{totalRecords}</p>
                                                </div>
                                                <FileSpreadsheet className="h-8 w-8 text-muted-foreground/70" />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">Từ file: {file?.name}</p>
                                        </div>

                                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm text-green-600">Bản ghi hợp lệ</p>
                                                    <p className="text-2xl font-bold text-green-600">{validCount}</p>
                                                </div>
                                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                                            </div>
                                            <p className="text-xs text-green-600/70 mt-2">
                                                {validCount > 0 ? `${validCount} bản ghi sẵn sàng để nhập` : "Không có bản ghi hợp lệ"}
                                            </p>
                                        </div>

                                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm text-red-600">Bản ghi lỗi</p>
                                                    <p className="text-2xl font-bold text-red-600">{errorCount + duplicateCount}</p>
                                                </div>
                                                <FileWarning className="h-8 w-8 text-red-500" />
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                                                    {errorCount} lỗi định dạng
                                                </Badge>
                                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                                    {duplicateCount} trùng lặp
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {(errorCount > 0 || duplicateCount > 0) && (
                                        <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Phát hiện lỗi trong file</AlertTitle>
                                            <AlertDescription>
                                                Có {errorCount + duplicateCount} bản ghi có lỗi và sẽ không được nhập. Bạn có thể tiếp tục nhập{" "}
                                                {validCount} bản ghi hợp lệ hoặc hủy để sửa file.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="rounded-lg border overflow-hidden">
                                        <div className="bg-muted/50 p-3 border-b">
                                            <h3 className="font-medium">Thông tin file</h3>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-2">
                                                    <p className="flex justify-between">
                                                        <span className="text-muted-foreground">Tên file:</span>
                                                        <span className="font-medium">{file?.name}</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span className="text-muted-foreground">Kích thước:</span>
                                                        <span className="font-medium">
                                                            {(file?.size || 0) / 1024 < 1024
                                                                ? `${Math.round(((file?.size || 0) / 1024) * 100) / 100} KB`
                                                                : `${Math.round(((file?.size || 0) / 1024 / 1024) * 100) / 100} MB`}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="flex justify-between">
                                                        <span className="text-muted-foreground">Loại file:</span>
                                                        <span className="font-medium">{file?.type || "Unknown"}</span>
                                                    </p>
                                                    <p className="flex justify-between">
                                                        <span className="text-muted-foreground">Ngày tải lên:</span>
                                                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="valid">
                                    <div className="rounded-lg border overflow-hidden">
                                        <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                            <h3 className="font-medium">Danh sách bản ghi hợp lệ ({validCount})</h3>
                                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                                Sẵn sàng nhập
                                            </Badge>
                                        </div>
                                        <ScrollArea className="h-[300px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[60px]">STT</TableHead>
                                                        <TableHead>ID</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Họ tên</TableHead>
                                                        <TableHead>Số điện thoại</TableHead>
                                                        <TableHead>Vai trò</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {validRecords.length > 0 ? (
                                                        validRecords.map((record, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                                <TableCell>{record.id || "—"}</TableCell>
                                                                <TableCell>{record.email}</TableCell>
                                                                <TableCell>{record.name}</TableCell>
                                                                <TableCell>{record.phoneNumber || "—"}</TableCell>
                                                                {/* <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        record.role === "ADMIN"
                                                                            ? "bg-purple-50 text-purple-600 border-purple-200"
                                                                            : record.role === "TEACHER"
                                                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                                                : "bg-green-50 text-green-600 border-green-200"
                                                                    }
                                                                >
                                                                    {record.role === "ADMIN"
                                                                        ? "Quản trị viên"
                                                                        : record.role === "TEACHER"
                                                                            ? "Giảng viên"
                                                                            : "Sinh viên"}
                                                                </Badge>
                                                            </TableCell> */}
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                                                Không có bản ghi hợp lệ
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                </TabsContent>

                                <TabsContent value="errors" className="space-y-4">
                                    {validationErrors.length > 0 && (
                                        <div className="rounded-lg border overflow-hidden">
                                            <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                                <h3 className="font-medium">Lỗi định dạng ({validationErrors.length})</h3>
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                                                    Cần sửa lỗi
                                                </Badge>
                                            </div>
                                            <ScrollArea className="h-[200px]">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[60px]">Dòng</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead>Lỗi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {validationErrors.map((error, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell className="font-medium">{error.row}</TableCell>
                                                                <TableCell>{error.email}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        {error.errors.map((err, i) => (
                                                                            <Badge
                                                                                key={i}
                                                                                variant="outline"
                                                                                className="bg-red-50 text-red-600 border-red-200 w-fit"
                                                                            >
                                                                                {err}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>
                                        </div>
                                    )}

                                    {duplicateErrors.length > 0 && (
                                        <div className="rounded-lg border overflow-hidden">
                                            <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                                <h3 className="font-medium">Lỗi trùng lặp ({duplicateErrors.length})</h3>
                                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                                    Không thể nhập
                                                </Badge>
                                            </div>
                                            <ScrollArea className="h-[200px]">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[40px]">Dòng</TableHead>
                                                            <TableHead>ID</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead>Họ tên</TableHead>
                                                            <TableHead>Số điện thoại</TableHead>
                                                            <TableHead>Loại trùng lặp</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {duplicateErrors.map((error, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell className="font-medium">{error.row}</TableCell>
                                                                <TableCell>{error.id || "—"}</TableCell>
                                                                <TableCell>{error.email}</TableCell>
                                                                <TableCell>{error.name || "—"}</TableCell>
                                                                <TableCell>{error.phone || "—"}</TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            error.type === "file"
                                                                                ? "bg-orange-50 text-orange-600 border-orange-200"
                                                                                : "bg-red-50 text-red-600 border-red-200"
                                                                        }
                                                                    >
                                                                        {error.type === "file" ? "Trùng trong file" : "Đã tồn tại trong hệ thống"}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>
                                        </div>
                                    )}

                                    {validationErrors.length === 0 && duplicateErrors.length === 0 && (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <CheckCircle2 className="h-10 w-10 mx-auto mb-4 text-green-500" />
                                            <p>Không có lỗi nào được phát hiện</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>

                    <Separator className="mt-4" />

                    <DialogFooter className="p-6 pt-4">
                        {!file || isUploading || isProcessing ? (
                            <>
                                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading || isProcessing}>
                                    Hủy
                                </Button>
                                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading || isProcessing}>
                                    <Upload className="h-4 w-4" />
                                    Chọn file
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetState()
                                        fileInputRef.current?.click()
                                    }}
                                    disabled={isImporting}
                                >
                                    <X className="h-4 w-4" />
                                    Chọn file khác
                                </Button>
                                <Button onClick={handleImport} disabled={validRecords.length === 0 || isImporting}>
                                    <Save className="h-4 w-4" />
                                    {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isImporting ? "Đang lưu..." : "Lưu"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ImportUsersModal

