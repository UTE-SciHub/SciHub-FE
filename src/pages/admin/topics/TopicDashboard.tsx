import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts"
import {
    Users,
    FileText,
    TrendingUp,
    Calendar,
    Target,
    Clock,
    Award,
    AlertCircle,
    BarChart3,
    Activity,
    Download,
} from "lucide-react"
import { DashboardService } from "@/service/dashboard-service"
import { type TopicMemberRole, getName as getRoleName } from "@/models/enums/topic-member-role.enum"
import { MetricCard } from "@/components/dashboard/metric-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { DashboardSkeleton } from "@/components/dashboard/loading-skeleton"

const ROLE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
const monthLabels = [
    "",
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
]

const PROGRESS_COLORS = {
    ON_TRACK: "#10b981", // green
    BEHIND: "#ef4444", // red
    AHEAD: "#3b82f6", // blue
}

const PROGRESS_LABELS = {
    ON_TRACK: "Đúng tiến độ",
    BEHIND: "Chậm tiến độ",
    AHEAD: "Vượt tiến độ",
}

export default function TopicDashboard() {
    const [year, setYear] = useState(2025)
    const [data, setData] = useState({
        participantsByRole: [],
        topicRegistrations: [],
    })
    const [progressData, setProgressData] = useState({
        progressStatus: [],
        totalActiveTopics: 0,
        milestonesForGantt: [],
        totalMilestones: 0,
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        Promise.all([DashboardService.getResearchProcess(year), DashboardService.getTopicProgress(year)])
            .then(([res, progressRes]) => {
                setData(res)
                setProgressData(progressRes)
            })
            .finally(() => setLoading(false))
    }, [year])

    // Calculate metrics
    const totalParticipants = data.participantsByRole.reduce((sum, item) => sum + item.count, 0)
    const totalRegistrations = data.topicRegistrations.reduce((sum, item) => sum + item.count, 0)
    const completionRate =
        progressData.totalActiveTopics > 0
            ? Math.round(
                ((progressData.progressStatus.find((p) => p.progressStatus === "ON_TRACK")?.count || 0) /
                    progressData.totalActiveTopics) *
                100,
            )
            : 0

    // Prepare full 12 months with default 0
    const fullMonthData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1
        const found = data.topicRegistrations.find((item) => item.month === month && item.year === year)
        return {
            month,
            year,
            count: found ? found.count : 0,
            label: monthLabels[month],
        }
    })

    // Prepare milestone progress data
    const milestoneBarData = progressData.milestonesForGantt
        .slice(0, 10) // Show top 10 milestones
        .map((m) => ({
            name: m.milestoneName.length > 30 ? `${m.milestoneName.substring(0, 30)}...` : m.milestoneName,
            fullName: `${m.topicName} - ${m.milestoneName}`,
            progress: m.progressPercent,
            topic: m.topicName,
        }))

    if (loading) {
        return <DashboardSkeleton />
    }

    return (
        <div className="">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Thống kê</h1>
                        <p className="text-gray-600">Tổng quan về tình hình nghiên cứu khoa học</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <Select value={year.toString()} onValueChange={(value) => setYear(Number(value))}>
                                <SelectTrigger className="w-32 bg-white shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2023, 2024, 2025, 2026].map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" className="bg-white shadow-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Xuất báo cáo
                        </Button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Tổng thành viên"
                        value={totalParticipants}
                        subtitle="Tham gia nghiên cứu"
                        icon={Users}
                        color="blue"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <MetricCard
                        title="Đề tài đăng ký"
                        value={totalRegistrations}
                        subtitle={`Trong năm ${year}`}
                        icon={FileText}
                        color="green"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <MetricCard
                        title="Đề tài hoạt động"
                        value={progressData.totalActiveTopics}
                        subtitle="Đang thực hiện"
                        icon={Activity}
                        color="purple"
                    />
                    <MetricCard
                        title="Tỷ lệ hoàn thành"
                        value={`${completionRate}%`}
                        subtitle="Đúng tiến độ"
                        icon={Target}
                        color="orange"
                        trend={{ value: 5, isPositive: true }}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Participants by Role */}
                    <ChartCard title="Phân bố thành viên theo vai trò" subtitle="Tổng quan về cơ cấu nhân sự" icon={Users}>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={data.participantsByRole}
                                    dataKey="count"
                                    nameKey="role"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    innerRadius={60}
                                    paddingAngle={2}
                                    label={({ role, percent }) =>
                                        `${getRoleName(role as TopicMemberRole)}: ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {data.participantsByRole.map((entry, idx) => (
                                        <Cell
                                            key={`cell-${idx}`}
                                            fill={ROLE_COLORS[idx % ROLE_COLORS.length]}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value, name) => [value, getRoleName(name as TopicMemberRole)]}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                                <Legend
                                    formatter={(value) => getRoleName(value as TopicMemberRole)}
                                    wrapperStyle={{ paddingTop: "20px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Topic Registrations by Month */}
                    <ChartCard title="Đăng ký đề tài theo tháng" subtitle={`Xu hướng đăng ký trong năm ${year}`} icon={BarChart3}>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={fullMonthData}>
                                <defs>
                                    <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" interval={0} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRegistrations)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Progress Status Overview */}
                    <ChartCard title="Tình hình tiến độ đề tài" subtitle="Phân tích trạng thái thực hiện" icon={TrendingUp}>
                        {progressData.progressStatus.length === 0 || progressData.totalActiveTopics === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[350px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <TrendingUp className="h-16 w-16 text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Chưa có dữ liệu tiến độ</p>
                                <p className="text-gray-500 text-sm text-center">
                                    Dữ liệu tiến độ sẽ hiển thị khi có đề tài đang hoạt động
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {/* Progress Status Cards */}
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-700 text-xs font-semibold uppercase tracking-wide">Vượt tiến độ</p>
                                                <p className="text-2xl font-bold text-green-900">
                                                    {progressData.progressStatus.find((p) => p.progressStatus === "AHEAD")?.count || 0}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                                                <TrendingUp className="h-5 w-5 text-green-700" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-green-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${progressData.totalActiveTopics > 0
                                                                ? (
                                                                    (progressData.progressStatus.find((p) => p.progressStatus === "AHEAD")?.count ||
                                                                        0) / progressData.totalActiveTopics
                                                                ) * 100
                                                                : 0
                                                            }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-700 text-xs font-semibold uppercase tracking-wide">Đúng tiến độ</p>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {progressData.progressStatus.find((p) => p.progressStatus === "ON_TRACK")?.count || 0}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                                                <Target className="h-5 w-5 text-blue-700" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${progressData.totalActiveTopics > 0
                                                                ? (
                                                                    (progressData.progressStatus.find((p) => p.progressStatus === "ON_TRACK")?.count ||
                                                                        0) / progressData.totalActiveTopics
                                                                ) * 100
                                                                : 0
                                                            }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-red-700 text-xs font-semibold uppercase tracking-wide">Chậm tiến độ</p>
                                                <p className="text-2xl font-bold text-red-900">
                                                    {progressData.progressStatus.find((p) => p.progressStatus === "BEHIND")?.count || 0}
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                                                <AlertCircle className="h-5 w-5 text-red-700" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-red-200 rounded-full h-2">
                                                <div
                                                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${progressData.totalActiveTopics > 0
                                                                ? (
                                                                    (progressData.progressStatus.find((p) => p.progressStatus === "BEHIND")?.count ||
                                                                        0) / progressData.totalActiveTopics
                                                                ) * 100
                                                                : 0
                                                            }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Donut Chart */}
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={progressData.progressStatus
                                                .filter((item) => item.count > 0)
                                                .map((item) => ({
                                                    ...item,
                                                    name: PROGRESS_LABELS[item.progressStatus] || item.progressStatus,
                                                }))}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            innerRadius={40}
                                            paddingAngle={2}
                                            label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {progressData.progressStatus
                                                .filter((item) => item.count > 0)
                                                .map((entry, idx) => (
                                                    <Cell
                                                        key={`cell-${idx}`}
                                                        fill={PROGRESS_COLORS[entry.progressStatus] || "#8b5cf6"}
                                                        stroke="#fff"
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value, name) => [`${value} đề tài`, name]}
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "none",
                                                borderRadius: "8px",
                                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-800 font-medium">Tổng số đề tài đang hoạt động</span>
                                        <span className="text-2xl font-bold text-blue-900">{progressData.totalActiveTopics}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </ChartCard>

                    {/* Milestone Progress */}
                    <ChartCard
                        title="Tiến độ các mốc quan trọng"
                        subtitle={`${progressData.totalMilestones} mốc đang theo dõi`}
                        icon={Clock}
                        className="lg:col-span-1"
                    >
                        {progressData.milestonesForGantt.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[350px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <Clock className="h-16 w-16 text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium mb-2">Chưa có mốc nào</p>
                                <p className="text-gray-500 text-sm text-center">Các mốc quan trọng sẽ hiển thị khi được tạo</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                                        <div className="text-center">
                                            <p className="text-green-700 text-xs font-semibold uppercase tracking-wide">Hoàn thành 100%</p>
                                            <p className="text-xl font-bold text-green-900">
                                                {progressData.milestonesForGantt.filter((m) => m.progressPercent === 100).length}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200">
                                        <div className="text-center">
                                            <p className="text-yellow-700 text-xs font-semibold uppercase tracking-wide">Đang thực hiện</p>
                                            <p className="text-xl font-bold text-yellow-900">
                                                {
                                                    progressData.milestonesForGantt.filter(
                                                        (m) => m.progressPercent > 0 && m.progressPercent < 100,
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Milestone List */}
                                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                                    {progressData.milestonesForGantt.map((milestone, index) => (
                                        <div
                                            key={milestone.milestoneId}
                                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 text-sm">
                                                        {milestone.milestoneName.length > 40
                                                            ? `${milestone.milestoneName.substring(0, 40)}...`
                                                            : milestone.milestoneName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {milestone.topicName.length > 50
                                                            ? `${milestone.topicName.substring(0, 50)}...`
                                                            : milestone.topicName}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <span
                                                        className={`text-lg font-bold ${milestone.progressPercent === 100
                                                                ? "text-green-600"
                                                                : milestone.progressPercent >= 50
                                                                    ? "text-blue-600"
                                                                    : "text-yellow-600"
                                                            }`}
                                                    >
                                                        {milestone.progressPercent}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${milestone.progressPercent === 100
                                                            ? "bg-green-500"
                                                            : milestone.progressPercent >= 50
                                                                ? "bg-blue-500"
                                                                : "bg-yellow-500"
                                                        }`}
                                                    style={{ width: `${milestone.progressPercent}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                                <span>Từ: {new Date(milestone.startDate).toLocaleDateString("vi-VN")}</span>
                                                <span>Đến: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {progressData.milestonesForGantt.length > 5 && (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-gray-500">
                                            Hiển thị {Math.min(5, progressData.milestonesForGantt.length)} /{" "}
                                            {progressData.milestonesForGantt.length} mốc
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ChartCard>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-medium uppercase tracking-wide">Hoàn thành xuất sắc</p>
                                    <p className="text-3xl font-bold text-green-900 mt-2">
                                        {progressData.progressStatus.find((p) => p.progressStatus === "AHEAD")?.count || 0}
                                    </p>
                                    <p className="text-green-700 text-sm mt-1">Đề tài vượt tiến độ</p>
                                </div>
                                <Award className="h-12 w-12 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-600 text-sm font-medium uppercase tracking-wide">Cần theo dõi</p>
                                    <p className="text-3xl font-bold text-orange-900 mt-2">
                                        {progressData.progressStatus.find((p) => p.progressStatus === "BEHIND")?.count || 0}
                                    </p>
                                    <p className="text-orange-700 text-sm mt-1">Đề tài chậm tiến độ</p>
                                </div>
                                <AlertCircle className="h-12 w-12 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium uppercase tracking-wide">Tổng mốc theo dõi</p>
                                    <p className="text-3xl font-bold text-blue-900 mt-2">{progressData.totalMilestones}</p>
                                    <p className="text-blue-700 text-sm mt-1">Các mốc quan trọng</p>
                                </div>
                                <Target className="h-12 w-12 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
