import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class DashboardService {
    static async getDashboardOverview() {
        return await axiosClient.get(`${BASE_URL}dashboard`);
    }

    static async getCurrentRegistrationPeriod() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/current-registration`);
        return response.data;
    }

    static async getPendingTopics() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/pending-topics`);
        return response.data;
    }

    static async getActiveCouncils() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/active-councils`);
        return response.data;
    }

    static async getCategoryDistribution() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/category-distribution`);
        return response.data;
    }

    static async getResearchFieldDistribution() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/research-field-distribution`);
        return response.data;
    }

    static async getUserTopics() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/user-topics`);
        return response.data;
    }

    static async getPendingEvaluations() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/pending-evaluations`);
        return response.data;
    }

    static async getBudgetInfo() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/budget-info`);
        return response.data;
    }

    static async getRecentActivities() {
        const response = await axiosClient.get(`${BASE_URL}dashboard/recent-activities`);
        return response.data;
    }
} 