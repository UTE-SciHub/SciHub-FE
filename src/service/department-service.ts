import { Department } from "@/models/department";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class DepartmentService {
    static async create(data: FormData) {
        return axiosClient.post(`${BASE_URL}departments`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    static async getAll(params: {
        p?: number;
        s?: number;
        q?: string;
        sort?: string;
        order?: string;
        delFlag?: boolean;
    }) {
        return axiosClient.get(`${BASE_URL}departments`, { params });
    }

    static async getById(id: string) {
        return axiosClient.get(`${BASE_URL}departments/${id}`);
    }

    static async update(id: number, formData: FormData) {
        return axiosClient.put(`${BASE_URL}departments/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    static async exportExcel(params: {
        q?: string;
        delFlag?: boolean;
    }) {
        return axiosClient.get(`${BASE_URL}departments/export-excel`, {
            params,
            responseType: "blob",
        });
    }
}