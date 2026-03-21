import api from './http';

export interface Loan {
    id: string;
    property: string;
    loan_amount: string;
    interest_rate: string;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    application_date: string;
    approval_date?: string;
}

export const getLoans = async (): Promise<Loan[]> => {
    const response = await api.get('/loans/');
    return response.data;
};

export const applyForLoan = async (data: any) => {
    const response = await api.post('/loans/', data);
    return response.data;
};

export const predictLoan = async (data: any) => {
    const response = await api.post('/loans/predict/', data);
    return response.data;
};

export const calculateEMI = async (amount: number, rate: number, tenure: number) => {
    const response = await api.post('/loans/calculate-emi/', { amount, rate, tenure });
    return response.data;
};

export const checkEligibility = async (income: number, loanAmount: number, existingEmis: number = 0) => {
    const response = await api.post('/loans/check-eligibility/', { 
        income, loan_amount: loanAmount, existing_emis: existingEmis 
    });
    return response.data;
};
