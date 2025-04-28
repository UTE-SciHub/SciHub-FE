import { Topic } from "@/models/topic";

export interface Category {
    id: number;
    name: string;
    description: string;
    level: number;
    delFlag: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    topics?: Topic[];
}