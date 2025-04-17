import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class RegistrationService {
    static async create(data: FormData) {
        return axiosClient.post(`${BASE_URL}registration-period`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    static async getAll(params: {
        p?: number;
        s?: number;
        sort?: string;
        order?: string;
        q?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }) {
        return axiosClient.get(`${BASE_URL}registration-period`, { params });
    }

    static async exportExcel(params: any) {
        return axiosClient.get(`${BASE_URL}registration-period/export-excel`, {
            params,
            responseType: "blob",
        });
    }

    static async getRegistrationById(id: string) {
        return axiosClient.get(`${BASE_URL}registration-period/${id}`);
    }

    static async updateRegistration(id: string, data: FormData) {
        return axiosClient.put(`${BASE_URL}registration-period/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
}