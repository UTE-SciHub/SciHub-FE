import { TopicStatus } from "@/models/enums/topic-status.enum";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface GetTopicsParams {
    p?: number;
    s?: number;
    sort?: string;
    order?: string;
    q?: string;
    status?: string;
    departmentId?: number;
    researchTypeId?: number;
    researchFieldId?: number;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    minBudget?: number;
    investigator?: string;
}

export class TopicService {
    static async create(data: FormData) {
        return axiosClient.post(`${BASE_URL}topics`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    static async getAll(params: GetTopicsParams) {
        return axiosClient.get(`${BASE_URL}topics`, { params });
    }

    static async getById(id: string) {
        return axiosClient.get(`${BASE_URL}topics/${id}`);
    }

    static async update(id: string, formData: FormData) {
        return axiosClient.put(`${BASE_URL}topics/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    static async existsByTopicCode(topicCode: string) {
        return axiosClient.get(`${BASE_URL}topics/exists-by-topic-code?topicCode=${topicCode}`);
    }

    static async getStatistics() {
        const response = await axiosClient.get(`${BASE_URL}topics/statistics`);

        return response.data;
    }

    static async getUserTopics() {
        return axiosClient.get(`${BASE_URL}topics/my-topics`);
    }

    static async submitTopic(topicId: string, periodId: string) {
        return axiosClient.post(`${BASE_URL}topics/${topicId}/submit`, { registrationPeriodId: periodId });
    }

    static async deleteTopicById(id: string) {
        return axiosClient.delete(`${BASE_URL}topics/${id}`);
    }

    static async assignToDepartment(id: string, data: { departmentId: string, notes: string }) {
        return axiosClient.post(`${BASE_URL}topics/${id}/assign`, data);
    }

    static async getTopicByDepartment(departmentId: string, params: GetTopicsParams) {
        return axiosClient.get(`${BASE_URL}topics/department/${departmentId}`, { params });
    }

    static async approveTopic(id: string, data: { notes: string }) {
        return axiosClient.post(`${BASE_URL}topics/${id}/approve`, data);
    }

    static async rejectTopic(id: string, data: { notes: string }) {
        return axiosClient.post(`${BASE_URL}topics/${id}/reject`, data);
    }

    static async reviewTopic(id: string, data: { status: TopicStatus, notes: string }) {
        return axiosClient.post(`${BASE_URL}topics/${id}/review`, data);
    }
}