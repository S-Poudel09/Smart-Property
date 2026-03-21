import { LoanRequest, LoanStatus } from '@/types/loan';
import { createNotification } from '../notifications/storage';

const LOANS_KEY = 'smartproperty_loans';

export const getAllLoans = (): LoanRequest[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOANS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getLoansByBuyer = (buyerId: string): LoanRequest[] => {
    return getAllLoans().filter(l => l.buyerId === buyerId);
};

export const getLoansBySeller = (sellerId: string): LoanRequest[] => {
    return getAllLoans().filter(l => l.sellerId === sellerId);
};

export const getLoanById = (id: string): LoanRequest | undefined => {
    return getAllLoans().find(l => l.id === id);
};

export const createLoan = (data: Omit<LoanRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): LoanRequest => {
    const loans = getAllLoans();
    const newLoan: LoanRequest = {
        ...data,
        id: `loan-${Date.now()}`,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    loans.push(newLoan);
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    return newLoan;
};

export const updateLoanStatus = (id: string, status: LoanStatus, rejectionReason?: string): void => {
    const loans = getAllLoans();
    const index = loans.findIndex(l => l.id === id);
    if (index >= 0) {
        const loan = loans[index];
        loans[index].status = status;
        loans[index].rejectionReason = rejectionReason;
        loans[index].updatedAt = new Date().toISOString();
        localStorage.setItem(LOANS_KEY, JSON.stringify(loans));

        // Notify Buyer
        createNotification({
            userId: loan.buyerId,
            title: `Loan Application ${status.charAt(0) + status.slice(1).toLowerCase()}`,
            message: status === 'APPROVED'
                ? `Congratulations! Your loan request for property ID ${loan.propertyId} has been approved.`
                : `Your loan request for property ID ${loan.propertyId} was ${status.toLowerCase()}. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
            type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO',
            link: `/dashboard/buyer/loans/${loan.id}`
        });
    }
};
