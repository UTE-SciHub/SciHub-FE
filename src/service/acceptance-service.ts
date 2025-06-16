import axiosClient from "@/utils/axiosClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface AcceptanceRequest {
    page?: number;
    size?: number;
    sort?: string;
    order?: string;
    councilId?: number;
    status?: string;
}

export class AcceptanceService {

    static async getAcceptances(params: AcceptanceRequest) {
        return axiosClient.get(`${BASE_URL}acceptance`, { params });
    }

    static async getAcceptanceById(id: string) {
        return axiosClient.get(`${BASE_URL}acceptance/${id}`);
    }

    static async submitAcceptance(data: FormData) {
        return axiosClient.post(`${BASE_URL}acceptance`, data);
    } 
    
    static async approveAcceptance(id: string, decisionFile: File) {
        const formData = new FormData();
        formData.append("decisionFile", decisionFile);
        return axiosClient.put(`${BASE_URL}acceptance/${id}/approve`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    }

    static async rejectAcceptance(id: string, rejectionReason: string) {
        return axiosClient.put(`${BASE_URL}acceptance/${id}/reject`, { rejectionReason });
    }
}
