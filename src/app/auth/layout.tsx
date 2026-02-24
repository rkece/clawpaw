'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';

function AuthPageWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) router.replace('/dashboard');
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    return <>{children}</>;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthPageWrapper>{children}</AuthPageWrapper>
        </AuthProvider>
    );
}
