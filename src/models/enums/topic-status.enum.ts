export enum TopicStatus {
    DRAFT = "DRAFT",          // Bản nháp - chưa gửi
    SUBMITTED = "SUBMITTED",  // Đã gửi đăng ký
    REVIEWED = "REVIEWED",  // Đã được xem xét
    NEED_REVISION = "NEED_REVISION", // Cần chỉnh sửa sau khi review sơ bộ
    ASSIGNED = "ASSIGNED",    // Đã phân công
    APPROVED = "APPROVED",    // Đã phê duyệt
    REJECTED = "REJECTED",    // Bị từ chối
    IN_PROGRESS = "IN_PROGRESS", // Đang thực hiện
    COMPLETED = "COMPLETED",  // Hoàn thành
    CANCELLED = "CANCELLED",  // Bị huỷ
    DELETED = "DELETED",    // Đã xóa
    ALL = "ALL",              // Tất cả trạng thái (dùng cho filter/list)
}

export function getBadge(status: TopicStatus): string {
    switch (status) {
        case TopicStatus.DRAFT:
            return "Mới";
        case TopicStatus.SUBMITTED:
            return "Đã gửi đăng ký";
        case TopicStatus.REVIEWED:
            return "Đã xem xét";
        case TopicStatus.NEED_REVISION:
            return "Cần chỉnh sửa";
        case TopicStatus.ASSIGNED:
            return "Đã phân công";
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
        case TopicStatus.DELETED:
            return "Đã xóa";
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

export const getStatusClass = (status: TopicStatus): string => {
    const classes: { [key in TopicStatus]: string } = {
        [TopicStatus.DRAFT]: "bg-indigo-100 text-indigo-700 px-2 py-1 rounded",
        [TopicStatus.SUBMITTED]: "bg-blue-100 text-blue-700 px-2 py-1 rounded",
        [TopicStatus.REVIEWED]: "bg-blue-200 text-blue-700 px-2 py-1 rounded",
        [TopicStatus.NEED_REVISION]: "bg-blue-300 text-blue-700 px-2 py-1 rounded",
        [TopicStatus.ASSIGNED]: "bg-yellow-100 text-yellow-700 px-2 py-1 rounded",
        [TopicStatus.APPROVED]: "bg-green-100 text-green-700 px-2 py-1 rounded",
        [TopicStatus.REJECTED]: "bg-red-100 text-red-700 px-2 py-1 rounded",
        [TopicStatus.IN_PROGRESS]: "bg-cyan-100 text-cyan-700 px-2 py-1 rounded",
        [TopicStatus.COMPLETED]: "bg-emerald-100 text-emerald-700 px-2 py-1 rounded",
        [TopicStatus.CANCELLED]: "bg-pink-100 text-pink-700 px-2 py-1 rounded",
        [TopicStatus.DELETED]: "bg-gray-300 text-gray-700 px-2 py-1 rounded",
        [TopicStatus.ALL]: "bg-gray-100 text-gray-700 px-2 py-1 rounded",
    };
    return classes[status] || "bg-gray-100 text-gray-700 px-2 py-1 rounded";
};

export const getStatusColorHex = (status: string): string => {
    const colors: Record<TopicStatus, string> = {
        [TopicStatus.DRAFT]: "#6366f1",
        [TopicStatus.SUBMITTED]: "#3b82f6",
        [TopicStatus.REVIEWED]: "#3b82f6",
        [TopicStatus.NEED_REVISION]: "#3b82f6",
        [TopicStatus.ASSIGNED]: "#facc15",
        [TopicStatus.APPROVED]: "#22c55e",
        [TopicStatus.REJECTED]: "#ef4444",
        [TopicStatus.IN_PROGRESS]: "#06b6d4",
        [TopicStatus.COMPLETED]: "#10b981",
        [TopicStatus.CANCELLED]: "#ec4899",
        [TopicStatus.DELETED]: "#6b7280",
        [TopicStatus.ALL]: "#9ca3af",
    };

    return colors[status as TopicStatus] || "#9ca3af";
};

