'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Bell, Moon, Sun, ChevronDown, User, Settings, LogOut,
    X, Zap, Sparkles, Command, AlertCircle, Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/lib/store';

interface HeaderProps {
    title?: string;
}

export default function Header({ title = 'Command Center' }: HeaderProps) {
    const [showProfile, setShowProfile] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const { clinicUser, logout } = useAuth();
    const { darkMode, toggleDarkMode, activeNotifications } = useUIStore();
    const router = useRouter();

    const handleLogout = useCallback(async () => {
        await logout();
        router.push('/auth');
    }, [logout, router]);

    return (
        <header className="flex items-center justify-between px-10 h-[100px] flex-shrink-0 relative z-50 bg-white/30 backdrop-blur-xl border-b border-white/40">
            {/* Left Portion: Title & Intelligent Search */}
            <div className="flex items-center gap-10">
                <div className="hidden xl:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/20">
                        <Command className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h1 className="font-display font-black text-2xl tracking-tighter text-slate-900 leading-none">
                        {title}
                    </h1>
                </div>

                <div className="relative group hidden md:block">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        placeholder="Search protocols, patients..."
                        className="form-input !h-[54px] pl-14 pr-12 !bg-slate-50 border-transparent focus:!bg-white !w-[360px] text-sm font-bold tracking-tight"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2 py-1 rounded-md bg-white border border-slate-200">
                        <span className="text-[9px] font-black text-slate-400">⌘ K</span>
                    </div>
                </div>
            </div>

            {/* Right Portion: Systems Controls */}
            <div className="flex items-center gap-5">
                {/* AI Status Node */}
                <div className="hidden lg:flex items-center gap-3 px-5 h-[50px] rounded-2xl bg-emerald-50 border border-emerald-100/50">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="tag-label text-emerald-600">Neural Sync</span>
                    </div>
                    <div className="h-4 w-[1px] bg-emerald-200/50" />
                    <span className="tag-label text-emerald-900">Active</span>
                </div>

                {/* System Toggles */}
                <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200/50">
                    <button
                        onClick={toggleDarkMode}
                        className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600"
                    >
                        {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </button>
                    <div className="h-6 w-[1px] mx-1 bg-slate-200" />
                    <div className="relative">
                        <button
                            onClick={() => { setShowNotif(p => !p); setShowProfile(false); }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600"
                        >
                            <Bell className="w-4.5 h-4.5" />
                            {activeNotifications > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotif && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-[60px] w-80 glass-container !rounded-3xl !p-2 pt-4 overflow-hidden z-[100]"
                                >
                                    <div className="px-5 pb-4 border-b border-slate-100/50 flex justify-between items-center">
                                        <div className="font-black text-sm text-slate-900">Neural Alerts</div>
                                        <span className="tag-label text-indigo-500 !text-[8px]">{activeNotifications} New</span>
                                    </div>
                                    <div className="p-2 space-y-1 max-h-[320px] overflow-y-auto scrollbar-hide">
                                        {[
                                            { title: 'Protocol Sync', desc: 'Luna\'s nutrition vector updated.', time: '2m ago', icon: Zap, color: 'text-indigo-500' },
                                            { title: 'Threshold Alert', desc: 'Pharmacy inventory below 15%.', time: '14m ago', icon: AlertCircle, color: 'text-red-500' },
                                            { title: 'Registry Update', desc: '3 new patients added today.', time: '1h ago', icon: Users, color: 'text-emerald-500' },
                                        ].map((n, i) => (
                                            <button
                                                key={i}
                                                className="w-full flex items-start gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                                    <n.icon className={`w-5 h-5 ${n.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <div className="font-bold text-[12px] text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{n.title}</div>
                                                        <span className="text-[9px] font-medium text-slate-400">{n.time}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 leading-snug truncate">{n.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors border-t border-slate-100/50">
                                        View Repository
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Profile Matrix */}
                <div className="relative">
                    <button
                        onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
                        className="flex items-center gap-3 pl-2 pr-4 h-[58px] rounded-[22px] bg-white shadow-md border border-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-lg"
                            style={{ background: 'var(--gradient-primary)' }}>
                            {clinicUser?.displayName?.[0]?.toUpperCase()}
                        </div>
                        <div className="hidden sm:block text-left">
                            <div className="text-[12px] font-black text-slate-900 leading-none mb-1">
                                {clinicUser?.displayName?.split(' ')[0]}
                            </div>
                            <div className="tag-label text-indigo-500 !text-[8px]">{clinicUser?.role}</div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-[70px] w-64 glass-container !rounded-3xl !p-2 pt-4 overflow-hidden z-[100]"
                            >
                                <div className="px-5 pb-5 border-b border-slate-100/50">
                                    <div className="font-black text-sm text-slate-900">{clinicUser?.displayName}</div>
                                    <div className="text-[11px] font-medium text-slate-500 truncate">{clinicUser?.email}</div>
                                    <div className="mt-4 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-black text-[9px] uppercase tracking-widest inline-block">
                                        {clinicUser?.clinicName}
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    {[
                                        { icon: User, label: 'Node Profile', href: '/dashboard/settings' },
                                        { icon: Settings, label: 'System Preferences', href: '/dashboard/settings' },
                                        { icon: Zap, label: 'Expand Capacity', href: '/dashboard/settings' },
                                    ].map(item => (
                                        <button
                                            key={item.label}
                                            onClick={() => { router.push(item.href); setShowProfile(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 text-[11px] font-bold text-slate-600 hover:text-indigo-600 transition-all group"
                                        >
                                            <item.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                            {item.label}
                                        </button>
                                    ))}
                                    <div className="h-[1px] bg-slate-100/50 mx-4 my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-all group"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Terminate Sequence
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
