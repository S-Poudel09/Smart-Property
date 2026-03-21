export type LoanStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface LoanRequest {
    id: string;
    propertyId: string;
    buyerId: string;
    sellerId: string;
    amountRequested: number;
    income: number;
    employmentStatus: string;
    message?: string;
    status: LoanStatus;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}
