'use client';

import { useEffect, useState } from 'react';
import { getServiceBookings } from '@/lib/api/services';
import { Loader } from '@/components/common/Loader';
import { formatNPR } from '@/lib/utils/currency';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BuyerServiceRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getServiceBookings();
        setBookings(data);
      } catch (e) {
        console.error('Failed to load service bookings', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader size="lg" /></div>;

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-black uppercase text-slate-400">No service requests found.</p>
        <Link href="/dashboard/services" className="text-indigo-600 font-black underline mt-4 inline-block">
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter mb-6">My Service Requests</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-slate-900 font-outfit">{b.service_details?.name || 'Service'}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'}`}>{b.status}</span>
            </div>
            <p className="text-sm text-slate-600 mb-2 italic">{b.notes}</p>
            {b.property_id && (
              <p className="text-xs text-slate-500 mb-2">Property ID: {b.property_id}</p>
            )}
            <p className="text-sm font-medium text-slate-900">Requested on: {new Date(b.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
