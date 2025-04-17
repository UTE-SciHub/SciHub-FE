export interface Topic {
    id?: number;
    name: string;
    description: string;
    delFlag: boolean;
    researchFieldId?: number;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}