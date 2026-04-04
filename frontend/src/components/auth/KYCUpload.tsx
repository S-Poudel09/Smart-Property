'use client';

import { useState } from 'react';
import { FileUploader, FilePreview } from '@/components/common/FileUploader';
import { Button } from '@/components/common/Button';
import { toast } from 'react-hot-toast';
import api from '@/lib/api/http';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

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
            await api.post('auth/kyc/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            toast.success('Imperial Registry updated. KYC documents submitted!');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to sync with Imperial Registry');
        } finally {
            setIsLoading(false);
        }
    };

    if (currentStatus === 'verified') {
        return (
            <div className="p-12 text-center group">
                <div className="h-20 w-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-8 border border-indigo-100 shadow-xl shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-serif text-primary mb-4">Identity Sealed</h3>
                <p className="text-gray-400 font-medium italic mb-0 max-w-sm mx-auto">"Your credentials have been verified by the Imperial Council. Full access is granted."</p>
            </div>
        );
    }

    if (currentStatus === 'pending') {
        return (
            <div className="p-12 text-center group">
                <div className="h-20 w-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-600 mx-auto mb-8 border border-amber-100 shadow-xl shadow-amber-500/10 group-hover:rotate-12 transition-transform duration-500">
                    <Clock className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-serif text-primary mb-4">Decree Pending</h3>
                <p className="text-gray-400 font-medium italic mb-0 max-w-sm mx-auto">"Your documents are currently being scrutinized by the high council. Expect a manifestation within 48 hours."</p>
            </div>
        );
    }

    return (
        <div className="p-12">
            <div className="mb-12 flex items-center gap-6">
                <div className="h-16 w-16 bg-primary text-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="text-3xl font-serif text-primary">Identity Verification</h3>
                    <p className="text-gray-400 font-medium italic">Present your credentials to secure your position in the realm.</p>
                </div>
            </div>

            {currentStatus === 'rejected' && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10 rounded-3xl bg-red-50 p-6 flex items-start gap-4 text-red-700 border border-red-100"
                >
                    <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium italic">"The Council has found discrepancies in your previous decree. Please provide higher fidelity captures."</p>
                </motion.div>
            )}

            <div className="space-y-12">
                <div>
                    <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] block mb-6">Document Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'nid', label: 'National ID' },
                            { id: 'passport', label: 'Passport' },
                            { id: 'license', label: 'License' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setDocType(type.id as any)}
                                className={`h-16 rounded-2xl border-2 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    docType === type.id 
                                        ? 'border-primary bg-primary text-accent shadow-xl shadow-primary/20' 
                                        : 'border-accent/10 bg-white text-gray-400 hover:border-accent hover:text-primary'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-accent tracking-[0.3em] block mb-2">Registry Files</label>
                    <FileUploader
                        label="Identity Capture"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onFilesChange={(newFiles) => setFiles(newFiles)}
                    />
                </div>

                <Button 
                    className="w-full h-16 rounded-full bg-primary text-accent font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:bg-accent hover:text-primary transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    onClick={handleSubmit} 
                    disabled={isLoading || !docType || files.length === 0}
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Seal & Submit Decree'}
                </Button>
            </div>
        </div>
    );
}
