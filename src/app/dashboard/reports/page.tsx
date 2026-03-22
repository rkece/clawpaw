'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Search, Eye, Filter, Calendar, ChevronRight, FileDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getDietPlans, getAuditLogs } from '@/lib/db-service';
import type { StoredDietPlan, AuditLog } from '@/lib/db-service';

interface ReportEntry {
    id: string;
    patient: string;
    owner: string;
    type: 'Nutrition Plan' | 'Audit Log';
    date: string;
    size: string;
    rawDate: number;
    status: string;
    version?: number;
}

export default function ReportsPage() {
    const { clinicUser } = useAuth();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<ReportEntry[]>([]);
    const [stats, setStats] = useState({ total: 0, plans: 0, audits: 0 });


    useEffect(() => {
        if (clinicUser?.clinicId) {
            Promise.all([
                getDietPlans(clinicUser.clinicId),
                getAuditLogs(clinicUser.clinicId, 50),
            ]).then(([plans, audits]) => {
                // Build report entries from real diet plans
                const planReports = plans.map((p: StoredDietPlan, i: number) => {
                    const speciesLabel = p.species ? p.species.charAt(0).toUpperCase() + p.species.slice(1) : 'Patient';
                    return {
                        id: `DP-${(p.id || '').slice(-4).toUpperCase() || (1000 + i)}`,
                        patient: p.petName || 'Unknown Patient',
                        owner: `${speciesLabel} · ${p.breed || 'Unknown Breed'}`,
                        type: 'Nutrition Plan' as const,
                        date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        size: `${(JSON.stringify(p.analysis).length / 1024).toFixed(1)} KB`,
                        rawDate: p.createdAt,
                        status: p.status,
                        version: p.version,
                    };
                });


                // Build report entries from audit logs
                const auditReports = audits.slice(0, 20).map((a: AuditLog, i: number) => ({
                    id: `AL-${(a.id || '').slice(-4).toUpperCase() || (2000 + i)}`,
                    patient: a.category,
                    owner: a.details.substring(0, 40),
                    type: 'Audit Log' as const,
                    date: new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    size: '—',
                    rawDate: a.timestamp,
                    status: 'logged',
                }));


                const allReports = [...planReports, ...auditReports].sort((a, b) => b.rawDate - a.rawDate);
                setReports(allReports);
                setStats({
                    total: allReports.length,
                    plans: planReports.length,
                    audits: auditReports.length,
                });
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [clinicUser]);

    const filtered = reports.filter(r =>
        r.patient.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.owner.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="content-wrapper">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        <FileText className="w-6 h-6 text-primary-light" />
                        Clinical Reports
                    </h2>
                    <p className="text-sm text-muted">A repository of all generated medical and dietary documentation</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary">
                        <Calendar className="w-4 h-4" /> Date Range
                    </button>
                    <button className="btn-primary">
                        <FileDown className="w-4 h-4" /> Archive All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Reports', value: loading ? '...' : stats.total.toString(), color: '#7C3AED' },
                    { label: 'Nutrition Plans', value: loading ? '...' : stats.plans.toString(), color: '#06B6D4' },
                    { label: 'Audit Logs', value: loading ? '...' : stats.audits.toString(), color: '#F59E0B' },
                    { label: 'Success Rate', value: '99.8%', color: '#10B981' },
                ].map((kpi, i) => (
                    <div key={i} className="glass-card p-6">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{kpi.label}</div>
                        <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{kpi.value}</div>
                        <div className="w-full h-1 bg-glass mt-3 rounded-full overflow-hidden">
                            <div className="h-full" style={{ background: kpi.color, width: '70%' }} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card">
                <div className="p-4 border-b border-subtle flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by report ID, patient or type..."
                            className="form-input pl-10"
                        />
                    </div>
                    <button className="btn-secondary px-4">
                        <Filter className="w-4 h-4" /> Sort By
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Report ID</th>
                                <th>Patient / Details</th>
                                <th>Doc Type</th>
                                <th>Generated</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-light" />
                                        <span className="text-sm text-muted font-bold">Loading reports from registry...</span>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <FileText className="w-8 h-8 mx-auto mb-2 text-muted opacity-40" />
                                        <span className="text-sm text-muted">No reports found. Generate diet plans to create reports.</span>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r, i) => (
                                    <motion.tr
                                        key={`${r.id}-${i}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group"
                                    >
                                        <td className="font-bold text-primary-light">#{r.id}</td>
                                        <td>
                                            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.patient}</div>
                                            <div className="text-[10px] text-muted">{r.owner}</div>
                                        </td>
                                        <td><span className={`badge ${r.type === 'Nutrition Plan' ? 'badge-primary' : 'badge-info'}`}>{r.type}</span></td>
                                        <td className="text-xs text-muted">{r.date}</td>
                                        <td className="text-xs text-muted font-bold">{r.size}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button className="btn-ghost p-2 rounded-lg hover:bg-primary hover:bg-opacity-10"><Eye className="w-4 h-4" /></button>
                                                <button className="btn-ghost p-2 rounded-lg hover:bg-success hover:bg-opacity-10"><Download className="w-4 h-4" /></button>
                                                <button className="btn-ghost p-2 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
