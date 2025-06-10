export enum TopicStatus {
    // Giai đoạn khởi tạo
    DRAFT = "DRAFT",
    RETURNED = "RETURNED",
    WITHDRAWN = "WITHDRAWN",

    // Giai đoạn nộp và chờ xử lý
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    NEED_REVISION = "NEED_REVISION",
    REVIEWED = "REVIEWED",
    WAITING_FOR_ASSIGNMENT = "WAITING_FOR_ASSIGNMENT",
    ASSIGNED = "ASSIGNED",

    // Giai đoạn phê duyệt
    WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",

    // Giai đoạn quản lý và thực hiện
    IN_CATALOG = "IN_CATALOG",
    IN_PROGRESS = "IN_PROGRESS",
    ON_HOLD = "ON_HOLD",
    SUSPENDED = "SUSPENDED",

    // Giai đoạn nghiệm thu
    ACCEPTANCE_REQUESTED = "ACCEPTANCE_REQUESTED",
    WAITING_FOR_ACCEPTANCE = "WAITING_FOR_ACCEPTANCE",
    ACCEPTED_WITH_CONDITIONS = "ACCEPTED_WITH_CONDITIONS",
    ACCEPTED = "ACCEPTED",
    NOT_ACCEPTED = "NOT_ACCEPTED",

    // Giai đoạn kết thúc
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",

    // Sau kết thúc
    ARCHIVED = "ARCHIVED",
    DELETED = "DELETED",

    // Filter phụ trợ
    ALL = "ALL"
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
        case TopicStatus.IN_CATALOG: return "Vào danh mục";
        case TopicStatus.IN_PROGRESS: return "Đang thực hiện";
        case TopicStatus.ON_HOLD: return "Tạm dừng";
        case TopicStatus.SUSPENDED: return "Đình chỉ";

        case TopicStatus.ACCEPTANCE_REQUESTED: return "Yêu cầu nghiệm thu";
        case TopicStatus.WAITING_FOR_ACCEPTANCE: return "Chờ phân công nghiệm thu";
        case TopicStatus.ACCEPTED_WITH_CONDITIONS: return "Nghiệm thu có điều kiện";
        case TopicStatus.ACCEPTED: return "Đã nghiệm thu";
        case TopicStatus.NOT_ACCEPTED: return "Không đạt nghiệm thu";

        case TopicStatus.COMPLETED: return "Hoàn thành";
        case TopicStatus.FAILED: return "Thất bại";
        case TopicStatus.EXPIRED: return "Hết hạn";
        case TopicStatus.CANCELLED: return "Bị huỷ";
        case TopicStatus.ARCHIVED: return "Lưu trữ";
        case TopicStatus.DELETED: return "Đã xoá";
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

        [TopicStatus.ACCEPTANCE_REQUESTED]: "bg-lime-200 text-lime-800",
        [TopicStatus.WAITING_FOR_ACCEPTANCE]: "bg-amber-100 text-amber-800",
        [TopicStatus.ACCEPTED_WITH_CONDITIONS]: "bg-green-100 text-green-800",
        [TopicStatus.ACCEPTED]: "bg-green-300 text-green-900",
        [TopicStatus.NOT_ACCEPTED]: "bg-rose-300 text-rose-900",

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

        [TopicStatus.ACCEPTANCE_REQUESTED]: "#84CC16",      // Lime-500
        [TopicStatus.WAITING_FOR_ACCEPTANCE]: "#FDE68A",     // Amber-300
        [TopicStatus.ACCEPTED_WITH_CONDITIONS]: "#86EFAC",   // Green-300
        [TopicStatus.ACCEPTED]: "#4ADE80",                   // Green-400
        [TopicStatus.NOT_ACCEPTED]: "#FB7185",               // Rose-400

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
    [TopicStatus.DRAFT]: "#6366F1",
    [TopicStatus.RETURNED]: "#FB923C",
    [TopicStatus.WITHDRAWN]: "#FBBF24",
    [TopicStatus.SUBMITTED]: "#3B82F6",
    [TopicStatus.UNDER_REVIEW]: "#93C5FD",
    [TopicStatus.NEED_REVISION]: "#F59E0B",
    [TopicStatus.REVIEWED]: "#60A5FA",
    [TopicStatus.WAITING_FOR_ASSIGNMENT]: "#A78BFA",
    [TopicStatus.ASSIGNED]: "#EAB308",
    [TopicStatus.WAITING_FOR_APPROVAL]: "#2DD4BF",
    [TopicStatus.APPROVED]: "#22C55E",
    [TopicStatus.REJECTED]: "#EF4444",
    [TopicStatus.IN_CATALOG]: "#A855F7",
    [TopicStatus.IN_PROGRESS]: "#06B6D4",
    [TopicStatus.ON_HOLD]: "#FACC15",
    [TopicStatus.SUSPENDED]: "#F87171",

    [TopicStatus.ACCEPTANCE_REQUESTED]: "#84CC16",
    [TopicStatus.WAITING_FOR_ACCEPTANCE]: "#FDE68A",
    [TopicStatus.ACCEPTED_WITH_CONDITIONS]: "#86EFAC",
    [TopicStatus.ACCEPTED]: "#4ADE80",
    [TopicStatus.NOT_ACCEPTED]: "#FB7185",

    [TopicStatus.COMPLETED]: "#10B981",
    [TopicStatus.FAILED]: "#DC2626",
    [TopicStatus.EXPIRED]: "#9CA3AF",
    [TopicStatus.CANCELLED]: "#EC4899",
    [TopicStatus.ARCHIVED]: "#9CA3AF",
    [TopicStatus.DELETED]: "#6B7280",
    [TopicStatus.ALL]: "#D1D5DB",
};

