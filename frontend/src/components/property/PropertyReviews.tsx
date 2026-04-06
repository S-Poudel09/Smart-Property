'use client';

import { useState } from 'react';
import { 
    Star, MessageSquare, User, 
    Calendar, CheckCircle2, Send,
    Loader2, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Review } from '@/types/property';
import { getProperty } from '@/lib/api/properties';
import api from '@/lib/api/http';
import { toast } from 'react-hot-toast';
import { getUser } from '@/lib/auth/getUser';

interface PropertyReviewsProps {
    propertyId: string;
    reviews: Review[];
    onReviewAdded: () => void;
}

export default function PropertyReviews({ propertyId, reviews, onReviewAdded }: PropertyReviewsProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = getUser();

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        if (!user) {
            toast.error('Identity validation required for feedback');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post(`properties/${propertyId}/add-review/`, {
                rating,
                comment
            });
            setComment('');
            setRating(5);
            toast.success('Feedback node synchronized');
            onReviewAdded();
        } catch (err) {
            toast.error('Feedback synchronization failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-12 lg:p-16 rounded-[3rem] border border-slate-100 shadow-sm space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tighter italic uppercase flex items-center gap-6">
                        <MessageSquare className="h-8 w-8 text-indigo-600" />
                        Community Intelligence
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">Social Proof & Asset Reputation</p>
                </div>
                
                {reviews.length > 0 && (
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="text-4xl font-black text-slate-900 italic">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                        </div>
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`h-3 w-3 ${s <= (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? 'fill-indigo-500 text-indigo-500' : 'text-slate-200'}`} />
                                ))}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{reviews.length} Verified Entries</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Review Submission */}
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl -mr-12 -mt-12" />
                
                <div className="flex items-center justify-between relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 italic">Inject Feedback Node</p>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button 
                                key={s} 
                                onClick={() => setRating(s)}
                                className="group/star active:scale-90 transition-transform"
                            >
                                <Star className={`h-6 w-6 transition-colors ${s <= rating ? 'fill-indigo-600 text-indigo-600' : 'text-slate-300 group-hover/star:text-indigo-400'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Establish your perspective on this asset cluster..."
                        className="w-full h-40 bg-white border border-slate-200 rounded-2xl p-8 text-slate-900 text-base font-medium italic focus:border-indigo-500 transition-all outline-none resize-none shadow-inner"
                    />
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !comment.trim()}
                        className="absolute bottom-6 right-6 h-14 pl-6 pr-8 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-4 disabled:opacity-30 italic active:scale-95 group/submit"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 group-submit:translate-x-1" />}
                        {isSubmitting ? 'Syncing...' : 'Broadcast Feedback'}
                    </button>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-8">
                {reviews.length === 0 ? (
                    <div className="p-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center text-center">
                        <MessageSquare className="h-12 w-12 text-slate-100 mb-6" />
                        <p className="text-slate-400 text-sm font-medium italic max-w-sm">No reputation logs available for this node. Be the first to establish community intelligence.</p>
                    </div>
                ) : (
                    reviews.map((review, idx) => (
                        <motion.div 
                            key={review.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex gap-8 group hover:border-indigo-100 transition-all"
                        >
                            <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                <User className="h-8 w-8" />
                            </div>
                            
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 italic">{review.user.full_name}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-1 flex items-center gap-3">
                                            <Calendar className="h-3.5 w-3.5" /> Established {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-indigo-600 text-indigo-600' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                
                                <p className="text-slate-600 text-base leading-relaxed font-medium italic italic">
                                    "{review.comment}"
                                </p>
                                
                                {review.isVerifiedPurchase && (
                                    <div className="flex items-center gap-3 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 w-fit px-4 py-2 rounded-full border border-emerald-100 italic">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Asset Exchange Completion
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

