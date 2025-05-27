export enum TopicStatus {
    DRAFT = "DRAFT",                 // Bản nháp - chưa gửi
    RETURNED = "RETURNED",           // Đã trả lại cho người tạo để chỉnh sửa
    WITHDRAWN = "WITHDRAWN",         // Tác giả rút lại đề tài
    SUBMITTED = "SUBMITTED",         // Đã gửi đăng ký
    UNDER_REVIEW = "UNDER_REVIEW",   // Đang được xem xét
    NEED_REVISION = "NEED_REVISION", // Cần chỉnh sửa
    REVIEWED = "REVIEWED",           // Đã được xem xét xong
    WAITING_FOR_ASSIGNMENT = "WAITING_FOR_ASSIGNMENT", // Chờ phân công
    ASSIGNED = "ASSIGNED",           // Đã phân công người xét duyệt
    WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL", // Chờ phê duyệt chính thức
    APPROVED = "APPROVED",           // Đã phê duyệt
    REJECTED = "REJECTED",           // Bị từ chối
    IN_CATALOG = "IN_CATALOG",       // Đã đưa vào danh mục
    IN_PROGRESS = "IN_PROGRESS",     // Đang thực hiện
    ON_HOLD = "ON_HOLD",             // Tạm dừng
    SUSPENDED = "SUSPENDED",         // Đình chỉ
    COMPLETED = "COMPLETED",         // Hoàn thành
    FAILED = "FAILED",               // Thất bại
    EXPIRED = "EXPIRED",             // Quá hạn
    CANCELLED = "CANCELLED",         // Bị huỷ
    ARCHIVED = "ARCHIVED",           // Đã lưu trữ
    DELETED = "DELETED",             // Đã xóa
    ALL = "ALL",                     // Tất cả trạng thái (dùng cho filter)
}

export function getBadge(status: TopicStatus): string {
    switch (status) {
        case TopicStatus.DRAFT: return "Bản nháp";
        case TopicStatus.RETURNED: return "Bị trả lại";
        case TopicStatus.WITHDRAWN: return "Đã rút";
        case TopicStatus.SUBMITTED: return "Đã gửi đăng ký";
        case TopicStatus.UNDER_REVIEW: return "Đang xem xét";
        case TopicStatus.NEED_REVISION: return "Cần chỉnh sửa";
        case TopicStatus.REVIEWED: return "Đã xem xét";
        case TopicStatus.WAITING_FOR_ASSIGNMENT: return "Chờ phân công";
        case TopicStatus.ASSIGNED: return "Đã phân công";
        case TopicStatus.WAITING_FOR_APPROVAL: return "Chờ phê duyệt";
        case TopicStatus.APPROVED: return "Đã phê duyệt";
        case TopicStatus.REJECTED: return "Bị từ chối";
        case TopicStatus.IN_CATALOG: return "Đã vào danh mục";
        case TopicStatus.IN_PROGRESS: return "Đang thực hiện";
        case TopicStatus.ON_HOLD: return "Tạm dừng";
        case TopicStatus.SUSPENDED: return "Đình chỉ";
        case TopicStatus.COMPLETED: return "Hoàn thành";
        case TopicStatus.FAILED: return "Thất bại";
        case TopicStatus.EXPIRED: return "Hết hạn";
        case TopicStatus.CANCELLED: return "Bị huỷ";
        case TopicStatus.ARCHIVED: return "Lưu trữ";
        case TopicStatus.DELETED: return "Đã xóa";
        case TopicStatus.ALL: return "Tất cả trạng thái";
        default: return "Không xác định";
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
        [TopicStatus.DRAFT]: "bg-indigo-200 text-indigo-800",
        [TopicStatus.RETURNED]: "bg-orange-200 text-orange-800",
        [TopicStatus.WITHDRAWN]: "bg-amber-200 text-amber-800",
        [TopicStatus.SUBMITTED]: "bg-blue-300 text-blue-800",
        [TopicStatus.UNDER_REVIEW]: "bg-blue-200 text-blue-800",
        [TopicStatus.NEED_REVISION]: "bg-yellow-200 text-yellow-800",
        [TopicStatus.REVIEWED]: "bg-sky-200 text-sky-800",
        [TopicStatus.WAITING_FOR_ASSIGNMENT]: "bg-violet-200 text-violet-800",
        [TopicStatus.ASSIGNED]: "bg-orange-200 text-orange-800",
        [TopicStatus.WAITING_FOR_APPROVAL]: "bg-teal-200 text-teal-800",
        [TopicStatus.APPROVED]: "bg-green-200 text-green-800",
        [TopicStatus.REJECTED]: "bg-red-200 text-red-800",
        [TopicStatus.IN_CATALOG]: "bg-purple-200 text-purple-800",
        [TopicStatus.IN_PROGRESS]: "bg-cyan-200 text-cyan-800",
        [TopicStatus.ON_HOLD]: "bg-yellow-100 text-yellow-700",
        [TopicStatus.SUSPENDED]: "bg-rose-200 text-rose-800",
        [TopicStatus.COMPLETED]: "bg-emerald-200 text-emerald-800",
        [TopicStatus.FAILED]: "bg-red-300 text-red-900",
        [TopicStatus.EXPIRED]: "bg-gray-400 text-gray-900",
        [TopicStatus.CANCELLED]: "bg-pink-200 text-pink-800",
        [TopicStatus.ARCHIVED]: "bg-gray-300 text-gray-700",
        [TopicStatus.DELETED]: "bg-gray-500 text-white",
        [TopicStatus.ALL]: "bg-gray-200 text-gray-800",
    };
    return `${classes[status] || "bg-gray-200 text-gray-800"} px-2 py-1 rounded`;
};

