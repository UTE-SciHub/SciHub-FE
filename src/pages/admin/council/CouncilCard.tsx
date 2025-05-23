import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { getCouncilTypeBadgeClass, getCouncilTypeText } from "@/models/council"
import { formatDateString } from "@/utils/dateTimeFormat"
import { CalendarCheck, CalendarClock, CalendarX, Eye, FileText, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface CouncilCardProps {
    council: any
}

export default function CouncilCard({ council }: CouncilCardProps) {
    const navigate = useNavigate()

    const getCouncilStatus = (council: any) => {
        const now = new Date()
        const startDate = new Date(council.startDate)
        const endDate = new Date(council.endDate)

        if (now < startDate) {
            return "Sắp diễn ra"
        } else if (now > endDate) {
            return "Đã kết thúc"
        } else {
            return "Đang hoạt động"
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Đang hoạt động":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang hoạt động
                    </Badge>
                )
            case "Sắp diễn ra":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                        Sắp diễn ra
                    </Badge>
                )
            case "Đã kết thúc":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Đã kết thúc
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Đang hoạt động":
                return <CalendarCheck className="h-4 w-4 text-green-600" />
            case "Sắp diễn ra":
                return <CalendarClock className="h-4 w-4 text-yellow-600" />
            case "Đã kết thúc":
                return <CalendarX className="h-4 w-4 text-gray-600" />
            default:
                return null
        }
    }

    const status = getCouncilStatus(council)
    const topicCount = council.topicCouncils?.length || 0

    return (
        <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2 border-b border-gray-100">
                <div className="flex justify-between items-start">
                    <h3
                        className="text-lg font-semibold text-primary hover:underline cursor-pointer line-clamp-2"
                        onClick={() => navigate(`/admin/councils/${council.id}/topics`)}
                    >
                        {council.name}
                    </h3>
                    <Badge variant="outline" className={getCouncilTypeBadgeClass(council.type)}>
                        {getCouncilTypeText(council.type)}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">QĐ: {council.decisionNumber}</p>
                <p className="text-sm text-muted-foreground">
                    Ngày thành lập: {formatDateString(council.establishmentDate)}
                </p>
            </CardHeader>
            <CardContent className="py-3 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                    </div>
                    <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{council.councilMembers?.length || 0} thành viên</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-muted-foreground">Bắt đầu:</p>
                        <p className="font-medium">{formatDateString(council.startDate)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Kết thúc:</p>
                        <p className="font-medium">{formatDateString(council.endDate)}</p>
                    </div>
                </div>

                {council.notes && (
                    <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
                        <p className="text-gray-700 text-sm mb-1">
                            <span className="font-medium">Ghi chú:</span> {council.notes}
                        </p>
                    </div>
                )}

                {topicCount > 0 && (
                    <div className="bg-blue-50 rounded-md p-2 border border-blue-100">
                        <p className="text-blue-700 text-sm mb-1">
                            <span className="font-medium"></span> {topicCount} đề tài cần đánh giá
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
                {council.decisionFile ? (
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                        <a href={council.decisionFile} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4" />
                            <span>Quyết định</span>
                        </a>
                    </Button>
                ) : (
                    <div></div>
                )}
                <Button
                    variant="default"
                    size="sm"
                    className="gap-1"
                    onClick={() => navigate(`/admin/councils/${council.id}/topics`)}
                >
                    <Eye className="h-4 w-4" />
                    <span>Đánh giá chủ nhiệm</span>
                </Button>
            </CardFooter>
        </Card>
    )
}
