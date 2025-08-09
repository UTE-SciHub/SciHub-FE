import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    color?: "blue" | "green" | "purple" | "orange" | "red"
}

const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, color = "blue" }: MetricCardProps) {
    return (
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-90`} />
            <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        {subtitle && <p className="text-white/90 text-sm">{subtitle}</p>}
                    </div>
                    <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                        <Icon className="h-8 w-8" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
