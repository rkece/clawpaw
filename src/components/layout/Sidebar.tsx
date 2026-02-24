'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Utensils, BarChart3, Activity, Settings,
    LogOut, PawPrint, ChevronLeft, ChevronRight, Pill, ShoppingBag,
    Shield, Sparkles, Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/lib/store';
import clsx from 'clsx';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    section?: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Intelligence Hub', href: '/dashboard', icon: LayoutDashboard, section: 'core' },
    { label: 'Patient Registry', href: '/dashboard/patients', icon: Users, section: 'core' },
    { label: 'Dietary Node', href: '/dashboard/diet-planner', icon: Utensils, section: 'core' },
    { label: 'Clinical Analytics', href: '/dashboard/analytics', icon: BarChart3, section: 'ops' },
    { label: 'Compliance Audit', href: '/dashboard/compliance', icon: Activity, section: 'ops' },
    { label: 'Pharmacy Engine', href: '/dashboard/pharma', icon: Pill, section: 'infra' },
    { label: 'Medical Store', href: '/dashboard/store', icon: ShoppingBag, section: 'infra' },
    { label: 'Access Control', href: '/dashboard/access', icon: Shield, section: 'admin' },
    { label: 'System Settings', href: '/dashboard/settings', icon: Settings, section: 'admin' },
];

const SECTIONS = [
    { key: 'core', label: 'Systems' },
    { key: 'ops', label: 'Operations' },
    { key: 'infra', label: 'Infrastructure' },
    { key: 'admin', label: 'Authority' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { clinicUser, logout } = useAuth();
    const { sidebarOpen, toggleSidebar } = useUIStore();

    const handleLogout = async () => {
        await logout();
        router.push('/auth');
    };

    return (
        <motion.aside
            animate={{ width: sidebarOpen ? 280 : 96 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="flex-shrink-0 relative flex flex-col h-screen overflow-hidden bg-white/60 backdrop-blur-3xl border-r border-slate-100/50 z-[100]"
        >
            {/* ── Brand Cluster ─────────────────────────────────── */}
            <div className="flex items-center px-8 h-[100px] mb-6">
                <AnimatePresence mode="wait">
                    {sidebarOpen ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-100 overflow-hidden">
                                <img src="/logo.svg" alt="CP Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <span className="font-display font-black text-lg tracking-tight text-slate-900 block leading-tight">Claws & Paws</span>
                                <span className="tag-label !text-[8px] !text-indigo-500 opacity-80">v5.2 Neural Node</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 overflow-hidden">
                                <img src="/logo.svg" alt="CP Logo" className="w-full h-full object-cover" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Navigation Stack ──────────────────────────────── */}
            <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide space-y-8 pb-10">
                {SECTIONS.map(section => {
                    const items = NAV_ITEMS.filter(i => i.section === section.key);
                    return (
                        <div key={section.key} className="space-y-1">
                            {sidebarOpen && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
                                        {section.label}
                                    </span>
                                </motion.div>
                            )}

                            <div className="space-y-0.5">
                                {items.map(item => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={clsx(
                                                'group relative flex items-center gap-4 px-5 h-[48px] rounded-[18px] transition-all duration-300',
                                                isActive ? 'bg-indigo-600 shadow-xl shadow-indigo-100' : 'hover:bg-slate-50'
                                            )}
                                        >
                                            <div className={clsx(
                                                'flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                                                sidebarOpen ? 'w-5' : 'mx-auto'
                                            )}>
                                                <item.icon className={clsx(
                                                    'w-5 h-5',
                                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                                                )} />
                                            </div>

                                            {sidebarOpen && (
                                                <span className={clsx(
                                                    'text-[13px] font-bold tracking-tight truncate flex-1',
                                                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                                                )}>
                                                    {item.label}
                                                </span>
                                            )}

                                            {isActive && !sidebarOpen && (
                                                <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full shadow-glow" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* ── User Authority Pod ────────────────────────────── */}
            <div className="p-6">
                <div className={clsx(
                    'glass-container !rounded-3xl p-4 bg-white shadow-xl shadow-slate-100/50 border-white overflow-hidden transition-all duration-500',
                    !sidebarOpen && 'p-2'
                )}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs text-white shadow-lg bg-indigo-600">
                            {clinicUser?.displayName?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-black tracking-tight truncate text-slate-800 leading-none mb-1">
                                    {clinicUser?.displayName ?? 'Operator'}
                                </div>
                                <div className="text-[10px] font-bold text-indigo-500 opacity-70 truncate">{clinicUser?.clinicName ?? 'Clinic'}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-3 h-[48px] rounded-2xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        {sidebarOpen && <span className="text-[11px] font-black uppercase tracking-widest">Terminate</span>}
                    </button>
                    {!sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="w-[48px] h-[48px] rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Float Command Toggle */}
            {sidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all z-50 group"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>
            )}
        </motion.aside>
    );
}
