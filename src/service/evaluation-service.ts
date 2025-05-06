import { EvaluationDetail } from "@/models/evaluation-detail";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export class EvaluationService {
    static async submitEvaluate(applicationId: string, councilId: number, data: EvaluationDetail) {
        return axiosClient.post(`/evaluations/${applicationId}`, {
            councilId,
            ...data,
        });
    }
};