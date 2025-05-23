import { format, formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export const formatDate = (date: Date | null) => {
    if (!date) return "Chưa cập nhật"
    try {
        return format(date, "dd/MM/yyyy", { locale: vi })
    } catch {
        return "Ngày không hợp lệ"
    }
}

export const formatDateString = (dateString: string | null) => {
    if (!dateString) return "Chưa cập nhật"
    try {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
    } catch (error) {
        return "Ngày không hợp lệ"
    }
}

export const formatDateTime = (date: Date | null) => {
    if (!date) return "Chưa cập nhật"
    try {
        return format(date, "dd/MM/yyyy HH:mm:ss", { locale: vi })
    } catch {
        return "Ngày không hợp lệ"
    }
}

export const formatDateTimeString = (dateString: string | null) => {
    if (!dateString) return "Chưa cập nhật"
    try {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: vi })
    } catch (error) {
        return "Ngày không hợp lệ"
    }
}

export const formatTimeAgo = (dateString) => {
    if (!dateString) return "Chưa có"
    try {
        const date = new Date(dateString)
        return formatDistanceToNow(date, { addSuffix: true, locale: vi })
    } catch (error) {
        return "Ngày không hợp lệ"
    }
}