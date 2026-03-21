'use client';

import { useState } from 'react';
import { FileUploader, FilePreview } from '@/components/common/FileUploader';
import { Button } from '@/components/common/Button';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface KYCUploadProps {
    currentStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    onSuccess?: () => void;
}

export default function KYCUpload({ currentStatus, onSuccess }: KYCUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [docType, setDocType] = useState<'nid' | 'passport' | 'license' | ''>('');
    const [files, setFiles] = useState<FilePreview[]>([]);

    const handleSubmit = async () => {
        if (!docType) {
            toast.error('Please select a document type');
            return;
        }
        if (files.length === 0 || !files[0].file) {
            toast.error('Please upload an identity document');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('identity_document', files[0].file);
        formData.append('document_type', docType);

        try {
            // Retrieve token from localStorage (assuming this is where it's stored)
            const token = localStorage.getItem('access_token');
            await axios.post('http://localhost:8000/api/auth/kyc/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success('KYC documents submitted successfully!');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload KYC documents');
        } finally {
            setIsLoading(false);
        }
    };

    if (currentStatus === 'verified') {
        return (
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold text-green-900">Identity Verified</h3>
                <p className="mt-2 text-sm text-green-700">Your KYC verification is complete. You have full access to the platform.</p>
            </div>
        );
    }

    if (currentStatus === 'pending') {
        return (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
                <Clock className="mx-auto h-12 w-12 text-blue-500" />
                <h3 className="mt-4 text-lg font-semibold text-blue-900">Verification Pending</h3>
                <p className="mt-2 text-sm text-blue-700">Your documents are under review. This usually takes 24-48 hours.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <Shield className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Identity Verification (KYC)</h3>
                    <p className="text-sm text-gray-500">Upload your identity document to verify your account.</p>
                </div>
            </div>

            {currentStatus === 'rejected' && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 flex items-start gap-3 text-red-700 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>Your previous submission was rejected. Please upload clear documents and try again.</p>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Document Type</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['nid', 'passport', 'license'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setDocType(type as any)}
                                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                                    docType === type 
                                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {type === 'nid' ? 'National ID' : type === 'passport' ? 'Passport' : 'License'}
                            </button>
                        ))}
                    </div>
                </div>

                <FileUploader
                    label="Identity Document"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onFilesChange={(newFiles) => setFiles(newFiles)}
                />

                <Button 
                    className="w-full" 
                    onClick={handleSubmit} 
                    disabled={isLoading || !docType || files.length === 0}
                >
                    {isLoading ? 'Uploading...' : 'Submit for Verification'}
                </Button>
            </div>
        </div>
    );
}
