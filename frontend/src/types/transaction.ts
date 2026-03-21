export type TransactionStatus =
    | 'PENDING'
    | 'AWAITING_PROOF'
    | 'PROOF_UPLOADED'
    | 'CONFIRMED'
    | 'CANCELLED';

export interface PaymentProof {
    name: string;
    size: number;
    type: string;
    previewUrl: string;
    uploadedAt: string;
}

export interface Transaction {
    id: string;
    propertyId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    status: TransactionStatus;
    paymentProof?: PaymentProof;
    createdAt: string;
    updatedAt: string;
}
