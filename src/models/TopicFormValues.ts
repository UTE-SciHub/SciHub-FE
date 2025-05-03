export type TopicFormValues = {
    vietnameseName: string;
    englishName: string;
    topicCode?: string;
    principalInvestigator?: string;
    objectives: string;
    mainContent: string;
    urgency: string;
    keywords: string[];
    department: string;
    category: string;
    period: string;
    field: string;
    researchType: string;
    transferForm?: string[];
    expectedProducts?: {
        scientific?: { domestic?: number; international?: number };
        training?: { masters?: number; students?: number };
        commercial?: { details?: string };
    };
    practicalApplications: string;
    attachedDocuments?: Array<{
        file?: File;
        description: string;
        url?: string;
        id?: string;
        originalFileName?: string;
    }>;
    expectedRisks?: string;
    startDate: Date;
    durationInMonths: number;
    endYear: number;
    totalBudget: number;
    remainingBudget?: number;
    fundingSource: string;
    budgetBreakdown: Array<{
        category: string;
        amount: number;
        description?: string;
    }>;
    status: "DRAFT" | "PENDING";
    commitment?: boolean;
    additionalNotes?: string;
};