export const getStatusColorHex = (status: string): string => {
    const colors: Record<TopicStatus, string> = {
        [TopicStatus.DRAFT]: "#6366F1",
        [TopicStatus.RETURNED]: "#FB923C",
        [TopicStatus.WITHDRAWN]: "#FBBF24",
        [TopicStatus.SUBMITTED]: "#3B82F6",
        [TopicStatus.UNDER_REVIEW]: "#93C5FD",
        [TopicStatus.NEED_REVISION]: "#F59E0B",
        [TopicStatus.REVIEWED]: "#60A5FA",
        [TopicStatus.WAITING_FOR_ASSIGNMENT]: "#A78BFA",
        [TopicStatus.ASSIGNED]: "#FCD34D",
        [TopicStatus.WAITING_FOR_APPROVAL]: "#2DD4BF",
        [TopicStatus.APPROVED]: "#22C55E",
        [TopicStatus.REJECTED]: "#EF4444",
        [TopicStatus.IN_CATALOG]: "#A855F7",
        [TopicStatus.IN_PROGRESS]: "#06B6D4",
        [TopicStatus.ON_HOLD]: "#EAB308",
        [TopicStatus.SUSPENDED]: "#F87171",
        [TopicStatus.COMPLETED]: "#10B981",
        [TopicStatus.FAILED]: "#DC2626",
        [TopicStatus.EXPIRED]: "#9CA3AF",
        [TopicStatus.CANCELLED]: "#EC4899",
        [TopicStatus.ARCHIVED]: "#9CA3AF",
        [TopicStatus.DELETED]: "#6B7280",
        [TopicStatus.ALL]: "#D1D5DB",
    };

    return colors[status as TopicStatus] || "#E5E7EB";
};

export const statusColors: { [key in TopicStatus]: string } = {
    [TopicStatus.DRAFT]: "#6366F1",               // Indigo-500
    [TopicStatus.RETURNED]: "#FB923C",            // Orange-400
    [TopicStatus.WITHDRAWN]: "#FBBF24",           // Amber-400
    [TopicStatus.SUBMITTED]: "#3B82F6",           // Blue-500
    [TopicStatus.UNDER_REVIEW]: "#93C5FD",        // Blue-300
    [TopicStatus.NEED_REVISION]: "#F59E0B",       // Amber-500
    [TopicStatus.REVIEWED]: "#60A5FA",            // Blue-400
    [TopicStatus.WAITING_FOR_ASSIGNMENT]: "#A78BFA", // Violet-400
    [TopicStatus.ASSIGNED]: "#EAB308",            // Yellow-500
    [TopicStatus.WAITING_FOR_APPROVAL]: "#2DD4BF",// Teal-400
    [TopicStatus.APPROVED]: "#22C55E",            // Green-500
    [TopicStatus.REJECTED]: "#EF4444",            // Red-500
    [TopicStatus.IN_CATALOG]: "#A855F7",          // Purple-500
    [TopicStatus.IN_PROGRESS]: "#06B6D4",         // Cyan-500
    [TopicStatus.ON_HOLD]: "#FACC15",             // Yellow-400
    [TopicStatus.SUSPENDED]: "#F87171",           // Rose-400
    [TopicStatus.COMPLETED]: "#10B981",           // Emerald-500
    [TopicStatus.FAILED]: "#DC2626",              // Red-600
    [TopicStatus.EXPIRED]: "#9CA3AF",             // Gray-400
    [TopicStatus.CANCELLED]: "#EC4899",           // Pink-500
    [TopicStatus.ARCHIVED]: "#9CA3AF",            // Gray-400
    [TopicStatus.DELETED]: "#6B7280",             // Gray-500
    [TopicStatus.ALL]: "#D1D5DB",                 // Gray-300
};
