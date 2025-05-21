import { Progress } from "@/models/progress"
import { Review } from "@/models/review"
import { Topic } from "@/models/topic"

export enum MilestoneStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
}

export interface Milestone {
    id?: number
    topic?: Topic
    topicId?: string
    description: string
    expectedCompletionDate: string
    status: MilestoneStatus
    delFlag?: boolean
    reviews?: Review[]
    progressReports?: Progress[]
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
}

export const getMilestoneStatusText = (status: MilestoneStatus): string => {
    switch (status) {
        case MilestoneStatus.PENDING:
            return "Chưa bắt đầu"
        case MilestoneStatus.IN_PROGRESS:
            return "Đang thực hiện"
        case MilestoneStatus.COMPLETED:
            return "Đã hoàn thành"
        default:
            return "Không xác định"
    }
}

export const getMilestoneStatusClass = (status: MilestoneStatus): string => {
    switch (status) {
        case MilestoneStatus.PENDING:
            return "bg-gray-100 text-gray-800 border-gray-200"
        case MilestoneStatus.IN_PROGRESS:
            return "bg-blue-100 text-blue-800 border-blue-200"
        case MilestoneStatus.COMPLETED:
            return "bg-green-100 text-green-800 border-green-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}