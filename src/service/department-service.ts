import { Department } from "@/models/department";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const create = async (department: Department) => {
    return axiosClient.post(`${BASE_URL}departments`, department);
};

export const getAll = async (params: {
    p?: number;
    s?: number;
    q?: string;
    sort?: string;
    order?: string;
}) => {
    return axiosClient.get(`${BASE_URL}departments`, { params });
};

export const getById = async (id: string) => {
    return axiosClient.get(`${BASE_URL}departments/${id}`);
};

export const update = async (id: number, department: Department) => {
    return axiosClient.put(`${BASE_URL}departments/${id}`, department);
}