'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Check, ArrowRight, Zap, Target, Shield,
    BarChart, Users, Utensils, PawPrint
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const STEPS = [
    {
        title: 'Welcome to the Future of Veterinary Care',
        desc: 'Claws & Paws is your enterprise node for AI-driven animal health. Let’s configure your clinical environment.',
        icon: Sparkles,
        color: '#7C3AED'
    },
    {
        title: 'AI Precision Nutrition',
        desc: 'Our neural engine calculates RER/MER metrics with clinical accuracy, taking into account breed genetics and health modifiers.',
        icon: Utensils,
        color: '#06B6D4'
    },
    {
        title: 'HIPAA-Compliant Registry',
        desc: 'Manage your entire patient database with multi-tenant isolation and secure clinical records.',
        icon: Shield,
        color: '#10B981'
    },
    {
        title: 'Intelligence Dashboards',
        desc: 'Monitor compliance and aggregate analytics to drive better health outcomes for every pet in your care.',
        icon: BarChart,
        color: '#F59E0B'
    }
];

export default function OnboardingOverlay() {
    const [step, setStep] = useState(0);
    const { clinicUser, setOnboardingComplete } = useAuthStore();

    if (clinicUser?.onboardingComplete) return null;

    const handleNext = () => {
        if (step === STEPS.length - 1) {
            setOnboardingComplete(true);
        } else {
            setStep(s => s + 1);
        }
    };

    const current = STEPS[step];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-base bg-opacity-80 backdrop-blur-xl"
                style={{ background: 'rgba(8,11,20,0.85)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-xl p-10 relative overflow-hidden text-center"
                    style={{ borderColor: 'var(--border-primary)' }}
                >
                    {/* Animated Background Mesh */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-glass">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary opacity-5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary opacity-5 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div
                            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-all duration-500"
                            style={{ background: `${current.color}15`, border: `2px solid ${current.color}30` }}
                        >
                            <current.icon className="w-10 h-10" style={{ color: current.color }} />
                        </div>

                        <h2 className="text-2xl font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                            {current.title}
                        </h2>
                        <p className="text-muted text-sm leading-relaxed max-w-sm mb-10">
                            {current.desc}
                        </p>

                        <button
                            onClick={handleNext}
                            className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 group"
                            style={{ background: current.color }}
                        >
                            {step === STEPS.length - 1 ? 'Go to Command Center' : 'Continue Integration'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex gap-2 mt-8">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-glass'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
