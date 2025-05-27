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
    OTHER = "Khác",
}
