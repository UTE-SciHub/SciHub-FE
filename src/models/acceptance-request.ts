import { Council } from "@/models/council";
import { Topic } from "@/models/topic";
import { Document } from "@/models/document";

export interface AcceptanceRequest {
    id?: number;
    topic: Topic;
    council: Council;
    status: AcceptanceStatus;
    submissionDate?: string;
    notes?: string;
    acknowledgment?: boolean;
    attemptNumber?: number;
    isFinal?: boolean;
    documents?: Document[];
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export enum AcceptanceStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

