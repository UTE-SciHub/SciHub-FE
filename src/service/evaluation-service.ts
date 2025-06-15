import axiosClient from "@/utils/axiosClient";
import { EvaluationDetail } from "@/models/evaluation-detail";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class EvaluationService {
    static async submitEvaluate(applicationId: number, data: EvaluationDetail) {
        return axiosClient.post(`${BASE_URL}topic-applications/${applicationId}/evaluate`, data);
    }

    static async getEvaluationDetail(applicationId: number) {
        return axiosClient.get(`${BASE_URL}topic-applications/${applicationId}/evaluation-detail`);
    }

    static async determinePrincipalInvestigator(councilId: string, topicId: string) {
        return axiosClient.post(`${BASE_URL}topic-applications/council/${councilId}/topic/${topicId}/summary`);
    }
};