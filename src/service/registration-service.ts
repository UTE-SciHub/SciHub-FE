import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const create = async (data: FormData) => {
    return axiosClient.post(`${BASE_URL}registration-period`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const getAll = async (params: {
    p?: number;
    s?: number;
    sort?: string;
    order?: string;
    q?: string;
    status?: string;
}) => {
    return axiosClient.get(`${BASE_URL}registration-period`, { params });
};