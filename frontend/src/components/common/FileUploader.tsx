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
    label: string;
    accept: string;
    multiple?: boolean;
    onFilesChange: (files: FilePreview[]) => void;
    existingFiles?: FilePreview[];
}

export const FileUploader = ({ label, accept, multiple = false, onFilesChange, existingFiles = [] }: FileUploaderProps) => {
    const [previews, setPreviews] = useState<FilePreview[]>(existingFiles);

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
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">{accept.split(',').join(' ')}</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        multiple={multiple}
                        onChange={handleFileChange}
                    />
                </label>
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {previews.map((file, index) => (
                        <div key={index} className="relative group rounded-lg border bg-white p-2 shadow-sm">
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {file.type?.startsWith('image/') ? (
                                <div className="aspect-square relative rounded-md overflow-hidden bg-gray-100">
                                    {file.previewUrl && <img src={file.previewUrl} alt={file.name} className="object-cover w-full h-full" />}
                                </div>
                            ) : (
                                <div className="aspect-square flex flex-col items-center justify-center rounded-md bg-blue-50 text-blue-600 p-2">
                                    <FileText className="w-8 h-8 mb-1" />
                                    <span className="text-[10px] truncate w-full text-center">{file.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
