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

export const initiateKhaltiPayment = async (
    transactionId: string,
    returnUrl: string,
    websiteUrl?: string
) => {
    const response = await api.post(`transactions/${transactionId}/khalti-initiate/`, {
        return_url: returnUrl,
        website_url: websiteUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
    });
    return response.data;
};

// --- DUMMY SIMULATION FUNCTIONS ---

/**
 * Simulates payment initiation without hitting the backend/Khalti.
 * Useful for frontend-only demonstrations.
 */
export const initiateDummyPayment = async (transactionId: string, returnUrl: string) => {
    console.log("Initiating dummy payment for transaction:", transactionId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mocked response
    const mockPidx = "dummy_pidx_" + Math.random().toString(36).substring(7);
    const response = {
        status: "success",
        pidx: mockPidx,
        transaction_id: transactionId,
        payment_url: `${returnUrl}&pidx=${mockPidx}&status=Completed&dummy=true`,
    };

    console.log("Dummy payment initiated successfully:", response);
    return response;
};

/**
 * Simulates payment verification with dummy data.
 */
export const verifyDummyPayment = async (transactionId: string, pidx: string) => {
    console.log("Verifying dummy payment:", pidx);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mocked verification response (Success)
    const paymentStatus = {
        status: "Completed",
        pidx: pidx,
        transaction_id: transactionId,
        amount_paid: 15000, // NPR
    };

    console.log("Dummy payment verification successful:", paymentStatus);
    return paymentStatus;
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

export const downloadDeed = async (transactionId: string) => {
    const response = await api.get(`transactions/${transactionId}/download-deed/`, {
        responseType: 'blob'
    });
    
    if (typeof window !== 'undefined') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Deed_of_Sale_${transactionId.slice(0, 8)}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
