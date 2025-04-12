import { UserStatus } from "@/models/enums/user-status";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getCurrentUsers = async ({ token }) => {
    const response = await axiosClient.post(`${BASE_URL}users/me`, { token });
    return response.data;
};

export const getUsers = async (params: {
    p?: number;
    s?: number;
    q?: string;
    sort?: string;
    order?: string;
    tab?: string;
}) => {
    return axiosClient.get(`${BASE_URL}users`, { params });
};

export const getUserById = async (id: string) => {
    const response = await axiosClient.get(`${BASE_URL}users/${id}`);
    return response.data;
}

export const createUser = async (user) => {
    return axiosClient.post(`${BASE_URL}users`, user);
};

export const multipleCreateUser = async (user) => {
    return axiosClient.post(`${BASE_URL}users/multiple-create`, user);
};

export const exportExcel = async (params) => {
    return axiosClient.get(`${BASE_URL}users/export-excel`, { params, responseType: 'blob' });
}

export const importUsers = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${BASE_URL}users/validate-import`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress
    });
}

export const confirmImport = async (users) => {
    return axiosClient.post(`${BASE_URL}users/confirm-import`, users);
};

export const resetPassword = async (id: string) => {
    return axiosClient.patch(`${BASE_URL}users/${id}/reset-password`);
};

export const changeStatus = async (id: string, status: UserStatus) => {
    return axiosClient.patch(`${BASE_URL}users/${id}/status-change?status=${status}`);
};