'use client';

import { Shield, Users, Key, AlertCircle, Plus, Edit2, Trash2, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const STAFF = [
    { id: 'S1', name: 'Dr. Rakesh Kumar', role: 'Admin', email: 'rakesh@clawspaws.ai', status: 'Active', permissions: 'Full' },
    { id: 'S2', name: 'Dr. Ananya Singh', role: 'Veterinarian', email: 'ananya@vet.claws.ai', status: 'Active', permissions: 'Clinical' },
    { id: 'S3', name: 'James Wilson', role: 'Staff', email: 'james@claws.ai', status: 'Active', permissions: 'Limited' },
    { id: 'S4', name: 'Sarah Miller', role: 'Vet Tech', email: 'sarah@claws.ai', status: 'On Leave', permissions: 'Clinical' },
];

export default function AccessControlPage() {
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
                        {STAFF.map((s, i) => (
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
                                            <div className="text-xs text-muted">ID: {s.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{s.role}</span></td>
                                <td><div className="text-xs font-bold text-muted">{s.permissions} Access</div></td>
                                <td className="text-xs text-muted">2 hours ago</td>
                                <td><span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                                <td>
                                    <div className="flex gap-1">
                                        <button className="btn-ghost p-2 rounded-lg"><Mail className="w-4 h-4" /></button>
                                        <button className="btn-ghost p-2 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                        <button className="btn-ghost p-2 rounded-lg text-error"><Trash2 className="w-4 h-4" /></button>
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
