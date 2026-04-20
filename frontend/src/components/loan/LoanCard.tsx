'use client';

import { LoanRequest } from '@/types/loan';
import { getPropertyById } from '@/lib/properties/storage';

import { Building2, IndianRupee, Calendar } from 'lucide-react';
import { LoanStatusBadge } from './LoanStatusBadge';
import Link from 'next/link';
import { Button } from '../common/Button';

interface LoanCardProps {
    loan: LoanRequest;
    baseUrl: string;
}

export const LoanCard = ({ loan, baseUrl }: LoanCardProps) => {
    const property = getPropertyById(loan.propertyId);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{property?.title || 'Unknown Property'}</h3>
                            <p className="text-xs text-gray-500">{property?.city}</p>
                        </div>
                    </div>
                    <LoanStatusBadge status={loan.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Requested Amount</p>
                        <div className="flex items-center text-sm font-bold text-gray-900">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {loan.amountRequested.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Applied Date</p>
                        <div className="flex items-center text-sm font-bold text-gray-900">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(loan.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <Link href={`${baseUrl}/${loan.id}`}>
                    <Button variant="outline" className="w-full text-xs h-9">
                        View Application Details
                    </Button>
                </Link>
            </div>
        </div>
    );
};
