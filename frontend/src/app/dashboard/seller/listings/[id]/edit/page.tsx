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
    FileText,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

import DashboardShell from '@/components/layout/DashboardShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FileUploader, FilePreview } from '@/components/common/FileUploader';
import { getProperty, updateProperty } from '@/lib/api/properties';
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
    // Hostel Support
    hostel_gender: z.string().optional(),
    available_beds: z.coerce.number().optional(),
    bathroom_type: z.string().optional(),
    room_type: z.string().optional(),
    food_included: z.boolean().optional(),
    has_wifi: z.boolean().optional(),
    has_laundry: z.boolean().optional(),
    model_3d_url: z.string().optional().or(z.literal('')),
    tour_360_url: z.string().optional().or(z.literal('')),
});

type ListingFormValues = z.infer<typeof listingSchema>;

const STEPS = [
    { id: 1, title: 'Identity', icon: Info },
    { id: 2, title: 'Metrics', icon: Building2 },
    { id: 3, title: 'Geographic', icon: MapPin },
    { id: 4, title: 'Visuals', icon: ImageIcon },
    { id: 5, title: 'Commit', icon: CheckCircle2 },
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
        resolver: zodResolver(listingSchema) as any,
    });

    const formData = watch();

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                setIsFetching(true);
                const data = await getProperty(id as string);
                if (!data) {
                    toast.error('Asset not found in registry');
                    router.push('/dashboard/seller/listings');
                    return;
                }

                // Secure Ownership Verification Segment
                // Allow admins to pass through, but enforce strict ownership check for sellers to prevent node hijacking
                const isOwner = user && (String(data.sellerId) === String(user.user_id) || String(data.sellerId) === String(user.id));
                const isAdmin = user?.role?.toLowerCase() === 'admin';

                if (user && !isOwner && !isAdmin) {
                    toast.error('Unauthorized node access');
                    router.push('/dashboard/seller');
                    return;
                }

                setProperty(data);
                reset({
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    type: data.type as 'sale' | 'rent',
                    category: data.category as 'house' | 'flat' | 'bungalow' | 'apartment' | 'commercial' | 'hostel' | 'land',
                    bedrooms: data.bedrooms,
                    bathrooms: data.bathrooms,
                    area: data.area,
                    address: data.address || data.location.split(',')[1]?.trim() || '',
                    city: data.city || data.location.split(',')[0]?.trim() || '',
                    // Hostel Initial Load Segment
                    hostel_gender: data.hostel_gender || data.hostelGender || 'boys',
                    available_beds: data.available_beds || data.availableBeds || 0,
                    bathroom_type: data.bathroom_type || data.bathroomType || 'shared',
                    room_type: data.room_type || data.roomType || '',
                    food_included: !!(data.food_included || data.foodIncluded),
                    has_wifi: !!(data.has_wifi || data.hasWifi),
                    has_laundry: !!(data.has_laundry || data.hasLaundry),
                    // @ts-ignore
                    model_3d_url: data.modelUrl || data.model_3d_url || '',
                    // @ts-ignore
                    tour_360_url: data.virtualTourUrl || data.tour_360_url || '',
                });

                if (data.images) {
                    setImages(data.images.map(img => {
                        const url = typeof img === 'string' ? img : (img as { previewUrl?: string }).previewUrl ?? '';
                        return { previewUrl: url, name: 'Registry Image', type: 'image/jpeg' };
                    }));
                }
                setIsFetching(false);
            } catch (e) {
                toast.error('Strategic sync failure');
                router.push('/dashboard/seller/listings');
            }
        };
        load();
    }, [id, reset, router]);

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

        const submissionData = new FormData();
        submissionData.append('title', data.title);
        submissionData.append('description', data.description);
        submissionData.append('price', data.price.toString());
        submissionData.append('listing_type', data.type);
        submissionData.append('property_type', data.category);
        submissionData.append('beds', data.bedrooms.toString());
        submissionData.append('baths', data.bathrooms.toString());
        submissionData.append('area_sqft', data.area.toString());
        submissionData.append('address', data.address);
        submissionData.append('city', data.city);
        submissionData.append('location', `${data.address}, ${data.city}`);
        
        // @ts-ignore
        if (data.model_3d_url) submissionData.append('model_3d_url', data.model_3d_url);
        // @ts-ignore
        if (data.tour_360_url) submissionData.append('tour_360_url', data.tour_360_url);

        // Hostel Support Transmission Segment
        if (data.category === 'hostel') {
            if (data.hostel_gender) submissionData.append('hostel_gender', data.hostel_gender);
            if (data.available_beds !== undefined) submissionData.append('available_beds', data.available_beds.toString());
            if (data.bathroom_type) submissionData.append('bathroom_type', data.bathroom_type);
            if (data.room_type) submissionData.append('room_type', data.room_type);
            submissionData.append('food_included', String(!!data.food_included));
            submissionData.append('has_wifi', String(!!data.has_wifi));
            submissionData.append('has_laundry', String(!!data.has_laundry));
        }

        images.forEach((img) => {
            if (img.file) submissionData.append('uploaded_images', img.file);
        });

        documents.forEach((doc) => {
            if (doc.file) submissionData.append('uploaded_documents', doc.file);
        });

        try {
            await updateProperty(property.id, submissionData);
            toast.success('Asset registry updated successfully!');
            router.push('/dashboard/seller/listings');
        } catch (e) {
            toast.error('Registry update protocol failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <DashboardShell title="Strategic Edit Interface">
                <div className="flex h-96 flex-col items-center justify-center gap-6">
                    <div className="h-12 w-12 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 italic">Decrypting Asset Node...</p>
                </div>
            </DashboardShell>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['seller']}>
            <div className="max-w-7xl mx-auto py-8 px-6">
                <Link href="/dashboard/seller/listings" className="mb-12 inline-flex items-center gap-4 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest group">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:border-indigo-100 transition-all shadow-sm">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Abort Edits & Restore Matrix
                </Link>

                {/* Stepper */}
                <div className="mb-20 flex justify-between relative px-20">
                    <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-10" />
                    {STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-4 flex-1">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-[1.25rem] border-2 transition-all duration-500 ${isActive ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-110' :
                                    isCompleted ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' :
                                        'border-slate-100 bg-white text-slate-300'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : (
                                        (() => {
                                            const Icon = step.icon;
                                            return <Icon className="h-5 w-5" />;
                                        })()
                                    )}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-300'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-[3rem] border border-slate-200/60 bg-white shadow-2xl shadow-indigo-100/30 overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="p-12">
                            {currentStep === 1 && (
                                <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                                     <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter italic flex items-center gap-4">
                                        <div className="h-2 w-10 bg-indigo-600 rounded-full" /> Node Identification
                                     </h2>
                                     <Input label="Asset Designation" {...register('title')} error={errors.title?.message} className="text-lg font-bold" />
                                     <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 pt-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Contract Protocol</label>
                                            <select {...register('type')} className="w-full h-16 bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 text-sm font-black outline-none focus:border-indigo-600 transition-all">
                                                <option value="sale">Direct Acquisition (Sale)</option>
                                                <option value="rent">Temporary Lease (Rent)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Structural Variant</label>
                                            <select {...register('category')} className="w-full h-16 bg-slate-50 border border-slate-200 rounded-[1.25rem] px-5 text-sm font-black outline-none focus:border-indigo-600 transition-all">
                                                <option value="house">Residency</option>
                                                <option value="apartment">Executive Unit</option>
                                                <option value="commercial">Trade Nexus</option>
                                                <option value="land">Open Terrain</option>
                                                <option value="hostel">Communal Node (Hostel)</option>
                                            </select>
                                        </div>
                                     </div>

                                     {formData.category === 'hostel' && (
                                        <div className="p-10 bg-indigo-50/40 rounded-[2.5rem] border border-indigo-100/50 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900 italic">Hostel Specification Protocol</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Admission Policy</label>
                                                    <select {...register('hostel_gender')} className="w-full h-16 bg-white border border-slate-200 rounded-[1.25rem] px-5 text-sm font-black outline-none focus:border-indigo-600 transition-all">
                                                        <option value="boys">Boys Only</option>
                                                        <option value="girls">Girls Only</option>
                                                        <option value="mixed">Mixed / Co-ed</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Bathroom Proto</label>
                                                    <select {...register('bathroom_type')} className="w-full h-16 bg-white border border-slate-200 rounded-[1.25rem] px-5 text-sm font-black outline-none focus:border-indigo-600 transition-all">
                                                        <option value="attached">Attached Bathroom</option>
                                                        <option value="shared">Shared Facility</option>
                                                    </select>
                                                </div>
                                                <Input label="Bed Inventory Count" type="number" {...register('available_beds')} />
                                                <Input label="Room Segment Class" placeholder="e.g. 2-Seater, 3-Seater" {...register('room_type')} />
                                            </div>
                                            <div className="flex flex-wrap gap-8 pt-4 border-t border-indigo-100">
                                                {[
                                                    { id: 'food_included', label: 'Mess / Food' },
                                                    { id: 'has_wifi', label: 'High-Speed Wifi' },
                                                    { id: 'has_laundry', label: 'Laundry System' }
                                                ].map((amenity) => (
                                                    <label key={amenity.id} className="flex items-center gap-4 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                        {...register(amenity.id as keyof ListingFormValues)}
                                                            className="w-6 h-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500/20 transition-all"
                                                        />
                                                        <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{amenity.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                     )}
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter italic flex items-center gap-4">
                                        <div className="h-2 w-10 bg-emerald-500 rounded-full" /> Technical Metrics
                                    </h2>
                                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                                        <Input label="Valuation (NPR)" type="number" {...register('price')} error={errors.price?.message} />
                                        <Input label="Spatial Volume (Sq Ft)" type="number" {...register('area')} error={errors.area?.message} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                                        <Input label="Dormitories (Beds)" type="number" {...register('bedrooms')} error={errors.bedrooms?.message} />
                                        <Input label="Sanitation (Baths)" type="number" {...register('bathrooms')} error={errors.bathrooms?.message} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2 block mb-3">Analysis & Details</label>
                                        <textarea {...register('description')} rows={6} className="w-full rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all" />
                                        {errors.description && <p className="mt-2 text-xs text-red-500 font-bold">{errors.description.message}</p>}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                                     <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter italic flex items-center gap-4">
                                        <div className="h-2 w-10 bg-purple-500 rounded-full" /> Sector Placement
                                     </h2>
                                     <Input label="Tactical Address" {...register('address')} error={errors.address?.message} />
                                     <Input label="Central Hub (City)" {...register('city')} error={errors.city?.message} />
                                     
                                     <div className="pt-10 border-t border-slate-100 space-y-8 md:col-span-2">
                                         <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 italic">3D & Interactive Portals</h3>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                             {/* @ts-ignore */}
                                             <Input label="3D Model Link (GLB / GLTF URL)" {...register('model_3d_url')} error={errors.model_3d_url?.message} />
                                             {/* @ts-ignore */}
                                             <Input label="360° Tour Link (Matterport / Pannellum URL)" {...register('tour_360_url')} error={errors.tour_360_url?.message} />
                                         </div>
                                     </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter italic flex items-center gap-4">
                                        <div className="h-2 w-10 bg-violet-600 rounded-full" /> Resource Injection
                                    </h2>
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                        <FileUploader id="edit-images" label="Optical Samples (New Images)" accept="image/*" multiple onFilesChange={setImages} />
                                    </div>
                                    <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100">
                                        <FileUploader id="edit-documents" label="Regulatory Credentials (New Documents)" accept=".pdf,.jpg,.jpeg,.png" multiple onFilesChange={setDocuments} />
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                                     <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter italic flex items-center gap-4">
                                        <div className="h-2 w-10 bg-slate-900 rounded-full" /> Final Configuration
                                     </h2>
                                     <div className="rounded-[2.5rem] bg-indigo-900 p-10 text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                                        <h3 className="text-xl font-black font-outfit mb-8 italic tracking-tighter">Asset Manifest Review</h3>
                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Designation</p>
                                                <p className="text-sm font-bold truncate">{formData.title}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Valuation</p>
                                                <p className="text-xl font-black text-indigo-100 tabular-nums">{Number(formData.price).toLocaleString()} NPR</p>
                                            </div>
                                        </div>
                                        <div className="mt-10 p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                                            <ShieldCheck className="h-6 w-6 text-indigo-400" />
                                            <p className="text-[11px] font-medium italic opacity-80">&quot;Node reconfiguration will maintain the current approval status. Core verification history remains intact.&quot;</p>
                                        </div>
                                     </div>
                                </div>
                            )}
                        </div>

                        <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <button type="button" onClick={prevStep} disabled={currentStep === 1 || isLoading} className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === 1 ? 'opacity-0' : 'text-slate-400 hover:text-indigo-600'}`}>
                                <ChevronLeft className="h-4 w-4" /> Restore Prev Segment
                            </button>

                            {currentStep < STEPS.length ? (
                                <Button type="button" onClick={nextStep} className="h-16 px-12 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-200 group">
                                    Advance Segment <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-white transition-colors" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isLoading} className="h-16 px-14 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all gap-4">
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit Reconfiguration
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
