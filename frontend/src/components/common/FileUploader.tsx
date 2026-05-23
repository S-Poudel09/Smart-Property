'use client';

import { useState } from 'react';
import { X, FileText, Upload } from 'lucide-react';

export interface FilePreview {
    name: string;
    size?: number;
    type?: string;
    previewUrl?: string;
    file?: File;
    docType?: string;
}

interface FileUploaderProps {
    id?: string;
    label: string;
    accept: string;
    multiple?: boolean;
    onFilesChange: (files: FilePreview[]) => void;
    existingFiles?: FilePreview[];
}

export const FileUploader = ({ id, label, accept, multiple = false, onFilesChange, existingFiles = [] }: FileUploaderProps) => {
    const [previews, setPreviews] = useState<FilePreview[]>(existingFiles);
    const generatedId = id || label.replace(/\s+/g, '-').toLowerCase() + '-upload';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newFiles = files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: URL.createObjectURL(file), // Note: In a real app, you'd revoke these
            file: file // Store actual file for mock/real upload later
        }));

        const updated = multiple ? [...previews, ...newFiles] : newFiles;
        setPreviews(updated);
        onFilesChange(updated);
    };

    const removeFile = (index: number) => {
        const updated = previews.filter((_, i) => i !== index);
        setPreviews(updated);
        onFilesChange(updated);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

<div className="flex items-center justify-center w-full">
    <label 
        htmlFor={generatedId}
        className="upload-btn group"
    >
        <div className="flex flex-col items-center justify-center py-2">
            <Upload className="w-6 h-6 mb-2 text-white/80 group-hover:text-white transition-colors" />
            <p className="text-sm font-bold bg-transparent">
                Click to upload Registry Documents
            </p>
            <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em] mt-1">({accept.split(',').join(' ')})</p>
        </div>
        <input
            id={generatedId}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
        />
    </label>
</div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {previews.map((file, index) => (
                        <div key={index} className="relative group rounded-xl border border-border bg-white p-1.5 shadow-sm hover:shadow-md transition-all">
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg hover:scale-110 active:scale-95"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {file.type?.startsWith('image/') ? (
                                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                                    {file.previewUrl && (
                                        <img 
                                            src={file.previewUrl} 
                                            alt={file.name} 
                                            className="object-cover w-full h-full" 
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="aspect-square flex flex-col items-center justify-center rounded-lg bg-primary/5 text-primary p-2 border border-primary/10">
                                    <FileText className="w-8 h-8 mb-1 opacity-50" />
                                    <span className="text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter">{file.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
