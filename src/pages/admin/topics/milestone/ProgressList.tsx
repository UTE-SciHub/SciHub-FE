import React from "react"
import type { Progress } from "@/models/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateString } from "@/utils/dateTimeFormat"
import { FileText, Download, Pencil, Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProgressListProps {
    progressReports: Progress[]
    onEdit?: (progress: Progress) => void
    onDelete?: (progressId: number) => void
    isReadOnly?: boolean
}

const ProgressList: React.FC<ProgressListProps> = ({ progressReports, onEdit, onDelete, isReadOnly = false }) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
    const [progressToDelete, setProgressToDelete] = React.useState<number | null>(null)

    const handleDeleteClick = (progressId: number) => {
        setProgressToDelete(progressId)
        setDeleteConfirmOpen(true)
    }

    const confirmDelete = () => {
        if (progressToDelete && onDelete) {
            onDelete(progressToDelete)
        }
        setDeleteConfirmOpen(false)
    }

    const sortedProgressReports = [...progressReports].sort(
        (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime(),
    )

    if (sortedProgressReports.length === 0) {
        return <div className="text-center py-8 text-gray-500">Chưa có báo cáo tiến độ nào cho giai đoạn này</div>
    }

    return (
        <div className="space-y-4">
            {sortedProgressReports.map((progress) => (
                <Card key={progress.id} className="border border-gray-200">
                    <CardContent className="p-4">
                        <div className="flex flex-col space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    <Badge
                                        className={`${progress.progressPercent >= 100
                                            ? "bg-green-100 text-green-800"
                                            : progress.progressPercent >= 50
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-amber-100 text-amber-800"
                                            }`}
                                    >
                                        {progress.progressPercent}% hoàn thành
                                    </Badge>
                                    <span className="text-sm text-gray-500">{formatDateString(progress.createdAt || "")}</span>
                                </div>
                                {!isReadOnly && (
                                    <div className="flex space-x-2">
                                        {onEdit && (
                                            <Button variant="ghost" size="sm" onClick={() => onEdit(progress)} className="h-8 px-2">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Chỉnh sửa</span>
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(progress.id!)}
                                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Xóa</span>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="text-sm whitespace-pre-line">{progress.report}</div>

                            {progress.documentUrl && (
                                <div className="flex items-center mt-2">
                                    <FileText className="h-4 w-4 mr-1 text-blue-600" />
                                    <a
                                        href={progress.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center"
                                    >
                                        Tài liệu đính kèm
                                        <Download className="h-3 w-3 ml-1" />
                                    </a>
                                </div>
                            )}

                            {progress.createdBy && (
                                <div className="text-xs text-gray-500 mt-2">Người báo cáo: {progress.createdBy}</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa báo cáo</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa báo cáo tiến độ này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default ProgressList
