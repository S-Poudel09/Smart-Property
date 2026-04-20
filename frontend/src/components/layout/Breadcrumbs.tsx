'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    if (paths.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 bg-white w-fit px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            <Link href="/" className="hover:text-purple-600 transition-colors flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
            </Link>

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                const label = path === 'dashboard' ? 'Dash' : path.replace(/-/g, ' ');

                return (
                    <div key={path} className="flex items-center space-x-2">
                        <ChevronRight className="h-3 w-3 text-gray-300" />
                        {isLast ? (
                            <span className="text-purple-600 truncate max-w-[120px]">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-gray-600 transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};
