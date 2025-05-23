import { Council } from "@/models/council"
import { Milestone } from "@/models/milestone"

export interface Review {
    id?: number
    council?: Council
    councilId?: number
    milestone?: Milestone
    milestoneId?: number
    comments: string
    delFlag?: boolean
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
}
