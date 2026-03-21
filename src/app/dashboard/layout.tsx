'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

function DashboardGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/auth');
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-base)' }}>
                    Initializing Clinic Portal...
                </span>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'var(--font-base)' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto" style={{ background: 'transparent' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardGuard>{children}</DashboardGuard>
    );
}
