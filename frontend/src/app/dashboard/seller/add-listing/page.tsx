'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/lib/api/properties';
import { Button } from '@/components/common/Button';
import { FileUploader, FilePreview } from '@/components/common/FileUploader';
import { toast } from 'react-hot-toast';
import { 
    ArrowLeft, ArrowRight, Home, MapPin, 
    Upload, FileText, CheckCircle2, ChevronRight, 
    ChevronLeft, ShieldCheck 
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const InputField = ({ label, name, type = "text", required = false, placeholder = "", value, onChange, error }: any) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
            {error && <span className="text-[10px] text-red-500 font-black uppercase tracking-widest animate-pulse">Required</span>}
        </label>
        <input 
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all duration-300 ${
                error ? 'border-red-400 bg-red-50/10' : 'border-slate-200'
            }`}
        />
        {error && <p className="text-[11px] text-red-500 font-bold italic pl-2">{error[0]}</p>}
    </div>
);

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            toast.success("Asset intelligence submitted for verification!");
            router.push('/dashboard/seller/listings');
        } catch (error: any) {
            if (error.response?.data && typeof error.response.data === 'object') {
                setFieldErrors(error.response.data);
                toast.error("Validation error in registry details.");
                
                const step1Fields = ['title', 'price', 'district', 'municipality', 'ward', 'address'];
                if (step1Fields.some(f => error.response.data[f])) {
                    setStep(1);
                }
            } else {
                toast.error("Strategic failure during asset creation.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            <Home className="h-5 w-5" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Inventory Entry</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter">Register New Asset</h1>
                    <p className="text-slate-500 font-medium italic border-l-4 border-indigo-600/20 pl-8 max-w-xl">
                        "Enlist your property securely within our verified imperial registry for high-intent asset acquisition."
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-3xl border border-slate-200">
                    {[1, 2].map((i) => (
                        <div key={i} className={`flex items-center gap-2 px-6 py-2 rounded-[1.25rem] transition-all duration-500 ${step === i ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400'}`}>
                             <span className="text-[10px] font-black uppercase tracking-widest">{i === 1 ? 'Logistics' : 'Verification'}</span>
                        </div>
                    ))}
                </div>
            </header>

            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-slate-200/60 shadow-2xl shadow-indigo-100 overflow-hidden">
                <div className="p-12">
                    {step === 1 ? (
                        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
                            <section>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-2 w-10 bg-indigo-600 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter">Core Asset Parameters</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <InputField 
                                            label="Asset Designation" 
                                            name="title" 
                                            required 
                                            placeholder="e.g. Imperial Domain in Central Kathmandu"
                                            value={form.title}
                                            onChange={handleChange}
                                            error={fieldErrors.title}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700 block mb-2">Technical Description</label>
                                        <textarea 
                                            name="description" 
                                            rows={5} 
                                            value={form.description} 
                                            onChange={handleChange} 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none transition-all duration-300"
                                            placeholder="Details regarding architecture, amenities, and strategic value..."
                                        />
                                    </div>
                                    <InputField label="Acquisition Price (NPR)" name="price" type="number" required value={form.price} onChange={handleChange} error={fieldErrors.price} />
                                    <InputField label="Total Land Area (sqft)" name="area_sqft" type="number" required value={form.area_sqft} onChange={handleChange} error={fieldErrors.area_sqft} />
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputField label="Quarters (Beds)" name="beds" type="number" value={form.beds} onChange={handleChange} error={fieldErrors.beds} />
                                        <InputField label="Sanitation (Baths)" name="baths" type="number" value={form.baths} onChange={handleChange} error={fieldErrors.baths} />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Contract Type</label>
                                            <select name="listing_type" value={form.listing_type} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all">
                                                <option value="sale">Direct Acquisition (Sale)</option>
                                                <option value="rent">Temporary Lease (Rent)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Structural Class</label>
                                            <select name="property_type" value={form.property_type} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all">
                                                <option value="house">Standard Residency</option>
                                                <option value="apartment">Executive Flat</option>
                                                <option value="hostel">Hostel / PG</option>
                                                <option value="land">Undeveloped Terrain</option>
                                                <option value="commercial">Commercial Building</option>
                                            </select>
                                        </div>
                                    </div>

                                    {form.property_type === 'hostel' && (
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-500">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900">Hostel Protocol Parameters</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Hostel Admission Policy</label>
                                                <select name="hostel_gender" value={(form as any).hostel_gender || 'mixed'} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all">
                                                    <option value="boys">Boys Only</option>
                                                    <option value="girls">Girls Only</option>
                                                    <option value="mixed">Mixed / Co-ed</option>
                                                </select>
                                            </div>
                                            <InputField label="Available Bed Inventory" name="available_beds" type="number" value={(form as any).available_beds || '0'} onChange={handleChange} />
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Sanitation Protocol</label>
                                                <select name="bathroom_type" value={(form as any).bathroom_type || 'shared'} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all">
                                                    <option value="attached">Attached Bathroom</option>
                                                    <option value="shared">Shared Facility</option>
                                                </select>
                                            </div>
                                            <InputField label="Room Configuration" name="room_type" placeholder="e.g. 2-Seater, 3-Seater" value={(form as any).room_type || ''} onChange={handleChange} />
                                            
                                            <div className="md:col-span-2 flex flex-wrap gap-6 pt-4">
                                                {[
                                                    { id: 'food_included', label: 'Mess / Food Included' },
                                                    { id: 'has_wifi', label: 'High-Speed Internet' },
                                                    { id: 'has_laundry', label: 'Laundry System' }
                                                ].map((amenity) => (
                                                    <label key={amenity.id} className="flex items-center gap-3 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            name={amenity.id} 
                                                            checked={(form as any)[amenity.id] === true || (form as any)[amenity.id] === 'true'} 
                                                            onChange={(e) => setForm(prev => ({ ...prev, [amenity.id]: e.target.checked }))}
                                                            className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500/20 transition-all"
                                                        />
                                                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{amenity.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-10 pt-10 border-t border-slate-100">
                                    <div className="h-2 w-10 bg-red-500 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter">Geographic Deployment</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Administrative District <span className="text-red-500">*</span></label>
                                        <select name="district" required value={form.district} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none focus:border-indigo-600 transition-colors">
                                            <option value="">Select Territory</option>
                                            <option value="Kathmandu">Kathmandu</option>
                                            <option value="Lalitpur">Lalitpur</option>
                                            <option value="Bhaktapur">Bhaktapur</option>
                                            <option value="Pokhara">Pokhara</option>
                                        </select>
                                    </div>
                                    <InputField label="Municipality Area" name="municipality" required value={form.municipality} onChange={handleChange} error={fieldErrors.municipality} />
                                    <InputField label="Sector / Ward" name="ward" required value={form.ward} onChange={handleChange} error={fieldErrors.ward} />
                                    <InputField label="Tactical Address / Tol" name="address" required value={form.address} onChange={handleChange} error={fieldErrors.address} />
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
                            <section>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-2 w-10 bg-indigo-600 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter">Visual Intelligence</h2>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/50">
                                    <FileUploader
                                        label="Strategic Asset Documentation (Images)"
                                        accept="image/*"
                                        multiple
                                        onFilesChange={(newFiles) => setImages(newFiles)}
                                    />
                                    <p className="text-[11px] text-slate-400 mt-4 font-bold uppercase tracking-widest pl-4">* Minimum 3 high-resolution captures required.</p>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-10 pt-10 border-t border-slate-100">
                                    <div className="h-2 w-10 bg-indigo-400 rounded-full"></div>
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tighter">Verification Credentials</h2>
                                </div>
                                <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[2.5rem] mb-10 flex gap-6 italic">
                                    <ShieldCheck className="h-8 w-8 text-indigo-600 shrink-0" />
                                    <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                                        "Digital submission of Title Deeds (Lalpurja) and authentic identification ensures prioritized verification by our intelligence board."
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200/50">
                                    <FileUploader
                                        label="Asset Decree / Title Deed (PDF/JPG)"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        onFilesChange={(newFiles) => setDocuments(newFiles)}
                                    />
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <div className="px-12 py-10 bg-slate-50/80 border-t border-slate-200 flex justify-between items-center">
                    <button 
                        type="button"
                        onClick={() => step > 1 && setStep(step - 1)}
                        className={`flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                        <ChevronLeft className="h-4 w-4" /> Operations Back
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="h-16 px-12 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-900/10 flex items-center gap-4 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Transmitting Data...' : step === 1 ? 'Advance to Verification' : 'Commit to Registry'}
                        {step === 1 && <ChevronRight className="h-4 w-4 text-white/50" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
