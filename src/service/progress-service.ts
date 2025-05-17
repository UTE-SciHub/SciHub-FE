import { Progress } from "@/models/progress"
import axiosClient from "@/utils/axiosClient";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export class ProgressService {
    static async getByMilestoneId(milestoneId: number) {
        return axiosClient.get(`${BASE_URL}progress?milestoneId=${milestoneId}`)
    }

    static async getById(id: number) {
        return axiosClient.get(`${BASE_URL}progress/${id}`)
    }

    static async create(progressData: Progress, file?: File | null) {
        const formData = new FormData()

        const jsonBlob = new Blob([JSON.stringify(progressData)], {
            type: "application/json",
        });
        formData.append("data", jsonBlob)
        formData.append("file", file)

        return axiosClient.post(`${BASE_URL}progress`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    }

    static async update(id: number, progressData: Progress, file?: File | null) {
        const formData = new FormData()
        const jsonBlob = new Blob([JSON.stringify(progressData)], {
            type: "application/json",
        });
        formData.append("data", jsonBlob)

        return axiosClient.put(`${BASE_URL}progress/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    }

    static async delete(id: number) {
        return axiosClient.delete(`${BASE_URL}progress/${id}`)
    }
}
