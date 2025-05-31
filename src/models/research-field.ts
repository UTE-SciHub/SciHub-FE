import { Topic } from "@/models/topic";

export interface ResearchField {
    id?: number;
    name: string;
    description: string;
    delFlag?: boolean;
    topic?: Topic[];
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}