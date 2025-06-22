import { EvaluationDetailWithMember } from "@/models/evaluation-detail";
import { Topic } from "@/models/topic";
import { UserMemberResponse } from "@/models/user-member-response";

export interface TopicApplication {
    id: number;
    topic: Topic;
    user: UserMemberResponse;
    plan: string;
    motivation: string;
    status: ApplicationStatus;
    totalScore: number | null;
    passed: boolean | null;
    notes: string;
    hasEvaluated: boolean;
    evaluationDetails?: EvaluationDetailWithMember[]
}

export enum ApplicationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    IN_PROGRESS = "IN_PROGRESS"
}