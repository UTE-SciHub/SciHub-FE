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
    startDate?: string;
    endDate?: string;
}) => {
    return axiosClient.get(`${BASE_URL}registration-period`, { params });
};

export const exportExcel = async (params) => {
    return axiosClient.get(`${BASE_URL}registration-period/export-excel`, { params, responseType: 'blob' });
}

export const getRegistrationById = async (id: string) => {
    return axiosClient.get(`${BASE_URL}registration-period/${id}`);
};

export const updateRegistration = async (id: string, data: FormData) => {
    return axiosClient.put(`${BASE_URL}registration-period/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}