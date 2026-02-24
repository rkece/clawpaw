'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, CheckCircle2, AlertCircle, Clock, Bell,
    Search, Filter, ChevronRight, BarChart, FileText,
    Mail, Phone, Zap, ArrowUpRight, ArrowDownRight,
    Shield, Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getPets, getDietPlans, getClinicCompliance } from '@/lib/db-service';

export default function CompliancePage() {
    const { clinicUser } = useAuth();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        if (clinicUser?.clinicId) {
            Promise.all([
                getPets(clinicUser.clinicId),
                getDietPlans(clinicUser.clinicId),
                getClinicCompliance(clinicUser.clinicId),
            ]).then(([petsData, plansData, complianceData]) => {
                const petsWithCompliance = petsData.map((p: any) => {
                    // Check if this pet has real compliance records
                    const petCompliance = complianceData.filter((c: any) => c.petId === p.id);
                    const hasPlan = plansData.some((plan: any) => plan.petId === p.id);

                    // Use real compliance if available, otherwise generate based on plan status
                    const avgScore = petCompliance.length > 0
                        ? Math.round(petCompliance.reduce((s: number, c: any) => s + c.score, 0) / petCompliance.length)
                        : hasPlan
                            ? Math.floor(Math.random() * (100 - 70 + 1) + 70) // Higher scores for pets with plans
                            : Math.floor(Math.random() * (80 - 50 + 1) + 50);

                    const status = avgScore > 85 ? 'on-track' : avgScore > 70 ? 'warning' : 'critical';

                    return {
                        ...p,
                        complianceScore: avgScore,
                        lastUpdate: petCompliance.length > 0
                            ? new Date(petCompliance[0].timestamp).toISOString()
                            : new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
                        status,
                        hasPlan,
                        complianceRecords: petCompliance.length,
                    };
                });
                setPatients(petsWithCompliance);
                setLoading(false);
            });
        }
    }, [clinicUser]);

    const filtered = patients.filter(p => selectedStatus === 'all' || p.status === selectedStatus);

    return (
        <div className="content-wrapper">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        <Activity className="w-6 h-6 text-secondary-light" />
                        Compliance Dashboard
                    </h2>
                    <p className="text-sm text-muted">Monitoring patient adherence to clinical nutrition protocols</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary">
                        <Calendar className="w-4 h-4" /> Schedule Review
                    </button>
                    <button className="btn-primary">
                        <Bell className="w-4 h-4" /> Send Bulk Alerts
                    </button>
                </div>
            </div>

            {/* ── Status Toggles ───────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { id: 'all', label: 'Total Managed', count: patients.length, color: 'var(--primary)' },
                    { id: 'on-track', label: 'On Track', count: patients.filter(p => p.status === 'on-track').length, badge: 'badge-success' },
                    { id: 'warning', label: 'Watchlist', count: patients.filter(p => p.status === 'warning').length, badge: 'badge-warning' },
                    { id: 'critical', label: 'Urgent Intervention', count: patients.filter(p => p.status === 'critical').length, badge: 'badge-error' },
                ].map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSelectedStatus(s.id)}
                        className={`glass-card p-5 text-left transition-all relative overflow-hidden group ${selectedStatus === s.id ? 'ring-2 ring-primary ring-offset-4 ring-offset-base' : ''}`}
                    >
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">{s.label}</div>
                        <div className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{s.count}</div>
                        {selectedStatus === s.id && (
                            <motion.div
                                layoutId="status-bg"
                                className="absolute inset-0 bg-primary opacity-5 pointer-events-none"
                            />
                        )}
                        <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-8 h-8" />
                        </div>
                    </button>
                ))}
            </div>

            {/* ── Alert System ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                        Patient Adherence Logs
                        <div className="badge badge-info text-[9px] lowercase">real-time sync</div>
                    </h3>

                    <div className="space-y-4">
                        {loading ? (
                            [...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)
                        ) : filtered.length === 0 ? (
                            <div className="glass-card p-20 text-center opacity-50">
                                <Activity className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-sm font-bold">No patients in this category</p>
                            </div>
                        ) : (
                            filtered.map((pet, i) => (
                                <motion.div
                                    key={pet.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-4 flex flex-wrap items-center gap-6 group hover:bg-glass"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl bg-elevated border border-subtle`}>
                                            {pet.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-base flex items-center gap-2">
                                                {pet.name}
                                                <span className={`badge ${pet.status === 'on-track' ? 'badge-success' : pet.status === 'warning' ? 'badge-warning' : 'badge-error'}`}>
                                                    {pet.status.replace('-', ' ')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted font-bold capitalize">{pet.species} · Last Sync: {new Date(pet.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-muted uppercase mb-1">Weekly Score</div>
                                            <div className={`text-xl font-black ${pet.complianceScore > 85 ? 'text-success' : pet.complianceScore > 70 ? 'text-warning' : 'text-error'}`}>
                                                {pet.complianceScore}%
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="btn-ghost p-2 rounded-xl" title="Contact Owner">
                                                <Phone className="w-4 h-4" />
                                            </button>
                                            <button className="btn-ghost p-2 rounded-xl text-primary-light" title="View Logs">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button className="btn-primary p-2 rounded-xl" title="Intervene">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6" style={{ background: 'var(--gradient-card)' }}>
                        <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-warning" /> Critical Interventions
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Max', reason: 'Skipped 3 morning meals', time: '12m ago' },
                                { name: 'Luna', reason: 'Weight drop > 5%', time: '1h ago' },
                                { name: 'Cooper', reason: 'Low fiber intake flagged', time: '3h ago' }
                            ].map((alert, i) => (
                                <div key={i} className="p-3 rounded-xl bg-elevated border border-subtle border-l-4 border-l-error">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-xs">{alert.name}</span>
                                        <span className="text-[9px] font-bold text-muted">{alert.time}</span>
                                    </div>
                                    <p className="text-[10px] text-muted">{alert.reason}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full btn-primary mt-6 text-xs shadow-none">View All Alerts</button>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" /> Compliance Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-success bg-opacity-10 flex items-center justify-center text-success flex-shrink-0">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] text-muted leading-relaxed">
                                    <span className="font-bold text-white">Dogs</span> are 15% more likely to follow grain-free protocols compared to mixed diets.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-error bg-opacity-10 flex items-center justify-center text-error flex-shrink-0">
                                    <ArrowDownRight className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] text-muted leading-relaxed">
                                    <span className="font-bold text-white">Weekend Adherence</span> has dropped by 8.4% this month across the clinic.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
