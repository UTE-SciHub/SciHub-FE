import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class EvaluationService {
    static async submitEvaluate(applicationId: number, data) {
        return axiosClient.post(`${BASE_URL}topic-applications/${applicationId}/evaluate`, data);
    }
};