'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Building2,
    MapPin,
    Info,
    Image as ImageIcon,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Save,
    Loader2,
    ArrowLeft,
    FileText
} from 'lucide-react';

import DashboardShell from '@/components/layout/DashboardShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FileUploader, FilePreview } from '@/components/common/FileUploader';
import MapPlaceholder from '@/components/map/MapPlaceholder';
import { upsertProperty, getPropertyById } from '@/lib/properties/storage';
import { getUser } from '@/lib/auth/getUser';
import { Property } from '@/types/property';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const listingSchema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    price: z.coerce.number().min(1, 'Price must be greater than 0'),
    type: z.enum(['sale', 'rent'] as const),
    category: z.enum(['house', 'flat', 'bungalow', 'apartment', 'commercial', 'hostel', 'land'] as const),
    bedrooms: z.coerce.number().min(0),
    bathrooms: z.coerce.number().min(0),
    area: z.coerce.number().min(1, 'Area must be at least 1 sqft'),
    address: z.string().min(5, 'Address is too short'),
    city: z.string().min(2, 'City is too short'),
});

type ListingFormValues = z.infer<typeof listingSchema>;

const STEPS = [
    { id: 1, title: 'Basic Info', icon: Info },
    { id: 2, title: 'Details', icon: Building2 },
    { id: 3, title: 'Location', icon: MapPin },
    { id: 4, title: 'Uploads', icon: ImageIcon },
    { id: 5, title: 'Review', icon: CheckCircle2 },
];

export default function EditListingPage() {
    const { id } = useParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [images, setImages] = useState<FilePreview[]>([]);
    const [documents, setDocuments] = useState<FilePreview[]>([]);
    const [property, setProperty] = useState<Property | null>(null);
    const router = useRouter();
    const user = getUser();

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        reset,
        formState: { errors },
    } = useForm<ListingFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(listingSchema) as any,
    });

    const formData = watch();

    useEffect(() => {
        const data = getPropertyById(id as string);
        if (!data) {
            toast.error('Listing not found');
            router.push('/dashboard/seller');
            return;
        }

        // Check ownership
        if (user && data.sellerId !== user.id) {
            toast.error('Unauthorized');
            router.push('/dashboard/seller');
            return;
        }

        setProperty(data);
        reset({
            title: data.title,
            description: data.description,
            price: data.price,
            type: data.type,
            category: data.category,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            area: data.area,
            address: data.address,
            city: data.city,
        });

        if (Array.isArray(data.images)) {
            setImages(data.images.map(img => typeof img === 'string' ? { previewUrl: img, name: 'Existing Image', type: 'image/jpeg' } : img));
        }
        if (data.documents) {
            setDocuments(data.documents);
        }
        setIsFetching(false);
    }, [id, reset, router, user]);

    const nextStep = async () => {
        let fieldsToValidate: (keyof ListingFormValues)[] = [];
        if (currentStep === 1) fieldsToValidate = ['title', 'type', 'category'];
        if (currentStep === 2) fieldsToValidate = ['price', 'bedrooms', 'bathrooms', 'area', 'description'];
        if (currentStep === 3) fieldsToValidate = ['address', 'city'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

    const onSubmit = async (data: ListingFormValues) => {
        if (!user || !property) return;
        setIsLoading(true);

        const updatedProperty: Property = {
            ...property,
            ...data,
            location: `${data.address}, ${data.city}`,
            images: images.map(img => img.previewUrl || ''),
            documents: documents.map(doc => ({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                docType: (doc.docType || 'landownership') as any,
                name: doc.name,
                size: doc.size || 0,
                type: doc.type || 'application/pdf'
            })),
            updatedAt: new Date().toISOString(),
        };

        try {
            await new Promise(r => setTimeout(r, 1000));
            upsertProperty(updatedProperty);
            toast.success('Listing updated successfully!');
            router.push('/dashboard/seller');
        } catch (e) {
            toast.error('Failed to update listing');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <DashboardShell title="Edit Listing">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </DashboardShell>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <DashboardShell title={`Edit: ${property?.title}`}>
                <div className="mx-auto max-w-4xl">
                    <Link href="/dashboard/seller" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>

                    {/* Stepper */}
                    <div className="mb-12 flex justify-between">
                        {STEPS.map((step) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${isActive ? 'border-blue-600 bg-blue-600 text-white' :
                                        isCompleted ? 'border-green-500 bg-green-500 text-white' :
                                            'border-gray-200 bg-white text-gray-400'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : (
                                            (() => {
                                                const Icon = step.icon;
                                                return <Icon className="h-5 w-5" />;
                                            })()
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Form Content */}
                    <div className="rounded-2xl border bg-white p-8 shadow-sm">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Same form content as add-listing */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <Input
                                        label="Listing Title"
                                        {...register('title')}
                                        error={errors.title?.message}
                                    />
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Listing Type</label>
                                            <select
                                                {...register('type')}
                                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                            >
                                                <option value="sale">For Sale</option>
                                                <option value="rent">For Rent</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Property Category</label>
                                            <select
                                                {...register('category')}
                                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="house">House</option>
                                                <option value="flat">Flat</option>
                                                <option value="bungalow">Bungalow</option>
                                                <option value="apartment">Apartment</option>
                                                <option value="commercial">Commercial</option>
                                                <option value="hostel">Hostel</option>
                                                <option value="land">Land</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <Input
                                            label="Price"
                                            type="number"
                                            {...register('price')}
                                            error={errors.price?.message}
                                        />
                                        <Input
                                            label="Area (Sq Ft)"
                                            type="number"
                                            {...register('area')}
                                            error={errors.area?.message}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <Input
                                            label="Bedrooms"
                                            type="number"
                                            {...register('bedrooms')}
                                            error={errors.bedrooms?.message}
                                        />
                                        <Input
                                            label="Bathrooms"
                                            type="number"
                                            {...register('bathrooms')}
                                            error={errors.bathrooms?.message}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            {...register('description')}
                                            rows={6}
                                            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <Input label="Full Address" {...register('address')} error={errors.address?.message} />
                                    <Input label="City" {...register('city')} error={errors.city?.message} />
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Map Preview</label>
                                        <MapPlaceholder location={`${formData.address}, ${formData.city}`} className="aspect-video" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <FileUploader
                                        label="Property Images"
                                        accept="image/*"
                                        multiple
                                        existingFiles={images}
                                        onFilesChange={setImages}
                                    />
                                    <FileUploader
                                        label="Legal Documents"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        existingFiles={documents}
                                        onFilesChange={setDocuments}
                                    />
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="rounded-xl bg-gray-50 p-6 space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900">Review Changes</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-gray-500">Title:</div>
                                            <div className="font-medium text-gray-900">{formData.title}</div>
                                            <div className="text-gray-500">Price:</div>
                                            <div className="font-bold text-blue-600">${Number(formData.price).toLocaleString()}</div>
                                            <div className="text-gray-500">Status:</div>
                                            <div>{property?.status}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                                        Saving these changes will keep the listing in its current status: <strong>{property?.status}</strong>.
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-12 flex items-center justify-between border-t pt-8">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={currentStep === 1 || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>

                                {currentStep < STEPS.length ? (
                                    <Button type="button" onClick={nextStep}>
                                        Next Step
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isLoading} className="gap-2 px-8">
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                        Save Changes
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </DashboardShell>
        </ProtectedRoute>
    );
}
