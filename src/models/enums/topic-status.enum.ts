export enum TopicStatus {
    DRAFT = "DRAFT",          // Bản nháp - chưa gửi
    SUBMITTED = "SUBMITTED",  // Đã gửi đăng ký
    REVIEWED = "REVIEWED",  // Đã được xem xét
    NEED_REVISION = "NEED_REVISION", // Cần chỉnh sửa sau khi review sơ bộ
    ASSIGNED = "ASSIGNED",    // Đã phân công
    APPROVED = "APPROVED",    // Đã phê duyệt
    REJECTED = "REJECTED",    // Bị từ chối
    IN_CATALOG = "IN_CATALOG", // Đã đưa vào danh mục
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
        case TopicStatus.IN_CATALOG:
            return "Đã đưa vào danh mục";
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
        [TopicStatus.DRAFT]: "bg-indigo-200 text-indigo-800 px-2 py-1 rounded",
        [TopicStatus.SUBMITTED]: "bg-blue-300 text-blue-800 px-2 py-1 rounded",
        [TopicStatus.REVIEWED]: "bg-blue-200 text-blue-800 px-2 py-1 rounded",
        [TopicStatus.NEED_REVISION]: "bg-yellow-200 text-yellow-800 px-2 py-1 rounded",
        [TopicStatus.ASSIGNED]: "bg-orange-200 text-orange-800 px-2 py-1 rounded",
        [TopicStatus.APPROVED]: "bg-green-200 text-green-800 px-2 py-1 rounded",
        [TopicStatus.REJECTED]: "bg-red-200 text-red-800 px-2 py-1 rounded",
        [TopicStatus.IN_CATALOG]: "bg-purple-200 text-purple-800 px-2 py-1 rounded",
        [TopicStatus.IN_PROGRESS]: "bg-cyan-200 text-cyan-800 px-2 py-1 rounded",
        [TopicStatus.COMPLETED]: "bg-emerald-200 text-emerald-800 px-2 py-1 rounded",
        [TopicStatus.CANCELLED]: "bg-pink-200 text-pink-800 px-2 py-1 rounded",
        [TopicStatus.DELETED]: "bg-gray-300 text-gray-800 px-2 py-1 rounded",
        [TopicStatus.ALL]: "bg-gray-200 text-gray-800 px-2 py-1 rounded",
    };
    return classes[status] || "bg-gray-200 text-gray-800 px-2 py-1 rounded";
};

export const getStatusColorHex = (status: string): string => {
    const colors: Record<TopicStatus, string> = {
        [TopicStatus.DRAFT]: "#6366F1",          // Indigo-500
        [TopicStatus.SUBMITTED]: "#3B82F6",      // Blue-500
        [TopicStatus.REVIEWED]: "#60A5FA",       // Blue-400
        [TopicStatus.NEED_REVISION]: "#F59E0B",  // Amber-500
        [TopicStatus.ASSIGNED]: "#EAB308",       // Yellow-500
        [TopicStatus.APPROVED]: "#22C55E",       // Green-500
        [TopicStatus.REJECTED]: "#EF4444",       // Red-500
        [TopicStatus.IN_CATALOG]: "#A855F7",     // Purple-500
        [TopicStatus.IN_PROGRESS]: "#06B6D4",    // Cyan-500
        [TopicStatus.COMPLETED]: "#10B981",      // Emerald-500
        [TopicStatus.CANCELLED]: "#EC4899",      // Pink-500
        [TopicStatus.DELETED]: "#6B7280",        // Gray-500
        [TopicStatus.ALL]: "#9CA3AF",            // Gray-400
    };

    return colors[status as TopicStatus] || "#E5E7EB";
};
