import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Payment | Smart Property',
    description: 'Secure property payment powered by Khalti',
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Minimal header — no dashboard nav */}
            <header className="shrink-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center">
                        <span className="text-white font-black text-sm">SP</span>
                    </div>
                    <span className="font-black text-slate-900 tracking-tight">Smart Property</span>
                </Link>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                    Secured by Khalti
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="shrink-0 py-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100">
                © {new Date().getFullYear()} Smart Property · All transactions are encrypted and secured
            </footer>
        </div>
    );
}
