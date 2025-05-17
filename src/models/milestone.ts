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

// Mock data for milestones
export const mockMilestones: Milestone[] = [
    {
        id: 1,
        topicId: "1",
        description: "Hoàn thành tổng quan lý thuyết",
        expectedCompletionDate: "2023-06-30",
        status: MilestoneStatus.COMPLETED,
        delFlag: false,
        createdAt: "2023-04-15T08:00:00Z",
        updatedAt: "2023-06-28T14:30:00Z",
        reviews: [
            {
                id: 1,
                councilId: 1,
                milestoneId: 1,
                comments:
                    "Tổng quan lý thuyết đầy đủ, đã bao quát được các nghiên cứu liên quan. Cần bổ sung thêm một số nghiên cứu mới nhất trong 2 năm gần đây.",
                delFlag: false,
                createdAt: "2023-07-01T10:00:00Z",
                updatedAt: "2023-07-01T10:00:00Z",
            },
        ],
    },
    {
        id: 2,
        topicId: "1",
        description: "Hoàn thành thiết kế thực nghiệm",
        expectedCompletionDate: "2023-08-31",
        status: MilestoneStatus.COMPLETED,
        delFlag: false,
        createdAt: "2023-04-15T08:05:00Z",
        updatedAt: "2023-08-25T16:45:00Z",
        reviews: [
            {
                id: 2,
                councilId: 1,
                milestoneId: 2,
                comments:
                    "Thiết kế thực nghiệm hợp lý, đã xác định rõ các biến số và phương pháp đo lường. Cần cải thiện phương pháp phân tích dữ liệu.",
                delFlag: false,
                createdAt: "2023-09-02T14:30:00Z",
                updatedAt: "2023-09-02T14:30:00Z",
            },
        ],
    },
    {
        id: 3,
        topicId: "1",
        description: "Thu thập và phân tích dữ liệu",
        expectedCompletionDate: "2023-10-31",
        status: MilestoneStatus.IN_PROGRESS,
        delFlag: false,
        createdAt: "2023-04-15T08:10:00Z",
        updatedAt: "2023-09-15T11:20:00Z",
        reviews: [],
    },
    {
        id: 4,
        topicId: "1",
        description: "Viết báo cáo kết quả",
        expectedCompletionDate: "2023-12-15",
        status: MilestoneStatus.PENDING,
        delFlag: false,
        createdAt: "2023-04-15T08:15:00Z",
        updatedAt: "2023-04-15T08:15:00Z",
        reviews: [],
    },
    {
        id: 5,
        topicId: "2",
        description: "Khảo sát hiện trạng",
        expectedCompletionDate: "2023-05-31",
        status: MilestoneStatus.COMPLETED,
        delFlag: false,
        createdAt: "2023-03-10T09:00:00Z",
        updatedAt: "2023-05-28T15:40:00Z",
        reviews: [
            {
                id: 3,
                councilId: 2,
                milestoneId: 5,
                comments:
                    "Khảo sát đầy đủ, đã bao quát được các vấn đề hiện tại. Cần bổ sung thêm phân tích về nguyên nhân của các vấn đề.",
                delFlag: false,
                createdAt: "2023-06-05T11:00:00Z",
                updatedAt: "2023-06-05T11:00:00Z",
            },
        ],
    },
    {
        id: 6,
        topicId: "2",
        description: "Đề xuất giải pháp",
        expectedCompletionDate: "2023-07-31",
        status: MilestoneStatus.COMPLETED,
        delFlag: false,
        createdAt: "2023-03-10T09:05:00Z",
        updatedAt: "2023-07-25T14:30:00Z",
        reviews: [
            {
                id: 4,
                councilId: 2,
                milestoneId: 6,
                comments:
                    "Giải pháp đề xuất khả thi, có tính ứng dụng cao. Cần làm rõ hơn về chi phí thực hiện và thời gian triển khai.",
                delFlag: false,
                createdAt: "2023-08-03T10:15:00Z",
                updatedAt: "2023-08-03T10:15:00Z",
            },
        ],
    },
    {
        id: 7,
        topicId: "2",
        description: "Triển khai thử nghiệm",
        expectedCompletionDate: "2023-09-30",
        status: MilestoneStatus.IN_PROGRESS,
        delFlag: false,
        createdAt: "2023-03-10T09:10:00Z",
        updatedAt: "2023-09-15T16:20:00Z",
        reviews: [],
    },
    {
        id: 8,
        topicId: "2",
        description: "Đánh giá kết quả và hoàn thiện",
        expectedCompletionDate: "2023-11-30",
        status: MilestoneStatus.PENDING,
        delFlag: false,
        createdAt: "2023-03-10T09:15:00Z",
        updatedAt: "2023-03-10T09:15:00Z",
        reviews: [],
    },
]

// Function to get milestones by topic ID
export const getMilestonesByTopicId = (topicId: string): Milestone[] => {
    return mockMilestones.filter((milestone) => milestone.topicId === topicId)
}

// Function to get a milestone by ID
export const getMilestoneById = (id: number): Milestone | undefined => {
    return mockMilestones.find((milestone) => milestone.id === id)
}

// Function to add a review to a milestone
export const addReviewToMilestone = (milestoneId: number, review: Review): boolean => {
    const milestone = getMilestoneById(milestoneId)
    if (!milestone) return false

    if (!milestone.reviews) {
        milestone.reviews = []
    }

    review.id = Math.max(0, ...mockMilestones.flatMap((m) => m.reviews?.map((r) => r.id || 0) || [])) + 1
    review.milestoneId = milestoneId
    review.createdAt = new Date().toISOString()
    review.updatedAt = new Date().toISOString()

    milestone.reviews.push(review)
    return true
}

// Function to add a new milestone
export const addMilestone = (milestone: Milestone): Milestone => {
    const newMilestone = {
        ...milestone,
        id: Math.max(0, ...mockMilestones.map((m) => m.id || 0)) + 1,
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        delFlag: false,
    }

    mockMilestones.push(newMilestone)
    return newMilestone
}

// Function to update a milestone
export const updateMilestone = (milestone: Milestone): boolean => {
    const index = mockMilestones.findIndex((m) => m.id === milestone.id)
    if (index === -1) return false

    mockMilestones[index] = {
        ...mockMilestones[index],
        ...milestone,
        updatedAt: new Date().toISOString(),
    }

    return true
}
