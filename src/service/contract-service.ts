import { Contract, ContractRequest, ContractStatus } from "@/models/contract";
import { TopicStatus } from "@/models/enums/topic-status.enum";
import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface ContractFilterParams {
    p?: number;
    s?: number;
    sort?: string;
    order?: string;
    q?: string;
    status?: ContractStatus;
    topicStatus?: TopicStatus;
    researchTypeId?: number;
    researchFieldId?: number;
    registrationPeriodId?: number;
    departmentId?: string;
    signedDateFrom?: string;
    signedDateTo?: string;
    delFlag?: boolean;
}

export class ContractService {
    static async findAll(params: ContractFilterParams) {
        return await axiosClient.get(`${BASE_URL}contracts`, { params });
    }

    static async getContractById(id: number) {
        return await axiosClient.get(`${BASE_URL}contracts/${id}`);
    }

    static async createContract(contractRequest: ContractRequest, contractFile?: File) {
        const formData = new FormData();
        formData.append('req', new Blob([JSON.stringify(contractRequest)], { type: 'application/json' }));
        
        if (contractFile) {
            formData.append('contractFile', contractFile);
        }

        return await axiosClient.post(`${BASE_URL}contracts`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async updateContract(id: number, contractRequest: ContractRequest, contractFile?: File) {
        const formData = new FormData();
        formData.append('req', new Blob([JSON.stringify(contractRequest)], { type: 'application/json' }));
        
        if (contractFile) {
            formData.append('contractFile', contractFile);
        }

        return await axiosClient.put(`${BASE_URL}contracts/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static async deleteContract(id: number) {
        return await axiosClient.delete(`${BASE_URL}contracts/${id}`);
    }

    static async updateContractStatus(id: number, status: ContractStatus) {
        return await axiosClient.patch(`${BASE_URL}contracts/${id}/status`, { status });
    }

    static async updateDelFlag(id: number, delFlag: boolean) {
        return await axiosClient.patch(`${BASE_URL}contracts/${id}/del-flag`, { delFlag });
    }

    static async downloadContractFile(id: number) {
        return await axiosClient.get(`${BASE_URL}contracts/${id}/download`, {
            responseType: 'blob'
        });
    }
}
