'use client';

import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeRegistry from '@/components/layout/ThemeRegistry';
import { AuthProvider } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-base' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-display' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className={`${outfit.className} antialiased selection:bg-indigo-100 selection:text-indigo-900`} suppressHydrationWarning>
        <ThemeRegistry>
          <AuthProvider>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-screen"
              >
                {children}
              </motion.div>
            </AnimatePresence>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(16px)',
                  color: '#111827',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: '20px',
                  padding: '16px 24px',
                  fontWeight: 600,
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                },
              }}
            />
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
