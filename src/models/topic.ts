import { Category } from "@/models/category";
import { Department } from "@/models/department";
import { TopicStatus } from "@/models/enums/topic-status.enum";
import { RegistrationPeriod } from "@/models/registraion-period";
import { ResearchField } from "@/models/research-field";
import { ResearchType } from "@/models/research-type";
import { TopicCouncil } from "@/models/topic-council";
import { TopicMember } from "@/models/topic-member";

export interface ExpectedProduct {
    scientific: {
        domestic?: number;
        international?: number;
    };
    training: {
        masters?: number;
        students?: number;
    };
    commercial: {
        details?: string;
    };
}

export interface BudgetBreakdown {
    id?: string;
    category: string;
    amount: number;
    description: string;
}

export interface Topic {
    id?: string;
    vietnameseName: string;
    englishName?: string;
    topicCode: string;
    principalInvestigator?: string;
    objectives?: string;
    mainContent?: string;
    practicalApplications?: string;
    expectedProducts: ExpectedProduct;
    urgency: string;
    expectedRisks?: string;
    keywords: string[];
    department?: Department;
    category?: Category;
    field?: ResearchField;
    researchType?: ResearchType;
    transferForm: string[];
    attachedDocuments?: string[];
    registrationPeriod: RegistrationPeriod;
    members?: TopicMember[];
    status: TopicStatus;
    startDate: string;
    durationInMonths: number;
    endYear: number;
    totalBudget: number;
    approvedBudget?: number;
    fundingSource?: string;
    budgetBreakdown: BudgetBreakdown[];
    additionalNotes?: string;
    createdAt?: string
    updatedAt?: string
    createdBy?: string;
    updatedBy?: string;
    topicCouncils?: TopicCouncil[];
}