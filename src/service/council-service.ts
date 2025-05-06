// import { Council } from "@/models/council-model"


// /**
//  * Service xử lý các thao tác liên quan đến hội đồng
//  */
// export class CouncilService {
//     /**
//      * Lấy danh sách tất cả hội đồng
//      */
//     static async getAll(params?: {
//         p?: number
//         s?: number
//         sort?: string
//         order?: "asc" | "desc"
//         q?: string
//     }): Promise<{ data: Council[]; totalItems: number }> {
//         // Giả lập API call
//         await new Promise((resolve) => setTimeout(resolve, 500))

//         // Mặc định trả về dữ liệu mẫu
//         return {
//             data: mockCouncils,
//             totalItems: mockCouncils.length,
//         }
//     }

//     /**
//      * Lấy thông tin chi tiết của một hội đồng
//      */
//     static async getById(id: number | string): Promise<Council | null> {
//         // Giả lập API call
//         await new Promise((resolve) => setTimeout(resolve, 500))

//         const council = mockCouncils.find((c) => c.id === Number(id))
//         return council || null
//     }

//     /**
//      * Tạo hội đồng mới
//      */
//     static async create(data: CreateCouncilData): Promise<Council> {
//         // Giả lập API call
//         await new Promise((resolve) => setTimeout(resolve, 1000))

//         // Giả lập tạo hội đồng mới
//         const newCouncil: Council = {
//             id: mockCouncils.length + 1,
//             name: data.name,
//             decisionNumber: data.decisionNumber,
//             establishmentDate: data.establishmentDate,
//             startDate: data.startDate,
//             endDate: data.endDate,
//             notes: data.notes,
//         }

//         return newCouncil
//     }

//     /**
//      * Cập nhật thông tin hội đồng
//      */
//     static async update(data: UpdateCouncilData): Promise<Council> {
//         // Giả lập API call
//         await new Promise((resolve) => setTimeout(resolve, 1000))

//         // Tìm hội đồng cần cập nhật
//         const councilIndex = mockCouncils.findIndex((c) => c.id === data.id)
//         if (councilIndex === -1) {
//             throw new Error("Không tìm thấy hội đồng")
//         }

//         // Cập nhật thông tin
//         const updatedCouncil: Council = {
//             ...mockCouncils[councilIndex],
//             ...data,
//             updatedAt: new Date(),
//         }

//         return updatedCouncil
//     }

//     /**
//      * Xóa hội đồng
//      */
//     static async delete(id: number | string): Promise<boolean> {
//         // Giả lập API call
//         await new Promise((resolve) => setTimeout(resolve, 1000))

//         // Giả lập xóa thành công
//         return true
//     }
// }
