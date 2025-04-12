export type UserImportResponse = {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role?: [];
    errorField?: string;
    type?: string;
}