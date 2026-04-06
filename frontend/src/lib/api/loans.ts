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
    // Protocol integrity requires exact field mapping for ModelSerializer
    const payload = {
        PropertyID: data.PropertyID || data.property,
        LoanAmount: data.LoanAmount || data.loan_amount,
        InterestRate: data.InterestRate || data.interest_rate,
        Age: data.Age || data.age || 25,
        CreditScore: data.CreditScore || data.credit_score || 750,
        LoanTerm: data.LoanTerm || data.loan_term || 240
    };
    const response = await api.post('loans/', payload);
    return response.data;
};

export const predictLoan = async (data: any) => {
    // Standardized signal for ML prediction matrix
    const payload = {
        age: parseInt(data.age),
        income: parseFloat(data.income),
        credit_score: parseInt(data.credit_score),
        loan_amount: parseFloat(data.loan_amount || data.amount),
        loan_term: parseInt(data.loan_term || data.term),
        employment_status: data.employment_status || 'Employed'
    };
    // Ensure trailing slash to avoid 500 redirect errors
    const response = await api.post('loans/predict/', payload);
    return response.data;
};

export const calculateEMI = async (amount: number, rate: number, tenure: number) => {
    const payload = { amount, rate, tenure };
    const response = await api.post('loans/calculate-emi/', payload);
    return response.data;
};

export const checkEligibility = async (income: number, loanAmount: number, existingEmis: number = 0) => {
    const payload = { 
        income, 
        loan_amount: loanAmount, 
        existing_emis: existingEmis 
    };
    const response = await api.post('loans/check-eligibility/', payload);
    return response.data;
};
