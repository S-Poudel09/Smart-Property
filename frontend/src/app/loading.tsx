import Container from '@/components/layout/Container';

export default function Loading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Container>
                <div className="flex flex-col items-center">
                    <div className="relative h-20 w-20">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                        Loading Experience...
                    </p>
                </div>
            </Container>
        </div>
    );
}
