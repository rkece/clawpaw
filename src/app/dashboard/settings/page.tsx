'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, User, Building2, CreditCard, Shield,
    Bell, Globe, Moon, Lock, Check, Zap, Info,
    ExternalLink, Mail, Save, Loader2, Key
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { clinicUser, logout, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clinicUser) return;
        setLoading(true);
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const updates: any = {};
            
            if (activeTab === 'profile') {
                updates.displayName = formData.get('displayName');
                await updateProfile(updates);
            } else if (activeTab === 'clinic') {
                updates.clinicName = formData.get('clinicName');
                updates.address = formData.get('address');
                updates.phone = formData.get('phone');
                await updateProfile(updates);
            }
        } catch (err) {
            console.error('Update failed:', err);
            toast.error('Sync failed. Terminal node disconnected.');
        } finally {
            setLoading(false);
        }
    };


    const TABS = [
        { id: 'profile', label: 'User Profile', icon: User },
        { id: 'clinic', label: 'Clinic Info', icon: Building2 },
        { id: 'billing', label: 'Subscription', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="content-wrapper max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    <Settings className="w-6 h-6 text-primary-light" />
                    System Administration
                </h2>
                <p className="text-sm text-muted">Manage your clinic profile, billing, and global configuration</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* ── Sidebar Tabs ────────────────────────────────── */}
                <div className="w-full lg:w-64 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-primary'
                                : 'text-muted hover:bg-glass hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.id === 'billing' && <span className="ml-auto badge badge-warning text-[9px]">Pro</span>}
                        </button>
                    ))}
                    <div className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-muted mt-8 border-t border-subtle">
                        Session
                    </div>
                    <button
                        onClick={() => { logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error hover:bg-opacity-10 transition-all font-bold text-sm"
                    >
                        <Lock className="w-4 h-4" />
                        Termination Session
                    </button>
                </div>

                {/* ── Content Area ────────────────────────────────── */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="glass-card p-8"
                            >
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-subtle">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-black shadow-xl">
                                        {clinicUser?.displayName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{clinicUser?.displayName}</h3>
                                        <p className="text-sm text-muted">{clinicUser?.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="badge badge-primary">{clinicUser?.role} Account</span>
                                            <span className="badge badge-info flex items-center gap-1"><Shield className="w-3 h-3" /> HW Verified</span>
                                        </div>
                                    </div>
                                    <button className="btn-secondary ml-auto text-xs">Update Avatar</button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Full Identity Name</label>
                                            <input name="displayName" defaultValue={clinicUser?.displayName} className="form-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Clinical Designation</label>
                                            <input name="designation" placeholder="Senior Veterinary Surgeon" className="form-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">VCN Registration No</label>
                                            <input name="vcnId" placeholder="VCN-2024-X99" className="form-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Language Node</label>
                                            <select name="language" className="form-input">
                                                <option>English (Global)</option>
                                                <option>Hindi (India)</option>
                                            </select>
                                        </div>

                                    </div>
                                    <div className="pt-6">
                                        <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Synchronize Changes
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* CLINIC TAB */}
                        {activeTab === 'clinic' && (
                            <motion.div
                                key="clinic"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold">Organization Settings</h3>
                                        <p className="text-sm text-muted">Manage clinical facility data and branding</p>
                                    </div>
                                    <div className="badge badge-success">Active Entity</div>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-glass border border-subtle border-l-4 border-l-primary flex items-start gap-4">
                                        <Building2 className="w-6 h-6 text-primary mt-1" />
                                        <div>
                                            <div className="font-bold mb-1">Clinic Brand: {clinicUser?.clinicName}</div>
                                            <p className="text-xs text-muted">All generated reports and diet plans will carry this branding header.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Global Clinic Name</label>
                                            <input name="clinicName" defaultValue={clinicUser?.clinicName} className="form-input" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Clinic Address (Multiline)</label>
                                            <textarea name="address" rows={3} placeholder="Sector 42, HSR Layout, Bangalore - 560102" className="form-input py-3" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Support Email</label>
                                                <input name="email" placeholder="contact@pawclinic.com" className="form-input" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Emergency Hotline</label>
                                                <input name="phone" placeholder="+91 98765 43210" className="form-input" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-3">
                                        <button type="submit" disabled={loading} className="btn-primary">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Organization Data
                                        </button>
                                        <button type="button" className="btn-secondary">Upload Clinic Logo</button>
                                    </div>
                                </form>

                            </motion.div>
                        )}

                        {/* BILLING TAB */}
                        {activeTab === 'billing' && (
                            <motion.div
                                key="billing"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="glass-card p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <Zap className="w-24 h-24 text-primary opacity-5" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="badge badge-warning py-1 px-3">Enterprise Pro</div>
                                        <span className="text-xs text-muted font-bold tracking-widest uppercase">Next Renewal: March 12, 2026</span>
                                    </div>
                                    <h3 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>$49.00 <span className="text-sm font-bold text-muted">/per month</span></h3>
                                    <p className="text-sm text-secondary-light font-medium mb-8">Unlimited patients, AI priority queue, and branded PDF generation.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-subtle">
                                        <div>
                                            <div className="text-[10px] font-black text-muted uppercase mb-1">Metric: Patients</div>
                                            <div className="font-bold">50,000 / Unlimited</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-muted uppercase mb-1">Storage Node</div>
                                            <div className="font-bold">2.4 GB / 50 GB</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-muted uppercase mb-1">API Throughput</div>
                                            <div className="font-bold text-success">Optimized</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-8">
                                    <h4 className="font-bold mb-6 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-muted" /> Payment Matrix
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl border border-subtle bg-elevated flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-6 bg-primary bg-opacity-20 rounded flex items-center justify-center font-bold text-[8px] tracking-widest border border-primary border-opacity-30">VISA</div>
                                                <div>
                                                    <div className="text-sm font-bold">•••• •••• •••• 4242</div>
                                                    <div className="text-[10px] text-muted uppercase">Expires 12/28</div>
                                                </div>
                                            </div>
                                            <button className="text-xs font-bold text-primary-light">Manage</button>
                                        </div>
                                    </div>
                                    <button className="w-full btn-secondary mt-6">View Billing History <ExternalLink className="w-3 h-3 ml-2" /></button>
                                </div>
                            </motion.div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-8"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-xl font-bold">Security & Sentinel</h3>
                                    <div className="badge badge-success px-2 py-0.5"><Check className="w-3 h-3 mr-1" /> Encrypted</div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-6 rounded-2xl bg-glass border border-subtle space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Key className="w-4 h-4 text-primary" /> Key Exchange Matrix
                                        </h4>
                                        <p className="text-xs text-muted leading-relaxed">Ensure your clinic&apos;s data sovereignty by regularly updating credentials and reviewing audit logs.</p>
                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <button className="btn-secondary text-xs">Reset Encryption Key</button>
                                            <button className="btn-secondary text-xs">Rotate Passwords</button>
                                            <button className="btn-secondary text-xs">2FA Setup</button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-subtle hover:bg-glass transition-all">
                                            <div>
                                                <div className="text-sm font-bold">Multi-tenant Isolation</div>
                                                <div className="text-[10px] text-muted">Strict node-level data separation active</div>
                                            </div>
                                            <div className="w-10 h-5 bg-success bg-opacity-20 rounded-full flex items-center justify-center border border-success border-opacity-30">
                                                <div className="w-2 h-2 rounded-full bg-success pulse-dot" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
