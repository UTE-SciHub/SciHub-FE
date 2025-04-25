import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class TopicService {
    static async create(data: FormData) {
        return axiosClient.post(`${BASE_URL}topics`, data, {
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
    }) {
        return axiosClient.get(`${BASE_URL}topics`, { params });
    }

    static async getById(id: string) {
        return axiosClient.get(`${BASE_URL}topics/${id}`);
    }

    static async update(id: number, formData: FormData) {
        return axiosClient.put(`${BASE_URL}topics/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
}