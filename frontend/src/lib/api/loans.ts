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
    const response = await api.get('loans/');
    return response.data;
};

export const applyForLoan = async (data: any) => {
    // Transform to PascalCase for backend protocol integrity
    const payload = {
        PropertyID: data.property,
        LoanAmount: data.loan_amount,
        InterestRate: data.interest_rate,
        Status: 'SUBMITTED',
        ApplicationDate: new Date().toISOString().split('T')[0]
    };
    const response = await api.post('loans/', payload);
    return response.data;
};

export const predictLoan = async (data: any) => {
    // Prediction matrix expects standardized signal
    const payload = {
        Income: data.income,
        LoanAmount: data.amount,
        Term: data.term,
        CreditScore: data.credit_score || 750
    };
    // If backend returns 405 on trailing slash, try without
    const response = await api.post('loans/predict', payload).catch(err => {
        if (err.response?.status === 405) return api.post('loans/predict/', payload);
        throw err;
    });
    return response.data;
};

export const calculateEMI = async (amount: number, rate: number, tenure: number) => {
    const payload = { Amount: amount, Rate: rate, Tenure: tenure };
    const response = await api.post('loans/calculate-emi/', payload);
    return response.data;
};

export const checkEligibility = async (income: number, loanAmount: number, existingEmis: number = 0) => {
    const payload = { 
        Income: income, 
        LoanAmount: loanAmount, 
        ExistingEmis: existingEmis 
    };
    const response = await api.post('loans/check-eligibility/', payload);
    return response.data;
};
