import { Category } from "@/models/category";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class CategoryService {
    static async create(data: Category) {
        return axiosClient.post(`${BASE_URL}categories`, data);
    }

    static async getAll(params: {
        p?: number;
        s?: number;
        q?: string;
        sort?: string;
        order?: string;
        delFlag?: boolean;
    }) {
        return axiosClient.get(`${BASE_URL}categories`, { params });
    }

    static async getById(id: number) {
        return axiosClient.get(`${BASE_URL}categories/${id}`);
    }

    static async update(id: number, data: Category) {
        return axiosClient.put(`${BASE_URL}categories/${id}`, data);
    }

    static async delete(id: number) {
        return axiosClient.delete(`${BASE_URL}categories/${id}`);
    }

    static async updateStatus(id: number, isActive: boolean) {
        return axiosClient.patch(`${BASE_URL}categories/${id}`, isActive, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}