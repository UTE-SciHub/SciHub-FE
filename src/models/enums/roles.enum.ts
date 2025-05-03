export enum Roles {
    ADMIN = "ADMIN",
    BGH = "BGH",
    PQLKHHTQT = "PQLKHHTQT",
    BCNKHOA = "BCNKHOA",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT"
}

export function getAllRoles(): { value: Roles; label: string }[] {
    return Object.values(Roles).map((role) => ({
        value: role,
        label: getRoleLabel(role),
    }));
}

export function getRoleLabel(role: Roles): string {
    switch (role) {
        case Roles.ADMIN:
            return "Quản trị viên";
        case Roles.BGH:
            return "Ban giám hiệu";
        case Roles.PQLKHHTQT:
            return "Phòng QLKH & HTQT";
        case Roles.BCNKHOA:
            return "Ban chủ nhiệm khoa";
        case Roles.TEACHER:
            return "Giảng viên";
        case Roles.STUDENT:
            return "Sinh viên";
        default:
            return "Không xác định";
    }
}