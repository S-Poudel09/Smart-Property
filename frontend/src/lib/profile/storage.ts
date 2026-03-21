import { UserProfile, KycStatus } from '@/types/profile';
import { createNotification } from '../notifications/storage';

const PROFILES_KEY = 'smartproperty_profiles';

export const getAllProfiles = (): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(PROFILES_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getProfileByUserId = (userId: string): UserProfile | undefined => {
    return getAllProfiles().find(p => p.userId === userId);
};

export const upsertProfile = (profile: Partial<UserProfile> & { userId: string }): UserProfile => {
    const profiles = getAllProfiles();
    const index = profiles.findIndex(p => p.userId === profile.userId);

    let updatedProfile: UserProfile;

    if (index >= 0) {
        updatedProfile = {
            ...profiles[index],
            ...profile,
            updatedAt: new Date().toISOString(),
        };
        profiles[index] = updatedProfile;
    } else {
        updatedProfile = {
            userId: profile.userId,
            fullName: profile.fullName || '',
            phone: profile.phone || '',
            address: profile.address || '',
            kycDocs: profile.kycDocs || [],
            kycStatus: profile.kycStatus || 'NOT_SUBMITTED',
            updatedAt: new Date().toISOString(),
        };
        profiles.push(updatedProfile);
    }

    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return updatedProfile;
};

export const updateKycStatus = (userId: string, status: KycStatus, reason?: string) => {
    const profiles = getAllProfiles();
    const index = profiles.findIndex(p => p.userId === userId);
    if (index >= 0) {
        const profile = profiles[index];
        profiles[index].kycStatus = status;
        profiles[index].rejectionReason = reason;
        profiles[index].updatedAt = new Date().toISOString();
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

        // Notify User
        createNotification({
            userId: profile.userId,
            title: `KYC Verification ${status === 'VERIFIED' ? 'Passed' : 'Update'}`,
            message: status === 'VERIFIED'
                ? 'Your identity verification and KYC are complete. You now have full access.'
                : `Your KYC verification status is now: ${status.toLowerCase()}. ${reason ? 'Reason: ' + reason : ''}`,
            type: status === 'VERIFIED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO',
            link: '/dashboard/profile'
        });
    }
};
