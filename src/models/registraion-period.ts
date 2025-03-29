import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status";

export interface RegistrationPeriod {
    id?: number;
    name: string;
    decisionNumber: string;
    decisionFile: string;
    status: RegistrationPeriodStatus;
    startDate: string;
    endDate: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}