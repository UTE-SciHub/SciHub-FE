import { TopicCouncil } from "@/models/topic-council"
import { UserMemberResponse } from "@/models/user-member-response"

export enum CouncilMemberRole {
    CHAIRMAN = "CHAIRMAN", // Chủ tịch
    SECRETARY = "SECRETARY", // Thư ký
    REVIEWER = "REVIEWER", // Phản biện
    MEMBER = "MEMBER", // Ủy viên
}

export enum CouncilType {
    SELECT_CNDT = "SELECT_CNDT", // Hội đồng xét duyệt chủ nhiệm
    EVALUATE_TOPIC = "EVALUATE_TOPIC", // Hội đồng đánh giá
    ACCEPTANCE_JURY = "ACCEPTANCE_JURY", // Hội đồng nghiệm thu
}

export interface Council {
    id?: string
    name: string
    decisionNumber: string
    establishmentDate: string
    startDate: string
    endDate: string
    notes?: string
    type: CouncilType
    councilMembers: CouncilMember[]
    topicCouncils: TopicCouncil[]
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
}

export interface CouncilMember {
    id?: string
    userId: string
    role: CouncilMemberRole
    user?: UserMemberResponse
}

export interface CreateCouncilRequest {
    name: string
    decisionNumber: string
    establishmentDate: string
    startDate: string
    endDate: string
    notes?: string
    type: CouncilType
    members: CouncilMemberRequest[]
    topics: string[]
}

export interface CouncilMemberRequest {
    userId: string
    role: CouncilMemberRole
}

export const getCouncilTypeBadgeClass = (type: CouncilType) => {
    switch (type) {
        case CouncilType.SELECT_CNDT:
            return "bg-blue-50 text-blue-700 border-blue-200"
        case CouncilType.EVALUATE_TOPIC:
            return "bg-purple-50 text-purple-700 border-purple-200"
        case CouncilType.ACCEPTANCE_JURY:
            return "bg-green-50 text-green-700 border-green-200"
        default:
            return "bg-gray-50 text-gray-700 border-gray-200"
    }
}

export const getMemberRoleText = (role: CouncilMemberRole) => {
    switch (role) {
        case CouncilMemberRole.CHAIRMAN:
            return "Chủ tịch"
        case CouncilMemberRole.SECRETARY:
            return "Thư ký"
        case CouncilMemberRole.REVIEWER:
            return "Phản biện"
        case CouncilMemberRole.MEMBER:
            return "Ủy viên"
        default:
            return role
    }
}

export const getMemberRoleBadgeClass = (role: CouncilMemberRole) => {
    switch (role) {
        case CouncilMemberRole.CHAIRMAN:
            return "bg-red-50 text-red-700 border-red-200"
        case CouncilMemberRole.SECRETARY:
            return "bg-blue-50 text-blue-700 border-blue-200"
        case CouncilMemberRole.REVIEWER:
            return "bg-amber-50 text-amber-700 border-amber-200"
        case CouncilMemberRole.MEMBER:
            return "bg-gray-50 text-gray-700 border-gray-200"
        default:
            return "bg-gray-50 text-gray-700 border-gray-200"
    }
}

// Hàm lấy trạng thái của hội đồng
export const getCouncilStatus = (council: Council) => {
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

export const getStatusVariant = (status: string) => {
    switch (status) {
        case "Đang hoạt động":
            return "default"
        case "Đã kết thúc":
            return "destructive"
        default:
            return "secondary"
    }
}

export const getCouncilTypeText = (type: CouncilType) => {
    switch (type) {
        case CouncilType.SELECT_CNDT:
            return "Xét duyệt"
        case CouncilType.EVALUATE_TOPIC:
            return "Đánh giá"
        case CouncilType.ACCEPTANCE_JURY:
            return "Nghiệm thu"
        default:
            return type
    }
}