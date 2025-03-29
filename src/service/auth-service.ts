import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const login = async ({ email, password }) => {
    const response = await axiosClient.post(`${BASE_URL}auth/login`, { email, password });
    return response.data;
};