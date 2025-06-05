import { Topic } from "@/models/topic";

export interface Document {
    id: number;
    topic: Topic;
    documentType: string;
    filePath: string;
    publicId: string;
    uploadDate: string;
    originalFileName: string;
}

export enum DocumentType {
    REVIEW_RESULT = "Biên bản đánh giá",
    TOPIC_REGISTRATION = "Phiếu đăng ký đề tài",
    ACCEPTANCE_MINUTES = "Biên bản nghiệm thu",
    DECISION = "Quyết định",
    COMPLETION_REPORT = "Báo cáo tổng kết",
    BM_DECISION = "Quyết định BM.24-QT.01-KHCN",
    RESEARCH_PRODUCT = "Sản phẩm nghiên cứu",
    SUPPORTING_DOCUMENT = "Tài liệu bổ sung",
    APPLICATION_CERTIFICATE = "Chứng nhận áp dụng thực tế",
    ADDITIONAL_DOCUMENT = "Tài liệu khác",
    OTHER = "Khác",
}
  