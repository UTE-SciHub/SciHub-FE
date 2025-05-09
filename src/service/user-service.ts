import { UserStatus } from "@/models/enums/user-status";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class UserService {
    static async getCurrentUsers({ token }: { token: string }) {
        const response = await axiosClient.post(`${BASE_URL}users/me`, { token });
        return response.data;
    }

    static async getUsers(params: {
        p?: number;
        s?: number;
        q?: string;
        sort?: string;
        order?: string;
        tab?: string;
    }) {
        return axiosClient.get(`${BASE_URL}users`, { params });
    }

    static async getUserById(id: string) {
        const response = await axiosClient.get(`${BASE_URL}users/${id}`);
        return response.data;
    }

    static async createUser(data: FormData) {
        return axiosClient.post(`${BASE_URL}users`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    static async multipleCreateUser(user: any) {
        return axiosClient.post(`${BASE_URL}users/multiple-create`, user);
    }

    static async exportExcel(params: any) {
        return axiosClient.get(`${BASE_URL}users/export-excel`, {
            params,
            responseType: "blob",
        });
    }

    static async importUsers(file: File, options?: {
        onUploadProgress?: (progressEvent: any) => void;
        signal?: AbortSignal;
    }) {
        const formData = new FormData();
        formData.append("file", file);
        return axiosClient.post(`${BASE_URL}users/validate-import`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: options?.onUploadProgress,
            signal: options?.signal,
        });
    }

    static async confirmImport(users: any) {
        return axiosClient.post(`${BASE_URL}users/confirm-import`, users);
    }

    static async resetPassword(id: string) {
        return axiosClient.patch(`${BASE_URL}users/${id}/reset-password`);
    }

    static async changeStatus(id: string, status: UserStatus) {
        return axiosClient.patch(`${BASE_URL}users/${id}/status-change?status=${status}`);
    }

    static async getAllUserNotStudent(params) {
        return axiosClient.get(`${BASE_URL}users/not-student`, { params });
    }
}