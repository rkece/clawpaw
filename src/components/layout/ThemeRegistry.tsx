'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const { darkMode } = useUIStore();

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.setAttribute('data-theme', 'dark');
            root.classList.add('dark');
        } else {
            root.setAttribute('data-theme', 'light');
            root.classList.remove('dark');
        }
    }, [darkMode]);

    return <>{children}</>;
}
