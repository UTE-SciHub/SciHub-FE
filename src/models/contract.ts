import { Topic } from "@/models/topic";

export interface Contract {
    id: number;
    name: string;
    code: string;
    topic: Topic;
    contractDetails: string;
    signedDate: string;
    contractPath: string;
    status: ContractStatus;
    delFlag: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export enum ContractStatus {
    PENDING = "PENDING",
    SIGNED = "SIGNED",
    CANCELLED = "CANCELLED",
}

export interface ContractRequest {
    id?: number;
    name: string;
    code: string;
    idTopic: string;
    contractDetails: string;
    signedDate: string;
    status: ContractStatus;
}

export const getStatusText = (status: ContractStatus) => {
    switch (status) {
        case ContractStatus.PENDING:
            return "Chờ ký";
        case ContractStatus.SIGNED:
            return "Đã ký";
        case ContractStatus.CANCELLED:
            return "Hủy";
    }
}

