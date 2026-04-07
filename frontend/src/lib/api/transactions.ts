import api from './http';
import { Property } from '@/types/property';

export interface UserSimple {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface PaymentProof {
    ProofID: string;
    proof_file: string;
    amount: string;
    is_verified: boolean;
    notes: string;
    created_at: string;
}

export interface Transaction {
    TransactionID: string;
    Buyer: UserSimple;
    Seller: UserSimple;
    Property: any;
    Proofs: PaymentProof[];
    total_amount: string;
    amount_paid: string;
    payment_method: string;
    status: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    Progress: number;
    created_at: string;
    updated_at: string;
    id?: string;
    // Fraud detection fields
    card_brand?: string;
    card_type?: string;
    card_on_dark_web?: boolean;
    has_chip?: boolean;
}

export const getTransactions = async (): Promise<Transaction[]> => {
    const response = await api.get('transactions/');
    return response.data;
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
    const response = await api.get(`transactions/${id}/`);
    return response.data;
};

export const createTransaction = async (propertyId: string, sellerId: string, amount: number) => {
    const response = await api.post('transactions/', {
        property: propertyId,
        seller: sellerId,
        total_amount: amount
    });
    return response.data;
};

export const uploadPaymentProof = async (transactionId: string, amount: number, file: File, notes: string = '') => {
    const formData = new FormData();
    formData.append('amount', amount.toString());
    formData.append('proof_file', file);
    formData.append('notes', notes);
    
    const response = await api.post(`transactions/${transactionId}/upload-proof/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const verifyPaymentProof = async (transactionId: string, proofId: string) => {
    const response = await api.post(`transactions/${transactionId}/verify-proof/${proofId}/`);
    return response.data;
};

export const confirmTransaction = async (transactionId: string) => {
    const response = await api.post(`transactions/${transactionId}/confirm/`);
    return response.data;
};

export const initiateKhaltiPayment = async (transactionId: string, returnUrl: string) => {
    const response = await api.post(`transactions/${transactionId}/khalti-initiate/`, {
        return_url: returnUrl
    });
    return response.data;
};

export const verifyKhaltiPayment = async (transactionId: string, pidx: string) => {
    const response = await api.post(`transactions/${transactionId}/khalti-verify/`, {
        pidx
    });
    return response.data;
};

export const createPurchaseRequest = async (propertyId: string, sellerId: string, totalAmount: number) => {
    const response = await api.post('transactions/', {
        property: propertyId,
        seller: sellerId,
        total_amount: totalAmount
    });
    return response.data;
};
