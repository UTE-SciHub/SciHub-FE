import { z } from "zod";

export const reviewFormSchema = z.object({
    councilDate: z.string().min(1, "Vui lòng chọn ngày họp").default(new Date().toISOString().split('T')[0]),
    meetingLocation: z.string().min(1, "Vui lòng nhập địa điểm").default("Phòng họp Khoa học Công nghệ - Đại học Sư phạm Kỹ thuật Đà Nẵng"),
    councilDecisionNumber: z.string().min(1, "Vui lòng nhập số quyết định").default(""),
    totalMembers: z.number().min(1, "Tổng số thành viên phải lớn hơn 0").default(1),
    totalPresent: z.number().min(0, "Số thành viên có mặt không được âm").default(0),
    totalAbsent: z.number().min(0, "Số thành viên vắng mặt không được âm").default(0),
    guests: z.string().optional().default(""),
    approveCount: z.number().min(0, "Số phiếu tán thành không được âm").default(0),
    rejectCount: z.number().min(0, "Số phiếu không tán thành không được âm").default(0),
    approved: z.boolean().default(false),
    topicCode: z.string().min(1, "Vui lòng nhập mã đề tài").default(""),
    passedCriteria: z.array(z.string()).default([]),
    comments: z.object({
        topicName: z.string().optional().default(""),
        objectives: z.string().optional().default(""),
        content: z.string().optional().default(""),
        products: z.string().optional().default(""),
        budget: z.string().optional().default(""),
        additionalNotes: z.string().optional().default(""),
    }).default({
        topicName: "",
        objectives: "",
        content: "",
        products: "",
        budget: "",
        additionalNotes: "",
    }),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>; 