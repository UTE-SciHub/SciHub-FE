import { z } from "zod";

export const registrationPeriodSchema = z.object({
    title: z.string().min(1, "Tiêu đề là bắt buộc"),
    decisionNumber: z.string().min(1, "Số quyết định là bắt buộc"),
    decisionFile: z.string().url("Vui lòng nhập đúng định dạng URL"),
    startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
    endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
    description: z.string().min(1, "Mô tả là bắt buộc"),
});

export type RegistrationPeriodFormValues = z.infer<typeof registrationPeriodSchema>;