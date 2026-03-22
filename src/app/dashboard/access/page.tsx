'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Users, Key, AlertCircle, Plus, Edit2, Trash2, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getStaffMembers, addStaffMember } from '@/lib/db-service';
import type { StaffMember } from '@/lib/db-service';
import toast from 'react-hot-toast';

export default function AccessControlPage() {
    const { clinicUser } = useAuth();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    const loadStaff = useCallback(async () => {
        if (!clinicUser?.clinicId) return;
        setLoading(true);
        try {
            const data = await getStaffMembers(clinicUser.clinicId);
            setStaff(data);
        } catch (err) {
            toast.error('Failed to sync staff registry');
        } finally {
            setLoading(false);
        }
    }, [clinicUser?.clinicId]);

    useEffect(() => {
        loadStaff();
    }, [loadStaff]);

    return (
        <div className="content-wrapper">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        <Shield className="w-6 h-6 text-primary-light" />
                        Clinic RBAC Access
                    </h2>
                    <p className="text-sm text-muted">Role-Based Access Control and security node management</p>
                </div>
                <button className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Staff Member
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Active Licenses</div>
                        <div className="text-2xl font-black text-white">4 / 10</div>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-success bg-opacity-10 flex items-center justify-center text-success">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">MFA Compliance</div>
                        <div className="text-2xl font-black text-white">100%</div>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-error bg-opacity-10 flex items-center justify-center text-error">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Audit State</div>
                        <div className="text-2xl font-black text-white">Verified</div>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Staff Profile</th>
                            <th>System Role</th>
                            <th>Permission Set</th>
                            <th>Last Signed In</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                        ) : staff.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-20 text-muted">No staff found in this registry node.</td></tr>
                        ) : staff.map((s, i) => (
                            <motion.tr
                                key={s.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-elevated border border-subtle flex items-center justify-center font-bold text-xs text-primary-light">
                                            {s.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white">{s.name}</div>
                                            <div className="text-xs text-muted">Node: {s.id?.slice(-6).toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{s.role}</span></td>
                                <td><div className="text-xs font-bold text-muted capitalize">{s.permissions} Access</div></td>
                                <td className="text-xs text-muted">{s.lastLogin ? new Date(s.lastLogin).toLocaleString() : 'Never'}</td>
                                <td><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                                <td>
                                    <div className="flex gap-1">
                                        <button className="btn-ghost p-2 rounded-lg"><Mail className="w-4 h-4" /></button>
                                        <button className="btn-ghost p-2 rounded-lg" title="Edit Staff"><Edit2 className="w-4 h-4" /></button>
                                        <button className="btn-ghost p-2 rounded-lg text-error" title="Revoke Access"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}

                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-glass border border-dashed border-subtle">
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-white mb-2">Audit Synchronization Policy</h4>
                        <p className="text-xs text-muted leading-relaxed">
                            All role changes are logged in the clinic&apos;s master audit chain. Modifications to <span className="text-primary-light font-bold">Admin</span> roles require secondary approval from the primary clinic registrant.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
