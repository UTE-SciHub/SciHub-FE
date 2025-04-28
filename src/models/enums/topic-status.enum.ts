export enum TopicStatus {
    DRAFT = "DRAFT",          // Bản nháp - chưa gửi
    SUBMITTED = "SUBMITTED",  // Đã gửi đăng ký
    APPROVED = "APPROVED",    // Đã phê duyệt
    REJECTED = "REJECTED",    // Bị từ chối
    IN_PROGRESS = "IN_PROGRESS", // Đang thực hiện
    COMPLETED = "COMPLETED",  // Hoàn thành
    CANCELLED = "CANCELLED",  // Bị huỷ
    ALL = "ALL",              // Tất cả trạng thái (dùng cho filter/list)
}

export function getBadge(status: TopicStatus): string {
    switch (status) {
        case TopicStatus.DRAFT:
            return "Bản nháp";
        case TopicStatus.SUBMITTED:
            return "Đã gửi đăng ký";
        case TopicStatus.APPROVED:
            return "Đã phê duyệt";
        case TopicStatus.REJECTED:
            return "Bị từ chối";
        case TopicStatus.IN_PROGRESS:
            return "Đang thực hiện";
        case TopicStatus.COMPLETED:
            return "Hoàn thành";
        case TopicStatus.CANCELLED:
            return "Bị huỷ";
        case TopicStatus.ALL:
            return "Tất cả trạng thái";
        default:
            return "Không xác định";
    }
}

export function getAllStatuses(): { value: TopicStatus, label: string }[] {
    return Object.values(TopicStatus).map((status) => ({
        value: status,
        label: getBadge(status as TopicStatus),
    }));
}
