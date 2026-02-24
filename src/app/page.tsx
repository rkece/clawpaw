'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push('/dashboard');
            } else {
                router.push('/auth');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center animate-bounce shadow-2xl">
                    <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin" />
                </div>
                <div className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing System...</div>
            </div>
        </div>
    );
}
