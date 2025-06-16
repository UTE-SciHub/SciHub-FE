import { TopicStatus } from "@/models/enums/topic-status.enum";
import { TopicMemberRole } from "@/models/topic-member";
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
    periodId?: string;
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

    static async unassignDepartment(id: string) {
        return axiosClient.post(`${BASE_URL}topics/${id}/unassign`);
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

    static async newReviewTopic(id: string, formData: FormData) {
        return axiosClient.post(`${BASE_URL}topics/${id}/review`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    static async publishCategories() {
        return axiosClient.get(`${BASE_URL}topics/categories/publish`);
    }

    static async evaluateTopic(id: string, data: { notes: string }) {
        return axiosClient.post(`${BASE_URL}topics/${id}/evaluate`, data);
    }

    static async assignCategory(data: { topicIds: string[], categoryId: number }) {
        return axiosClient.post(`${BASE_URL}topics/assign-category`, data);
    }

    static async approveTopicsByCouncil(data) {
        return axiosClient.post(`${BASE_URL}topics/council-approval`, data);
    }

    static async getTopicsByPrincipalInvestigator(id: string) {
        return axiosClient.get(`${BASE_URL}topics/by-investigator/${id}`);
    }

    static async updateMembers(id: string, memberData: { members: Array<{ userId: string; role: TopicMemberRole }> }) {
        return axiosClient.post(`${BASE_URL}topics/${id}/members`, memberData);
    }
}