import { Loader2 } from "lucide-react"
import CouncilCard from "./CouncilCard"
import type { User } from "@/models/user"

interface CouncilGridProps {
    councils: any[]
    loading?: boolean,
    currentUser?: User,
}

export default function CouncilGrid({ councils, loading = false, currentUser }: CouncilGridProps) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!councils || councils.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Không có hội đồng nào</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {councils.map((council) => (
                <CouncilCard key={council.id} council={council} currentUser={currentUser}/>
            ))}
        </div>
    )
}
