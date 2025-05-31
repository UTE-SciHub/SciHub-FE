import { Topic } from "@/models/topic";
import { User } from "@/models/user";

export interface TopicMember {
    id: number;
    topic: Topic;
    user: User;
    role: TopicMemberRole;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export enum TopicMemberRole {
    INVESTIGATOR = 'INVESTIGATOR',
    MEMBER = 'MEMBER',
}

export const getPrincipalInvestigatorName = (topic: Topic): string => {
    const investigator = topic.members?.find(
        (m) => m.role === TopicMemberRole.INVESTIGATOR
    );

    return investigator
        ? `${investigator.user.name} - ${investigator.user.email}`
        : "Chưa có";
};
