import { ResearchType } from "@/models/research-type";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class ResearchTypeService {
    static async create(data: ResearchType) {
        return axiosClient.post(`${BASE_URL}research-types`, data);
    }

    static async getAll(params: {
        p?: number;
        s?: number;
        q?: string;
        sort?: string;
        order?: string;
        delFlag?: boolean;
    }) {
        return axiosClient.get(`${BASE_URL}research-types`, { params });
    }

    static async getById(id: number) {
        return axiosClient.get(`${BASE_URL}research-types/${id}`);
    }

    static async update(id: number, data: ResearchType) {
        return axiosClient.put(`${BASE_URL}research-types/${id}`, data);
    }

    static async delete(id: number) {
        return axiosClient.delete(`${BASE_URL}research-types/${id}`);
    }

    static async updateStatus(id: number, isActive: boolean) {
        return axiosClient.patch(`${BASE_URL}research-types/${id}`, isActive, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}