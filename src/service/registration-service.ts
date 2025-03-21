import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const create = async (data: FormData) => {
    return axiosClient.post(`${BASE_URL}registration-period`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};