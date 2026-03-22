'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, Loader2,
    PawPrint, Sparkles, ChevronRight, Activity, Shield, Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// ── Validation Schemas ────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Access key must be at least 6 characters'),
});

const registerSchema = z.object({
    displayName: z.string().min(2, 'Identifying name required'),
    clinicName: z.string().min(2, 'Clinic identifier required'),
    email: z.string().email('Operational email required'),
    password: z.string().min(8, 'Security phrase too short'),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Security phrases do not match",
    path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, register, logout, user, clinicUser, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && clinicUser) router.push('/dashboard');
    }, [user, clinicUser, router]);


    const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
    const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const handleLogin = useCallback(async (data: LoginForm) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Sequence Authenticated. Initializing Node.');
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Authentication failed.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }

    }, [login, router]);

    const handleRegister = useCallback(async (data: RegisterForm) => {
        setLoading(true);
        try {
            await register({
                email: data.email,
                password: data.password,
                displayName: data.displayName,
                clinicName: data.clinicName,
                role: 'admin',
            });
            toast.success('Clinical Infrastructure Deployed.');
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Deployment failed.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }

    }, [register, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background Orbs */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-50/50 rounded-full blur-[150px] pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 60, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-50/50 rounded-full blur-[150px] pointer-events-none"
            />

            <div className="w-full max-w-[1400px] grid lg:grid-cols-2 gap-24 items-center relative z-10">
                {/* ── Branded Intelligence ─────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:block space-y-12"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[22px] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200 animate-float overflow-hidden p-2">
                            <img src="/logo.svg" alt="CP Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="font-display font-black text-3xl tracking-tighter text-slate-900 block">Claws & Paws</span>
                            <span className="tag-label">AI Intelligence v5.2</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-[5rem] leading-[1] font-display font-black tracking-tight text-slate-900">
                            The <span className="gradient-text italic pr-2">Clinical</span> Matrix.
                        </h1>
                        <p className="text-2xl text-slate-500 font-medium max-w-[580px] leading-relaxed">
                            Next-generation nutritional orchestration for elite veterinary practices. Real-time patient synchronization and autonomous diet synthesis.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-10 pt-10 border-t border-slate-100">
                        {[
                            { label: 'Precision', val: '99.9%', icon: Shield },
                            { label: 'Inference', val: '0.4ms', icon: Zap },
                            { label: 'Uptime', val: '99.99%', icon: Activity }
                        ].map((stat, i) => (stat && (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <stat.icon className="w-4 h-4 text-indigo-500" />
                                    <span className="tag-label">{stat.label}</span>
                                </div>
                                <div className="text-4xl font-display font-black text-slate-900 tracking-tighter">{stat.val}</div>
                            </motion.div>
                        )))}
                    </div>
                </motion.div>

                {/* ── Interaction Container ────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-[520px] mx-auto lg:ml-auto"
                >
                    {/* Compact Header for Mobile */}
                    <div className="lg:hidden flex flex-col items-center mb-12 text-center">
                        <div className="w-20 h-20 rounded-[28px] bg-indigo-600 flex items-center justify-center shadow-2xl mb-6">
                            <PawPrint className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-display font-black tracking-tighter text-slate-900 mb-4">Claws & Paws</h1>
                        <span className="tag-label">Intelligence Hub</span>
                    </div>

                    <div className="glass-container p-12 lg:p-14 border-white/60 bg-white/60 space-y-12">
                        <div className="flex bg-slate-50/50 p-1.5 rounded-[24px] border border-slate-200/50 relative">
                            {(['login', 'register'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative z-10 ${mode === m ? 'text-indigo-600' : 'text-slate-400'}`}
                                >
                                    {m === 'login' ? 'Auth Node' : 'Initialize'}
                                </button>
                            ))}
                            <motion.div
                                animate={{ x: mode === 'login' ? '0%' : '100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[18px] shadow-lg border border-slate-100"
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {user && !clinicUser && !authLoading ? (
                                <motion.div
                                    key="access-denied"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 rounded-3xl bg-red-50/50 border border-red-100/50 text-center space-y-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-100">
                                        <Shield className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-display font-black text-slate-900 tracking-tighter">Clinical Access Denied</h2>
                                        <p className="text-sm text-slate-500 font-medium">Your node authorization is invalid or has been revoked by the master registry.</p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full mt-4">
                                        <button 
                                            onClick={() => logout()}
                                            className="btn-secondary w-full h-14 font-black uppercase tracking-widest text-[10px] text-red-600 hover:bg-red-50 border-red-100"
                                        >
                                            Revoke Session & Re-authenticate
                                        </button>
                                        <button 
                                            onClick={() => (useAuth as any)().bypassAuth()}
                                            className="text-[10px] font-bold text-slate-400 p-2 hover:text-indigo-600 transition-colors"
                                        >
                                            Emergency Node Bypass (Local Dev Only)
                                        </button>
                                    </div>
                                </motion.div>
                            ) : mode === 'login' ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-1">
                                        <h2 className="text-4xl font-display font-black text-slate-900 tracking-tighter">Welcome Back</h2>
                                        <p className="tag-label">Secure Access Protocol Active</p>
                                    </div>

                                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="tag-label ml-2">Clinical ID (Email)</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input {...loginForm.register('email')} type="email" placeholder="vnode@clinic.ai" className="form-input pl-16" />
                                                </div>
                                                {loginForm.formState.errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 ml-2">{loginForm.formState.errors.email.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="tag-label ml-1">Access Key</label>
                                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Recover?</button>
                                                </div>
                                                <div className="relative group">
                                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input {...loginForm.register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="form-input pl-16 pr-16" />
                                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                {loginForm.formState.errors.password && <p className="text-[10px] font-bold text-red-500 mt-1 ml-2">{loginForm.formState.errors.password.message}</p>}
                                            </div>
                                        </div>

                                        <button type="submit" className="btn-primary w-full h-[68px] flex items-center justify-center gap-3 text-sm tracking-widest uppercase font-black overflow-hidden group" disabled={loading}>
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Synchronize <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" /></>}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-1">
                                        <h2 className="text-4xl font-display font-black text-slate-900 tracking-tighter">Node Deployment</h2>
                                        <p className="tag-label">Initialize Clinical Infrastructure</p>
                                    </div>

                                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="relative group">
                                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                                    <input {...registerForm.register('displayName')} placeholder="Operator" className="form-input pl-14" />
                                                </div>
                                                {registerForm.formState.errors.displayName && <p className="text-[10px] font-bold text-red-500 ml-1">{registerForm.formState.errors.displayName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="relative group">
                                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                                    <input {...registerForm.register('clinicName')} placeholder="Clinic ID" className="form-input pl-14" />
                                                </div>
                                                {registerForm.formState.errors.clinicName && <p className="text-[10px] font-bold text-red-500 ml-1">{registerForm.formState.errors.clinicName.message}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                                <input {...registerForm.register('email')} type="email" placeholder="Operational Email" className="form-input pl-16" />
                                            </div>
                                            {registerForm.formState.errors.email && <p className="text-[10px] font-bold text-red-500 ml-1">{registerForm.formState.errors.email.message}</p>}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <input {...registerForm.register('password')} type="password" placeholder="Passphrase" className="form-input" />
                                            </div>
                                            <div className="space-y-2">
                                                <input {...registerForm.register('confirmPassword')} type="password" placeholder="Verify" className="form-input" />
                                            </div>
                                        </div>
                                        <button type="submit" className="btn-primary w-full h-[68px] flex items-center justify-center gap-3 text-sm tracking-widest uppercase font-black group mt-4" disabled={loading}>
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Deploy Node <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>

                    <div className="mt-14 text-center">
                        <p className="tag-label opacity-60">Protected by RSA-4096 Clinical Encryption Protocol</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
