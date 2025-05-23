import { Category } from "@/models/category";
import { Department } from "@/models/department";
import { TopicStatus } from "@/models/enums/topic-status.enum";
import { RegistrationPeriod } from "@/models/registraion-period";
import { ResearchField } from "@/models/research-field";
import { ResearchType } from "@/models/research-type";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface TopicApplicationRequest {
    topicId: string;
    plan: string;
    motivation: string;
}

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS';

export interface TopicApplicationResponse {
    id: string;
    vietnameseName: string;
    englishName: string;
    principalInvestigator: string;
    status: TopicStatus;
    startDate: string;
    durationInMonths: number;
    department: Department;
    field: ResearchField;
    researchType: ResearchType;
    category: Category;
    registrationPeriod: RegistrationPeriod;
    applicationStatus: ApplicationStatus | null;
    hasApplied: boolean;
    applicationId?: number
}

interface TopicApplicationParams {
    p?: number;
    s?: number;
    sort?: string;
    order?: string;
    q?: string;
    status?: TopicStatus;
    periodId?: string;
}

export class TopicApplicationService {

    static async getAll(params: TopicApplicationParams) {
        return axiosClient.get(`${BASE_URL}topic-applications`, { params });
    }

    static async apply(data: TopicApplicationRequest) {
        return axiosClient.post(`${BASE_URL}topic-applications`, data);
    }

    static async delete(id: string) {
        return axiosClient.delete(`${BASE_URL}topic-applications/${id}`);
    }

    static async getApplicationsByTopic(topicId: string) {
        return axiosClient.get(`${BASE_URL}topic-applications/topic/${topicId}`);
    }
}