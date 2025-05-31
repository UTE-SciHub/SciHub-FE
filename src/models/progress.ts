import { Milestone } from "@/models/milestone"

export interface Progress {
    id?: number
    topicId: string
    milestone?: Milestone
    milestoneId: number
    progressPercent: number
    report: string
    documentUrl?: string
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
}

export const mockProgressReports: Progress[] = [
    {
        id: 1,
        topicId: "1",
        milestoneId: 1,
        progressPercent: 75,
        report: "Đã hoàn thành việc thu thập dữ liệu và phân tích sơ bộ. Đang tiến hành xây dựng mô hình thử nghiệm.",
        documentUrl: "/documents/progress-report-1.pdf",
        createdAt: "2023-06-15T08:30:00Z",
        updatedAt: "2023-06-15T08:30:00Z",
        createdBy: "Nguyễn Văn A",
    },
    {
        id: 2,
        topicId: "1",
        milestoneId: 1,
        progressPercent: 90,
        report:
            "Đã hoàn thiện mô hình thử nghiệm và tiến hành đánh giá ban đầu. Kết quả khả quan, cần điều chỉnh một số tham số để tối ưu hóa hiệu suất.",
        documentUrl: "/documents/progress-report-2.pdf",
        createdAt: "2023-06-25T10:15:00Z",
        updatedAt: "2023-06-25T10:15:00Z",
        createdBy: "Nguyễn Văn A",
    },
    {
        id: 3,
        topicId: "1",
        milestoneId: 2,
        progressPercent: 40,
        report:
            "Đã bắt đầu triển khai hệ thống trên môi trường thực tế. Gặp một số khó khăn về tích hợp với hệ thống hiện có, đang tìm giải pháp khắc phục.",
        documentUrl: "/documents/progress-report-3.pdf",
        createdAt: "2023-07-10T14:20:00Z",
        updatedAt: "2023-07-10T14:20:00Z",
        createdBy: "Nguyễn Văn A",
    },
    {
        id: 4,
        topicId: "2",
        milestoneId: 3,
        progressPercent: 60,
        report:
            "Đã hoàn thành việc thiết kế giao diện người dùng và xây dựng các chức năng cơ bản. Đang tiến hành kiểm thử và sửa lỗi.",
        documentUrl: "/documents/progress-report-4.pdf",
        createdAt: "2023-07-20T09:45:00Z",
        updatedAt: "2023-07-20T09:45:00Z",
        createdBy: "Trần Thị B",
    },
]
