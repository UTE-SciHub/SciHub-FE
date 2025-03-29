import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getCurrentUsers = async ({ token }) => {
    const response = await axiosClient.post(`${BASE_URL}users/me`, { token });
    return response.data;
};