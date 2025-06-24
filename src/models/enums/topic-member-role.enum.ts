export enum TopicMemberRole {
    INVESTIGATOR = 'INVESTIGATOR',
    MEMBER = 'MEMBER',
}

export function getName(role: TopicMemberRole): string {
    switch (role) {
        case TopicMemberRole.INVESTIGATOR:
            return 'Chủ nhiệm';
        case TopicMemberRole.MEMBER:
            return 'Thành viên';
        default:
            return 'Không xác định';
    }
}