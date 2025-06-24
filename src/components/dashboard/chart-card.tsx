import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface ChartCardProps {
    title: string
    subtitle?: string
    icon?: LucideIcon
    children: React.ReactNode
    className?: string
}

export function ChartCard({ title, subtitle, icon: Icon, children, className = "" }: ChartCardProps) {
    return (
        <Card
            className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${className}`}
        >
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                            {Icon && <Icon className="h-6 w-6 mr-2 text-primary" />}
                            {title}
                        </CardTitle>
                        {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
        </Card>
    )
}
