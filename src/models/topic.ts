import { Department } from "@/models/department";
import { ResearchField } from "@/models/research-field";
import { ResearchType } from "@/models/research-type";

export interface ExpectedProduct {
    id?: string;
    productName: string;
    criteria: string;
    description: string;
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
    expectedProducts: ExpectedProduct[];
    novelty?: string;
    expectedRisks?: string;
    keywords: string[];
    department?: Department;
    field?: ResearchField;
    researchType?: ResearchType;
    category?: string;
    transferForm: string[];
    attachedDocuments?: string[];
    status: string;
    startDate: string;
    durationInMonths: number;
    endYear: number;
    totalBudget: number;
    approvedBudget: number;
    remainingBudget: number;
    fundingSource?: string;
    budgetBreakdown: BudgetBreakdown[];
    additionalNotes?: string;
    createdAt?: string
    updatedAt?: string
    createdBy?: string;
    updatedBy?: string;
}