import { TopicCouncil } from "@/models/topic-council";

export interface Council {
    id: number;
    name: string;
    decisionNumber: string;
    establishmentDate: string;
    startDate: string;
    endDate: string;
    notes?: string;
    topicCouncils?: TopicCouncil[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface UserMemberResponse {
    id: number;
    fullName: string;
    email: string;
}
