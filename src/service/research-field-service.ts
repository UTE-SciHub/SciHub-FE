import { ResearchField } from "@/models/research-field";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class ResearchFieldService {
    static async create(data: ResearchField) {
        return axiosClient.post(`${BASE_URL}research-fields`, data);
    }

    static async getAll(params: {
        p?: number;
        s?: number;
        q?: string;
        sort?: string;
        order?: string;
        delFlag?: boolean;
    }) {
        return axiosClient.get(`${BASE_URL}research-fields`, { params });
    }

    static async getById(id: number) {
        return axiosClient.get(`${BASE_URL}research-fields/${id}`);
    }

    static async update(id: number, data: ResearchField) {
        return axiosClient.put(`${BASE_URL}research-fields/${id}`, data);
    }

    static async delete(id: number) {
        return axiosClient.delete(`${BASE_URL}research-fields/${id}`);
    }

    static async updateStatus(id: number, isActive: boolean) {
        return axiosClient.patch(`${BASE_URL}research-fields/${id}`, isActive, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}