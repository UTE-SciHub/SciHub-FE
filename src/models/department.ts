export interface Department {
    id?: number;
    name: string;
    description: string;
    email: string;
    phoneNumber: string;
    imageUrl: string;
    delFlag: boolean;
    logoPublicId?: string;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}