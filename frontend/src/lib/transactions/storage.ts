import { Transaction, PaymentProof } from '@/types/transaction';
import { createNotification } from '../notifications/storage';

const STORAGE_KEY = 'smartproperty_transactions';

export const getAllTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getTransactionsByBuyer = (buyerId: string): Transaction[] => {
    return getAllTransactions().filter(t => t.buyerId === buyerId);
};

export const getTransactionsBySeller = (sellerId: string): Transaction[] => {
    return getAllTransactions().filter(t => t.sellerId === sellerId);
};

export const getTransactionById = (id: string): Transaction | undefined => {
    return getAllTransactions().find(t => t.id === id);
};

export const createTransaction = (data: {
    propertyId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
}): Transaction => {
    const transactions = getAllTransactions();
    const newTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        ...data,
        status: 'AWAITING_PROOF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return newTransaction;
};

export const uploadPaymentProof = (transactionId: string, proof: PaymentProof): void => {
    const transactions = getAllTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);

    if (index >= 0) {
        transactions[index] = {
            ...transactions[index],
            status: 'PROOF_UPLOADED',
            paymentProof: proof,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
};

export const sellerConfirm = (transactionId: string): void => {
    const transactions = getAllTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);

    if (index >= 0) {
        const trx = transactions[index];
        transactions[index] = {
            ...trx,
            status: 'CONFIRMED',
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));

        // Notify Buyer
        createNotification({
            userId: trx.buyerId,
            title: 'Payment Confirmed!',
            message: `The seller has confirmed receipt of payment for transaction ${trx.id}.`,
            type: 'SUCCESS',
            link: '/dashboard/buyer/transactions'
        });
    }
};

export const cancelTransaction = (transactionId: string): void => {
    const transactions = getAllTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);

    if (index >= 0) {
        transactions[index] = {
            ...transactions[index],
            status: 'CANCELLED',
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
};
