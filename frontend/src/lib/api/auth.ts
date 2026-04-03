import api from '../api';

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('auth/login/', { email, password });
    return response.data;
};

export const registerUser = async (
    name: string,
    email: string,
    password: string,
    role: string
) => {
    const response = await api.post('auth/register/', {
        name,
        email,
        password,
        role,
    });
    return response.data;
};

export const verifyOTP = async (email: string, otp_code: string) => {
    const response = await api.post('auth/verify-otp/', { email, otp_code });
    return response.data;
};

export const resendOTP = async (email: string) => {
    const response = await api.post('auth/resend-otp/', { email });
    return response.data;
};

export const requestPasswordReset = async (email: string) => {
    const response = await api.post('auth/password-reset/', { email });
    return response.data;
};

export const confirmPasswordReset = async (uidb64: string, token: string, new_password: string) => {
    const response = await api.post('auth/password-reset-confirm/', { uidb64, token, new_password });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('auth/me/');
    return response.data;
};

export const verifyAdminLoginOTP = async (email: string, otp_code: string) => {
    const response = await api.post('auth/admin-login-verify/', { email, otp_code });
    return response.data;
};

export const resendAdminLoginOTP = async (email: string) => {
    const response = await api.post('auth/admin-login-resend/', { email });
    return response.data;
};
