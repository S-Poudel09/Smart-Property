export type KycStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface KycDoc {
    docType: string;
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
}

export interface UserProfile {
    userId: string;
    fullName: string;
    phone: string;
    address: string;
    avatar?: string;
    kycDocs: KycDoc[];
    kycStatus: KycStatus;
    rejectionReason?: string;
    updatedAt: string;
}
