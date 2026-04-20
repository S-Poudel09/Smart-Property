'use client';

import Link from 'next/link';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-20 bg-gray-50/50">
            <Container>
                <div className="text-center max-w-2xl mx-auto">
                    <div className="relative mb-12">
                        <h1 className="text-[180px] font-black text-purple-600/10 leading-none">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900 border-b-4 border-purple-600 pb-2">Page Not Found</span>
                        </div>
                    </div>

                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Lost in the search?</h2>
                    <p className="text-xl text-gray-500 font-medium mb-12 leading-relaxed">
                        The property or page you&apos;re looking for was moved, deleted, or never existed in the first place.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/">
                            <Button className="rounded-2xl h-14 px-10 text-lg font-bold gap-3 shadow-xl shadow-purple-100">
                                <Home className="h-6 w-6" /> Back to Home
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => window.history.back()} className="rounded-2xl h-14 px-10 text-lg font-bold gap-3">
                            <ArrowLeft className="h-6 w-6" /> Go Back
                        </Button>
                    </div>
                </div>
            </Container>
        </div>
    );
}
