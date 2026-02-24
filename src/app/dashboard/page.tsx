'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Utensils, Activity, TrendingUp, Plus, ArrowRight,
    Zap, Sparkles, Clock, Calendar, ChevronRight, Search, Filter,
} from 'lucide-react';
import Link from 'next/link';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getClinicAnalytics } from '@/lib/db-service';

// ── KPI Card Upgrade ───────────────────────────────────────────
function KPICard({ label, value, icon: Icon, trend, color, delay = 0 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className="kpi-card group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{trend}</span>
                    </div>
                )}
            </div>

            <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-5xl font-display font-black tracking-tighter text-slate-900 mb-2"
            >
                {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.div>
            <div className="tag-label opacity-60">{label}</div>

            {/* Background Glow Node */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full"
                style={{ background: color }} />
        </motion.div>
    );
}

const DASHBOARD_COLORS = ['#6366F1', '#0EA5E9', '#F59E0B', '#10B981'];

export default function DashboardPage() {
    const { clinicUser } = useAuth();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!clinicUser?.clinicId) return;
        try {
            const data = await getClinicAnalytics(clinicUser.clinicId);
            setAnalytics(data);
        } catch (err) {
            console.error('Analytics error:', err);
        } finally {
            setLoading(false);
        }
    }, [clinicUser?.clinicId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) return (
        <div className="p-10 space-y-8 h-full">
            <div className="flex justify-between items-end mb-12">
                <div className="space-y-4">
                    <div className="h-4 w-40 skeleton" />
                    <div className="h-12 w-64 skeleton" />
                </div>
                <div className="h-14 w-48 skeleton" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => <div key={i} className="h-44 rounded-[40px] skeleton" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-[400px] rounded-[40px] skeleton" />
                <div className="h-[400px] rounded-[40px] skeleton" />
            </div>
        </div>
    );

    const speciesData = Object.entries(analytics?.speciesCounts ?? {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
    }));

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1600px] mx-auto overflow-hidden">

            {/* ── Intelligence Header ─────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Enterprise Node active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="tag-label">Synchronized</span>
                        </div>
                    </div>
                    <h1 className="text-6xl font-display font-black tracking-tighter text-slate-900 leading-[0.9]">
                        Operational <br />
                        <span className="gradient-text italic">Intelligence</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium mt-6 max-w-sm leading-relaxed">
                        Welcome back, Dr. {clinicUser?.displayName?.split(' ')?.[0]}. All clinical layers are optimized.
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex gap-4">
                    <button className="btn-secondary h-16 px-8 rounded-[22px] bg-slate-50 border border-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Log Sequence
                    </button>
                    <Link href="/dashboard/diet-planner" className="btn-primary h-16 px-10 rounded-[22px] flex items-center gap-3">
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] uppercase tracking-widest font-black">Generate Protocol</span>
                    </Link>
                </motion.div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Patient Registry', value: analytics?.totalPatients ?? 0, icon: Users, color: '#6366F1', trend: '+14%' },
                    { label: 'Protocols Active', value: analytics?.totalPlans ?? 0, icon: Zap, color: '#0EA5E9', trend: '+8%' },
                    { label: 'Intelligence Depth', value: `${analytics?.avgCompliance ?? 0}%`, icon: Activity, color: '#10B981', trend: 'Optimal' },
                    { label: 'Avg Synthesis', value: `${analytics?.avgSynthesis ?? 0}%`, icon: TrendingUp, color: '#F59E0B', trend: '+2%' }
                ].map((kpi, i) => (
                    <KPICard key={kpi.label} {...kpi} delay={0.2 + i * 0.1} />
                ))}
            </div>

            {/* ── Data Visualizer Layer ────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Area Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="glass-container p-10 lg:col-span-2 overflow-hidden group"
                >
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-display font-black tracking-tight text-slate-900">Throughput Analysis</h3>
                            <p className="tag-label opacity-60 mt-1">Real-time data stream protocol</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 tag-label">30 Day Window</div>
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.monthlyPlans ?? []}>
                                <defs>
                                    <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.04)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '16px 20px'
                                    }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={5} fill="url(#colorInd)" animationDuration={2500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Registry Distribution Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="glass-container p-10"
                >
                    <h3 className="text-2xl font-display font-black tracking-tight text-slate-900 mb-2">Species Matrix</h3>
                    <p className="tag-label opacity-60 mb-10">Database partition</p>

                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={speciesData}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={2000}
                                >
                                    {speciesData.map((_, i) => <Cell key={i} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4 mt-8">
                        {speciesData.map((s, i) => (
                            <div key={s.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: DASHBOARD_COLORS[i % DASHBOARD_COLORS.length] }} />
                                    <span className="tag-label text-slate-600">{s.name}</span>
                                </div>
                                <span className="text-xl font-display font-black text-slate-900">{s.value as number}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Transactional Feed Layer ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="glass-container p-10 lg:col-span-2 shadow-sm border-slate-100"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-display font-black tracking-tight text-slate-900">Neural Activity</h3>
                        </div>
                        <button className="tag-label text-indigo-500 hover:text-indigo-600 transition-colors">Audit Full Node</button>
                    </div>

                    <div className="space-y-4">
                        {(analytics?.recentActivity ?? []).slice(0, 5).map((activity: any, i: number) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + i * 0.05 }}
                                className="flex items-center gap-6 p-5 rounded-[26px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-md font-black text-slate-900 border border-slate-100 group-hover:scale-110 transition-transform">
                                    {activity.user[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-slate-900">{activity.action}</div>
                                    <div className="text-xs font-medium text-slate-400 truncate">{activity.details}</div>
                                </div>
                                <div className="tag-label opacity-40">
                                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="glass-container p-12 bg-indigo-600 border-none relative overflow-hidden group shadow-2xl shadow-indigo-200"
                >
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white opacity-10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />

                    <div className="relative z-10 space-y-10">
                        <div className="w-16 h-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-3xl font-display font-black text-white leading-tight">AI Clinical Insight</h3>
                            <p className="text-indigo-100 font-medium leading-relaxed opacity-80">
                                Based on current patient clusters, we recommend deploying Phosphorus restriction protocols for Stage 3 CKD feline patients immediately.
                            </p>
                        </div>

                        <button className="w-full h-16 rounded-2xl bg-white text-indigo-600 font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all">
                            Initialize Protocol
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
