'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/lib/api/properties';
import { Button } from '@/components/common/Button';
import { FileUploader, FilePreview } from '@/components/common/FileUploader';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Home, MapPin, Upload, FileText, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SellerAddListingPage() {
    return (
        <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <AddListingContent />
        </ProtectedRoute>
    );
}

function AddListingContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    
    // Form state
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        address: '',
        city: '',
        district: '',
        municipality: '',
        ward: '',
        listing_type: 'sale',
        property_type: 'house',
        beds: '0',
        baths: '0',
        area_sqft: '',
        area_ropani: '',
        area_anna: '',
        virtual_tour_url: '',
        boundary_coordinates: ''
    });

    const [images, setImages] = useState<FilePreview[]>([]);
    const [documents, setDocuments] = useState<FilePreview[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        if (step < 2) {
            setStep(step + 1);
            return;
        }

        setLoading(true);

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== '') {
                formData.append(key, value);
            }
        });

        // Ensure newly listed properties are automatically submitted for review
        formData.append('status', 'submitted');

        formData.append('location', `${form.address}, ${form.municipality}, ${form.district}`);

        images.forEach((filePreview) => {
            if (filePreview.file) {
                formData.append('uploaded_images', filePreview.file);
            }
        });

        documents.forEach((filePreview) => {
            if (filePreview.file) {
                formData.append('uploaded_documents', filePreview.file);
            }
        });

        try {
            await createProperty(formData);
            toast.success("Property created successfully!");
            router.push('/dashboard/seller/listings');
        } catch (error: any) {
            if (error.response?.data && typeof error.response.data === 'object') {
                setFieldErrors(error.response.data);
                toast.error("Please fix the errors in the form.");
                
                const step1Fields = ['title', 'price', 'district', 'municipality', 'ward', 'address'];
                if (step1Fields.some(f => error.response.data[f])) {
                    setStep(1);
                }
            } else {
                toast.error("Failed to create property.");
            }
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, name, type = "text", required = false, placeholder = "" }: any) => (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
            <input 
                type={type}
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                    fieldErrors[name] ? 'border-red-500 bg-red-50/10' : 'border-border'
                }`}
            />
            {fieldErrors[name] && <p className="text-[11px] text-red-500 font-medium italic">{fieldErrors[name][0]}</p>}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
                    <p className="text-gray-500 mt-1">List your property on the most trusted marketplace in Nepal.</p>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 2].map((i) => (
                        <div key={i} className={`h-1.5 w-12 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </header>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-8 animate-fade-in">
                            <section>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                    <Home className="h-5 w-5 text-primary" />
                                    <h2 className="font-bold text-gray-900">Basic Information</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <InputField label="Listing Title" name="title" required placeholder="e.g. Modern Villa in Bhaisepati" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Description</label>
                                        <textarea 
                                            name="description" 
                                            rows={4} 
                                            value={form.description} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Tell us more about the property..."
                                        />
                                    </div>
                                    <InputField label="Price (Rs)" name="price" type="number" required />
                                    <InputField label="Total Area (sqft)" name="area_sqft" type="number" required />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Bedrooms" name="beds" type="number" />
                                        <InputField label="Bathrooms" name="baths" type="number" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Listing Type</label>
                                            <select name="listing_type" value={form.listing_type} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm outline-none">
                                                <option value="sale">For Sale</option>
                                                <option value="rent">For Rent</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Property Type</label>
                                            <select name="property_type" value={form.property_type} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm outline-none">
                                                <option value="house">House</option>
                                                <option value="apartment">Apartment</option>
                                                <option value="land">Land</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                    <MapPin className="h-5 w-5 text-red-500" />
                                    <h2 className="font-bold text-gray-900">Location Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">District <span className="text-red-500">*</span></label>
                                        <select name="district" required value={form.district} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-sm outline-none">
                                            <option value="">Select District</option>
                                            <option value="Kathmandu">Kathmandu</option>
                                            <option value="Lalitpur">Lalitpur</option>
                                            <option value="Bhaktapur">Bhaktapur</option>
                                            <option value="Pokhara">Pokhara</option>
                                        </select>
                                    </div>
                                    <InputField label="Municipality" name="municipality" required />
                                    <InputField label="Ward No." name="ward" required />
                                    <InputField label="Street Address / Tol" name="address" required />
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            <section>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                    <Upload className="h-5 w-5 text-primary" />
                                    <h2 className="font-bold text-gray-900">Property Media</h2>
                                </div>
                                <FileUploader
                                    label="Upload Property Images"
                                    accept="image/*"
                                    multiple
                                    onFilesChange={(newFiles) => setImages(newFiles)}
                                />
                                <p className="text-[11px] text-gray-500 mt-2 italic">* Upload at least 3 clear images of the property.</p>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                                    <FileText className="h-5 w-5 text-emerald-500" />
                                    <h2 className="font-bold text-gray-900">Verification Documents</h2>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg mb-6 flex gap-3 italic">
                                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                                    <p className="text-xs text-emerald-800 leading-relaxed">
                                        Uploading clear scans of your Lalpurja and citizenship certificate will speed up the approval process significantly.
                                    </p>
                                </div>
                                <FileUploader
                                    label="Title Deed / Lalpurja (PDF or Image)"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    onFilesChange={(newFiles) => setDocuments(newFiles)}
                                />
                            </section>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-border flex justify-between items-center">
                    <button 
                        type="button"
                        onClick={() => step > 1 && setStep(step - 1)}
                        className={`flex items-center gap-2 text-sm font-bold transition-all ${step === 1 ? 'opacity-0 cursor-default' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    
                    <Button type="submit" disabled={loading} className="px-8 h-12 rounded-lg font-bold min-w-[140px]">
                        {loading ? 'Processing...' : step === 1 ? 'Continue' : 'Submit Listing'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

