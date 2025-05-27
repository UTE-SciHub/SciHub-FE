export interface EvaluationDetail {
    id?: number;
    researchOverviewScore: number;
    urgencyScore: number;
    objectiveScore: number;
    approachMethodScore: number;
    contentAndTimelineScore: number;
    productScore: number;
    effectivenessScore: number;
    experienceScore: number;
    institutionCapabilityScore: number;
    budgetScore: number;
    totalScore?: number;
    additionalComments?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export const CRITERIA_DETAILS = [
    {
        id: "researchOverviewScore",
        name: "Tổng quan tình hình nghiên cứu thuộc lĩnh vực đề tài",
        minScore: 3,
        maxScore: 10
    },
    {
        id: "urgencyScore",
        name: "Tính cấp thiết của đề tài",
        minScore: 6,
        maxScore: 10
    },
    {
        id: "objectiveScore",
        name: "Mục tiêu của đề tài",
        minScore: 7,
        maxScore: 10
    },
    {
        id: "approachMethodScore",
        name: "Cách tiếp cận và phương pháp nghiên cứu",
        minScore: 3,
        maxScore: 5
    },
    {
        id: "contentAndTimelineScore",
        name: "Nội dung nghiên cứu và tiến độ thực hiện",
        minScore: 10,
        maxScore: 20
    },
    {
        id: "productScore",
        name: "Sản phẩm của đề tài",
        minScore: 12,
        maxScore: 18
    },
    {
        id: "effectivenessScore",
        name: "Hiệu quả, phương thức chuyển giao kết quả nghiên cứu và khả năng ứng dụng",
        minScore: 5,
        maxScore: 10
    },
    {
        id: "experienceScore",
        name: "Kinh nghiệm nghiên cứu, những thành tích nổi bật và năng lực quản lý",
        minScore: 3,
        maxScore: 5
    },
    {
        id: "institutionCapabilityScore",
        name: "Tiềm lực của cơ quan chủ trì đề tài",
        minScore: 3,
        maxScore: 5
    },
    {
        id: "budgetScore",
        name: "Tính hợp lý của dự toán kinh phí đề nghị",
        minScore: 3,
        maxScore: 7
    }
];

export const getTotalMinScore = () => {
    return CRITERIA_DETAILS.reduce((acc, curr) => acc + curr.minScore, 0);
};

export const getTotalMaxScore = () => {
    return CRITERIA_DETAILS.reduce((acc, curr) => acc + curr.maxScore, 0);
};

export const getTotalScore = (evaluationData: EvaluationDetail) => {
    return CRITERIA_DETAILS.reduce((acc, curr) => acc + evaluationData[curr.id], 0);
};
