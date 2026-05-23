'use client';

import { useState } from 'react';
import { FileUploader } from '../common/FileUploader';
import { Button } from '../common/Button';
import { Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { FilePreview } from '../common/FileUploader';

interface PaymentProofUploaderProps {
    onUpload: (fileMeta: FilePreview) => void;
    isLoading?: boolean;
}

export const PaymentProofUploader = ({ onUpload, isLoading }: PaymentProofUploaderProps) => {
    const [file, setFile] = useState<FilePreview | null>(null);

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }
        onUpload(file);
    };

    return (
        <div className="rounded-2xl border-2 border-dashed border-purple-100 bg-purple-50/30 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Upload className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Upload Payment Proof</h3>
            <p className="mb-6 text-sm text-gray-500 max-w-xs mx-auto">
                Please upload a screenshot or PDF of your bank transfer, receipt, or payment confirmation.
            </p>

            <div className="max-w-sm mx-auto">
                <FileUploader
                    id="payment-proof"
                    label=""
                    accept="image/*,.pdf"
                    onFilesChange={(files) => setFile(files[0] || null)}
                />
            </div>

            {file && (
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleUpload}
                        isLoading={isLoading}
                        className="gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Submit Proof
                    </Button>
                </div>
            )}
        </div>
    );
};
