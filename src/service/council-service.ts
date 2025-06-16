import type { CreateCouncilRequest } from "@/models/council"
import axiosClient from "@/utils/axiosClient"

const BASE_URL = import.meta.env.VITE_BASE_URL

interface GetAllParams {
    page?: number
    size?: number
    q?: string
    type?: string
    status?: string
    sort?: string
    order?: string
    delFlag?: boolean
    isAdmin?: boolean
}

interface ExportParams {
    q?: string
    type?: string
    status?: string
    sort?: string
    order?: string
    startDate?: string
    endDate?: string
    delFlag?: boolean
    isAdmin?: boolean
    includeMembers?: boolean
    includeTopics?: boolean
    selectedIds?: number[]
}

export class CouncilService {
    static async getAll(params: GetAllParams) {
        return axiosClient.get(`${BASE_URL}councils`, { params })
    }

    static async getById(id: number) {
        return axiosClient.get(`${BASE_URL}councils/${id}`)
    }

    static async create(data: CreateCouncilRequest) {
        return axiosClient.post(`${BASE_URL}councils`, data)
    }

    static async update(id: number, data: CreateCouncilRequest) {
        return axiosClient.put(`${BASE_URL}councils/${id}`, data)
    }

    static async delete(id: number) {
        return axiosClient.delete(`${BASE_URL}councils/${id}`)
    }

    static async exportToExcel(params: ExportParams) {
        return axiosClient.get(`${BASE_URL}councils/export`, {
            params: {
                ...params,
                selectedIds: params.selectedIds ? params.selectedIds.join(",") : undefined,
            },
            responseType: "blob",
        })
    }

    static async getApprovedTopicsByCouncil(id: number) {
        return axiosClient.get(`${BASE_URL}councils/${id}/approved-topics`)
    }
}
