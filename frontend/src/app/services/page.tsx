'use client';

import Marketplace from '@/components/services/Marketplace';
import Container from '@/components/layout/Container';

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-[#FCFBF8] py-32 overflow-hidden">
            <Container>
                <Marketplace />
            </Container>
        </div>
    );
}
