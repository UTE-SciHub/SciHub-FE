import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const login = async ({ email, password }) => {
    const response = await axiosClient.post(`${BASE_URL}auth/login`, { email, password });
    return response.data;
};

export const introspectToken = async (token) => {
    return await axiosClient.post(`${BASE_URL}auth/introspect`, { token });
}

export const refreshToken = async (refreshToken) => {
    return await axiosClient.post(`${BASE_URL}auth/refresh`, { refreshToken });
};

export const logout = async (accessToken: string) => {
    return await axiosClient.post(`${BASE_URL}auth/logout`, { token: accessToken });
};