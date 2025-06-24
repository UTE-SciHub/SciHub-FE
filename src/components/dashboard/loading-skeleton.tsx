import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Metrics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="shadow-lg">
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="shadow-lg">
                        <CardHeader>
                            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 bg-gray-100 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
