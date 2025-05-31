import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { RegistrationPeriod } from "@/models/registraion-period"
import { RegistrationService } from "@/service/registration-service"
import { toast } from "@/hooks/use-toast"
import Loading from "@/components/loading/loading"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status"
import { formatDateString } from "@/utils/dateTimeFormat"
import { renderContent } from "@/utils/util"

const getStatusVariant = (status: RegistrationPeriodStatus) => {
    switch (status) {
        case RegistrationPeriodStatus.OPEN:
            return "default"
        case RegistrationPeriodStatus.REVIEWING:
            return "secondary"
        case RegistrationPeriodStatus.CLOSED:
            return "destructive"
        default:
            return "outline"
    }
}

const getStatusText = (status: RegistrationPeriodStatus) => {
    switch (status) {
        case RegistrationPeriodStatus.OPEN:
            return "Đang diễn ra"
        case RegistrationPeriodStatus.REVIEWING:
            return "Sắp diễn ra"
        case RegistrationPeriodStatus.CLOSED:
            return "Đã kết thúc"
        default:
            return status
    }
}

export default function RegistrationPeriodDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [period, setPeriod] = useState<RegistrationPeriod>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRegistrationPeriod = async (id: string): Promise<RegistrationPeriod> => {
        const response = await RegistrationService.getRegistrationById(id)
        if (response.status !== 200) {
            toast({
                title: "Lỗi",
                description: "Không thể tải thông tin đăng ký.",
                variant: "error",
            })

            return
        }

        setPeriod(response.data.data)
    }

    useEffect(() => {
        if (id) {
            setLoading(true)
            fetchRegistrationPeriod(id).catch((error) => {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin đăng ký.",
                    variant: "error",
                })
            })
            setLoading(false)
        }
    }, [id])

    if (loading) {
        return <Loading />
    }

    if (error || !period) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <div className="text-xl font-semibold text-gray-800">{error || "Không tìm thấy thông tin đợt đăng ký"}</div>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center mb-2">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 p-2" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold ml-2">Chi tiết đợt đăng ký</h1>
            </div>

            <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 border-b pb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{period.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <Badge variant={getStatusVariant(period.status)} className="px-3 py-1 text-sm font-medium rounded-full">
                                    {getStatusText(period.status)}
                                </Badge>
                                <div className="flex items-center text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
                                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                                    Quyết định số: {period.decisionNumber}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                        {/* Thông tin thời gian */}
                        <div className="p-6 bg-white">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-primary-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                Thời gian
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Ngày bắt đầu</p>
                                    <p className="text-base font-medium mt-1 text-gray-800">{formatDateString(period.startDate)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Ngày kết thúc</p>
                                    <p className="text-base font-medium mt-1 text-gray-800">{formatDateString(period.endDate)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tệp quyết định */}
                        <div className="p-6 bg-white">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-primary-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Tệp quyết định
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {period.decisionFile ? (
                                    <div className="flex flex-col">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-primary-100 p-2 rounded-md mr-3">
                                                <FileText className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Quyết định số {period.decisionNumber}</p>
                                                <p className="text-xs text-gray-500">Tài liệu PDF</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full flex items-center justify-center gap-2 border-primary-200 text-primary-700 hover:bg-primary-50"
                                            onClick={() => window.open(period.decisionFile, "_blank")}
                                        >
                                            <Download className="h-4 w-4" />
                                            Tải xuống
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm">Không có tệp đính kèm</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="p-6 bg-white">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-primary-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Trạng thái
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className={`
                                        w-16 h-16 rounded-full flex items-center justify-center mb-3
                                        ${period.status === RegistrationPeriodStatus.OPEN
                                                ? "bg-green-100"
                                                : period.status === RegistrationPeriodStatus.REVIEWING
                                                    ? "bg-blue-100"
                                                    : "bg-red-100"
                                            }
                                    `}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`
                                            h-8 w-8
                                            ${period.status === RegistrationPeriodStatus.OPEN
                                                    ? "text-green-600"
                                                    : period.status === RegistrationPeriodStatus.REVIEWING
                                                        ? "text-blue-600"
                                                        : "text-red-600"
                                                }
                                        `}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            {period.status === RegistrationPeriodStatus.OPEN ? (
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            ) : period.status === RegistrationPeriodStatus.REVIEWING ? (
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            ) : (
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            )}
                                        </svg>
                                    </div>
                                    <p className="text-lg font-semibold">{getStatusText(period.status)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="p-6 border-t">
                        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-primary-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            Chi tiết
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                            <div className="rich-text-preview prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600">
                                {renderContent(period.description || "<p>Chưa có nội dung</p>")}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
