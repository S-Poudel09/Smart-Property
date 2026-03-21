'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/lib/api/properties';
import { Button } from '@/components/common/Button';
import { FileUploader, FilePreview } from '@/components/common/FileUploader';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Save, FileText, Upload, Plus, X, Play, MapPin, Home } from 'lucide-react';

export default function SellerAddListingPage() {
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
        listing_type: 'sale',
        property_type: 'house',
        beds: '0',
        baths: '0',
        area_sqft: '',
        virtual_tour_url: '',
        boundary_coordinates: ''
    });

    const [images, setImages] = useState<FilePreview[]>([]);
    const [documents, setDocuments] = useState<FilePreview[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        // Append basic fields
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Append images
        images.forEach((filePreview) => {
            if (filePreview.file) {
                formData.append('uploaded_images', filePreview.file);
            }
        });

        // Append documents
        documents.forEach((filePreview) => {
            if (filePreview.file) {
                formData.append('uploaded_documents', filePreview.file);
            }
        });

        try {
            await createProperty(formData);
            toast.success("Listing created successfully. It is saved as DRAFT.");
            router.push('/dashboard/seller/listings');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create listing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Listing</h1>
                    <p className="text-gray-500 mt-2">Fill in the details to list your property on Smart Property.</p>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 2].map((s) => (
                        <div 
                            key={s} 
                            className={`h-2 w-12 rounded-full transition-colors ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                <Home className="h-5 w-5 text-blue-600" />
                                Basic Information
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title</label>
                                    <input 
                                        name="title" 
                                        required 
                                        value={form.title} 
                                        onChange={handleChange} 
                                        className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                        placeholder="e.g. Luxurious 4-Bedroom Villa with Ocean View" 
                                    />
                                </div>
                                
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        rows={4} 
                                        value={form.description} 
                                        onChange={handleChange} 
                                        className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                        placeholder="Provide a detailed description of the property features, amenities, and surroundings..." 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input name="price" type="number" required value={form.price} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                                    <input name="area_sqft" type="number" value={form.area_sqft} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                        <input name="beds" type="number" value={form.beds} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                        <input name="baths" type="number" value={form.baths} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                                        <select name="listing_type" value={form.listing_type} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3">
                                            <option value="sale">For Sale</option>
                                            <option value="rent">For Rent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                                        <select name="property_type" value={form.property_type} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3">
                                            <option value="house">House</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="condo">Condo</option>
                                            <option value="villa">Villa</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-2 space-y-4">
                                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                                        <MapPin className="h-5 w-5 text-red-500" />
                                        Location
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                            <input name="address" required value={form.address} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input name="city" required value={form.city} onChange={handleChange} className="w-full rounded-lg border-gray-300 border p-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t flex justify-end">
                                <Button type="button" onClick={() => setStep(2)} className="flex items-center gap-2">
                                    Continue to Media <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                                <Upload className="h-5 w-5 text-blue-600" />
                                Media & Documents
                            </div>
                            
                            <div className="space-y-6">
                                <FileUploader
                                    label="Property Images"
                                    accept="image/*"
                                    multiple
                                    onFilesChange={(newFiles) => setImages(newFiles)}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                                            <Play className="h-5 w-5 text-blue-600" />
                                            Virtual Tour
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">360° Tour URL (e.g. Matterport/Pannellum)</label>
                                            <input 
                                                name="virtual_tour_url" 
                                                value={form.virtual_tour_url} 
                                                onChange={handleChange} 
                                                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500" 
                                                placeholder="https://my.matterport.com/show/?m=..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                                            <MapPin className="h-5 w-5 text-red-500" />
                                            GIS Boundary
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Polygon Coordinates (JSON Array)</label>
                                            <textarea 
                                                name="boundary_coordinates" 
                                                value={form.boundary_coordinates} 
                                                onChange={handleChange} 
                                                rows={1}
                                                className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500" 
                                                placeholder="[[lat, lng], [lat, lng], ...]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                                    <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900">Legal Documents</h4>
                                        <p className="text-xs text-blue-700 mt-1">Upload title deeds, ownership certificates, or tax receipts. This helps in faster property verification.</p>
                                    </div>
                                </div>

                                <FileUploader
                                    label="Legal Documents (PDF/JPG)"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    onFilesChange={(newFiles) => setDocuments(newFiles)}
                                />
                            </div>

                            <div className="pt-6 border-t flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                    Back to Info
                                </Button>
                                <Button type="submit" variant="primary" disabled={loading} className="px-8">
                                    {loading ? 'Processing...' : 'Submit Listing for Review'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
