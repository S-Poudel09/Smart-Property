'use client';

import { useEffect } from 'react';
import Container from '@/components/layout/Container';
import { Button } from '@/components/common/Button';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-20 bg-gray-100/50">
            <Container>
                <div className="text-center max-w-2xl mx-auto bg-white p-12 rounded-[40px] shadow-2xl shadow-purple-100 border border-gray-100">
                    <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <AlertCircle className="h-12 w-12 text-rose-500" />
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-4">Something went wrong!</h1>
                    <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed">
                        We encountered an unexpected error while processing your request. Our team has been notified.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            onClick={() => reset()}
                            className="w-full sm:w-auto rounded-2xl h-14 px-10 text-lg font-bold gap-3 shadow-xl shadow-purple-100"
                        >
                            <RefreshCw className="h-6 w-6" /> Try Again
                        </Button>
                        <Link href="/" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full rounded-2xl h-14 px-10 text-lg font-bold gap-3">
                                <Home className="h-6 w-6" /> Back to Home
                            </Button>
                        </Link>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-12 p-6 bg-gray-50 rounded-2xl text-left border border-gray-100 overflow-auto max-h-40">
                            <p className="text-xs font-mono text-gray-600 break-words">{error.message}</p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
