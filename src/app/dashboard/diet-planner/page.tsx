'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dog, Cat, Rabbit, ChevronRight, ChevronLeft,
    Trash2, Save, Download, Sparkles, Activity, AlertCircle,
    Target, Scale, Calendar, Wallet, Layers, HeartPulse,
    Search, Plus, CheckCircle, PieChart as PieChartIcon,
    History, Info, FileText, PawPrint, CalendarDays, CalendarRange
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { fetchBreeds } from '@/lib/api-service';
import petData from '@/data/pet-data.json';
import { generateNutritionAnalysis, NutritionAnalysis, REGIONAL_DATA } from '@/lib/nutrition-engine';
import { Pet } from '@/lib/store';
import toast from 'react-hot-toast';
import { addPet, saveDietPlan, getPets, updatePet } from '@/lib/db-service';
import jsPDF from 'jspdf';

// ── Step Component Wrappers ────────────────────────────
function StepTitle({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">{title}</h2>
            <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">{subtitle}</p>
        </div>
    );
}

// Icon Assignment: PawPrint → Canine, Dog → Rodent, Cat → Feline, Rabbit → Lagomorph
const SPECIES_CONFIG = [
    { id: 'dog', label: 'Canine', icon: PawPrint, color: '#6366F1' },
    { id: 'cat', label: 'Feline', icon: Cat, color: '#0EA5E9' },
    { id: 'rabbit', label: 'Lagomorph', icon: Rabbit, color: '#10B981' },
    { id: 'hamster', label: 'Rodent', icon: Dog, color: '#F59E0B' },
] as const;

// ── Fallback Registries ──────────────────────────────
const FALLBACK_BREEDS: Record<string, string[]> = {
    dog: ['Golden Retriever', 'German Shepherd', 'Labrador', 'Poodle', 'Beagle', 'Bulldog', 'Rottweiler', 'Dachshund', 'Boxer', 'Husky'],
    cat: ['Persian Cat', 'Maine Coon', 'Siamese Cat', 'Ragdoll', 'Bengal Cat', 'Abyssinian', 'Sphynx', 'British Shorthair'],
    rabbit: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Flemish Giant', 'Lionhead', 'English Angora'],
    hamster: ['Syrian Hamster', 'Dwarf Roborovski', 'Dwarf Winter White', 'Chinese Hamster', 'Dwarf Campbell'],
};

export default function DietPlannerPage() {
    const { clinicUser } = useAuth();
    const [step, setStep] = useState(0);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [breeds, setBreeds] = useState<string[]>([]);
    const [registryPets, setRegistryPets] = useState<Pet[]>([]);
    const [searchingRegistry, setSearchingRegistry] = useState(false);
    const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
    const [budgetView, setBudgetView] = useState<'weekly' | 'monthly'>('monthly');
    const pdfRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState<Pet>({
        name: '',
        species: 'dog',
        breed: '',
        ageYears: 2,
        weightKg: 10,
        activityLevel: 'active',
        conditions: [],
        region: 'India',
    });

    const updateForm = (key: keyof Pet, val: any) => {
        setForm(prev => ({ ...prev, [key]: val }));
    };

    // ── Fetch Breeds Logic ──────────────────────────────
    useEffect(() => {
        const loadBreeds = async () => {
            setLoadingBreeds(true);
            try {
                if (form.species === 'dog' || form.species === 'cat') {
                    const b = await fetchBreeds(form.species);
                    setBreeds(b.length > 0 ? b : FALLBACK_BREEDS[form.species]);
                } else {
                    setBreeds(FALLBACK_BREEDS[form.species] || []);
                }
            } catch (e) {
                setBreeds(FALLBACK_BREEDS[form.species] || []);
            } finally {
                setLoadingBreeds(false);
            }
        };
        loadBreeds();
    }, [form.species]);

    useEffect(() => {
        if (clinicUser?.clinicId) {
            getPets(clinicUser.clinicId).then(setRegistryPets).catch(console.error);
        }
    }, [clinicUser]);

    const handleSelectFromRegistry = (pet: Pet) => {
        setForm({
            ...pet,
            conditions: pet.conditions || [] // Ensure array exists
        });
        setStep(1); // Advance to metrics phase as we already have identity
        toast.success(`Node linked: ${pet.name}`);
    };

    // ── Health Conditions Matrix ──────────────────────
    const availableConditions = useMemo(() => {
        if (form.species === 'dog' || form.species === 'cat') {
            return ['Obesity', 'Diabetes', 'CKD', 'Hyperthyroid', 'Senior Support'];
        }
        if (form.species === 'hamster') return petData.hamsters.diseases;
        if (form.species === 'rabbit') return petData.rabbits.diseases;
        return [];
    }, [form.species]);

    const toggleCondition = (c: string) => {
        const current = [...(form.conditions || [])];
        const idx = current.indexOf(c);
        if (idx > -1) current.splice(idx, 1);
        else current.push(c);
        updateForm('conditions', current);
    };

    // ── Analysis Logic ──────────────────────────────────
    const runAnalysis = async () => {
        if (!form.name || !form.breed) {
            toast.error("Identity check failed. Provide Name/Breed.");
            return;
        }
        setAnalyzing(true);

        // Auto-Sync Patient Data upon forging protocol
        if (clinicUser?.clinicId) {
            try {
                let syncedPet: Pet;
                if (form.id) {
                    await updatePet(clinicUser.clinicId, form.id, form);
                    syncedPet = form;
                    console.log('[DATABASE] Auto-updated existing patient node');
                } else {
                    const registry = await getPets(clinicUser.clinicId);
                    const duplicate = registry.find(p =>
                        p.name.toLowerCase() === form.name.toLowerCase() &&
                        p.species === form.species
                    );

                    if (duplicate && duplicate.id) {
                        await updatePet(clinicUser.clinicId, duplicate.id, form);
                        syncedPet = { ...form, id: duplicate.id };
                        console.log('[DATABASE] Auto-updated duplicate patient node');
                    } else {
                        syncedPet = await addPet(clinicUser.clinicId, form);
                        console.log('[DATABASE] Auto-registered new patient node');
                    }
                }

                if (syncedPet.id) {
                    setForm(prev => ({ ...prev, id: syncedPet.id }));
                    // Refresh local shadow registry
                    getPets(clinicUser.clinicId).then(setRegistryPets).catch(() => { });
                }
            } catch (err) {
                console.error('[DATABASE] Analysis auto-sync failed:', err);
            }
        }

        setTimeout(() => {
            const results = generateNutritionAnalysis(form);
            setAnalysis(results);
            setAnalyzing(false);
            setStep(4);
            toast.success("Protocol Refined Successfully");
        }, 1500);
    };

    // ── Save to Firebase ────────────────────────────────
    const handleSaveToFirebase = async () => {
        if (!clinicUser?.clinicId || !analysis) return;
        setSaving(true);
        try {
            let petToLink: Pet;

            if (form.id) {
                // Update existing
                await updatePet(clinicUser.clinicId, form.id, form);
                petToLink = form;
                console.log('[DATABASE] Updated existing pet node:', form.id);
            } else {
                // Check if a pet with this name/species exists already to avoid duplicates
                const existingPets = await getPets(clinicUser.clinicId);
                const duplicate = existingPets.find(p =>
                    p.name.toLowerCase() === form.name.toLowerCase() &&
                    p.species === form.species
                );

                if (duplicate && duplicate.id) {
                    await updatePet(clinicUser.clinicId, duplicate.id, form);
                    petToLink = { ...form, id: duplicate.id };
                    console.log('[DATABASE] Found and updated duplicate pet node:', duplicate.id);
                } else {
                    // Create new
                    petToLink = await addPet(clinicUser.clinicId, form);
                    console.log('[DATABASE] Initialized new pet node:', petToLink.id);
                }
            }

            // Save the diet plan linked to the patient
            await saveDietPlan(clinicUser.clinicId, {
                petId: petToLink.id!,
                petName: form.name,
                species: form.species,
                breed: form.breed,
                weightKg: form.weightKg,
                ageYears: form.ageYears,
                activityLevel: form.activityLevel,
                conditions: form.conditions || [],
                region: form.region,
                analysis,
                budgetPeriod: budgetView,
                status: 'active',
                version: 1,
            });

            console.log('Commit Registry Successful');
            toast.success('Protocol saved to registry successfully!');
            // Update the form with the ID so subsequent saves update the same entry
            if (petToLink.id) setForm(prev => ({ ...prev, id: petToLink.id }));
        } catch (err) {
            console.error('Save error details:', err);
            toast.error('Failed to save protocol: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadBudget = () => {
        if (!analysis) return;
        const csvContent = [
            ['Metric', 'Weekly', 'Monthly', 'Daily'],
            ['Total Cost', analysis.budget.weekly, analysis.budget.monthly, analysis.budget.daily],
            ['Currency', analysis.budget.currency, analysis.budget.currency, analysis.budget.currency],
            ...analysis.budget.ingredients.map(ing => [ing.name, ing.costWeekly, ing.costMonthly, '-'])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `budget_${form.name.toLowerCase()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Budget CSV exported');
    };

    // ── PDF Download (Pure jsPDF — no html2canvas needed) ──
    const handleDownloadPDF = () => {
        if (!analysis) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const w = pdf.internal.pageSize.getWidth();
        let y = 20;

        // Header
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Claws & Paws - Diet Protocol', 14, y);
        y += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
        y += 12;

        // Divider
        pdf.setDrawColor(99, 102, 241);
        pdf.setLineWidth(0.8);
        pdf.line(14, y, w - 14, y);
        y += 10;

        // Patient Info
        pdf.setTextColor(30);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Patient Information', 14, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const infoData = [
            [`Name: ${form.name}`, `Species: ${form.species.charAt(0).toUpperCase() + form.species.slice(1)}`],
            [`Breed: ${form.breed}`, `Weight: ${form.weightKg} kg`],
            [`Age: ${form.ageYears} years`, `Activity: ${form.activityLevel}`],
            [`Region: ${form.region}`, `Conditions: ${form.conditions.length > 0 ? form.conditions.join(', ') : 'None'}`],
        ];

        infoData.forEach(row => {
            pdf.text(row[0], 14, y);
            pdf.text(row[1], w / 2, y);
            y += 6;
        });
        y += 6;

        // Energy Analysis
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Energy & Macronutrient Analysis', 14, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Resting Energy Requirement (RER): ${analysis.rer} kcal/day`, 14, y); y += 6;
        pdf.text(`Maintenance Energy Requirement (MER): ${analysis.mer} kcal/day`, 14, y); y += 6;
        pdf.text(`Synthesis Score: ${analysis.synthesisScore}%`, 14, y); y += 8;

        // Macros Table
        pdf.setFont('helvetica', 'bold');
        pdf.text('Macro', 14, y);
        pdf.text('Kcal', 60, y);
        pdf.text('Percentage', 100, y);
        y += 2;
        pdf.setDrawColor(200);
        pdf.line(14, y, 140, y);
        y += 5;

        pdf.setFont('helvetica', 'normal');
        const macroKeys: Array<keyof typeof analysis.macros> = ['protein', 'fat', 'carbs', 'fiber', 'minerals'];
        macroKeys.forEach(key => {
            pdf.text(key.charAt(0).toUpperCase() + key.slice(1), 14, y);
            pdf.text(`${analysis.macros[key]} kcal`, 60, y);
            pdf.text(`${analysis.macroPercents[key]}%`, 100, y);
            y += 6;
        });
        y += 6;

        // Budget
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Budget Projection', 14, y);
        y += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Daily: ${analysis.budget.currency}${analysis.budget.daily}`, 14, y); y += 6;
        pdf.text(`Weekly: ${analysis.budget.currency}${analysis.budget.weekly}`, 14, y); y += 6;
        pdf.text(`Monthly: ${analysis.budget.currency}${analysis.budget.monthly}`, 14, y); y += 8;

        // Ingredient Breakdown
        pdf.setFont('helvetica', 'bold');
        pdf.text('Ingredient', 14, y);
        pdf.text('Weekly', 80, y);
        pdf.text('Monthly', 120, y);
        y += 2;
        pdf.line(14, y, 160, y);
        y += 5;

        pdf.setFont('helvetica', 'normal');
        analysis.budget.ingredients.forEach(ing => {
            pdf.text(ing.name, 14, y);
            pdf.text(`${analysis.budget.currency}${ing.costWeekly}`, 80, y);
            pdf.text(`${analysis.budget.currency}${ing.costMonthly}`, 120, y);
            y += 6;
        });
        y += 6;

        // Weekly Meal Plan (new page)
        pdf.addPage();
        y = 20;

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Weekly Meal Protocol', 14, y);
        y += 10;

        analysis.mealPlan.forEach(meal => {
            if (y > 260) {
                pdf.addPage();
                y = 20;
            }

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(99, 102, 241);
            pdf.text(`${meal.day}  —  ${meal.calories} kcal`, 14, y);
            y += 6;

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(80);
            pdf.text(`Breakfast: ${meal.meals.breakfast}`, 20, y); y += 5;
            pdf.text(`Lunch: ${meal.meals.lunch}`, 20, y); y += 5;
            pdf.text(`Dinner: ${meal.meals.dinner}`, 20, y); y += 8;
            pdf.setTextColor(30);
        });

        // Footer
        y += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text('This report was generated by Claws & Paws AI Veterinary Nutrition System.', 14, y);
        pdf.text('Consult your veterinarian before making dietary changes.', 14, y + 4);

        pdf.save(`${form.name}_Diet_Protocol.pdf`);
        toast.success('PDF downloaded successfully!');
    };

    const next = () => setStep(s => s + 1);
    const prev = () => setStep(s => s - 1);

    const radarData = useMemo(() => {
        if (!analysis) return [];
        return [
            { subject: 'Protein', A: analysis.macros.protein, fullMark: analysis.mer },
            { subject: 'Fat', A: analysis.macros.fat, fullMark: analysis.mer },
            { subject: 'Carbs', A: analysis.macros.carbs, fullMark: analysis.mer },
            { subject: 'Fiber', A: analysis.macros.fiber, fullMark: analysis.mer },
            { subject: 'Minerals', A: analysis.macros.minerals, fullMark: analysis.mer },
        ];
    }, [analysis]);

    const pieData = useMemo(() => {
        if (!analysis) return [];
        return [
            { name: 'Protein', value: analysis.macroPercents.protein },
            { name: 'Fat', value: analysis.macroPercents.fat },
            { name: 'Carbs', value: analysis.macroPercents.carbs },
            { name: 'Fiber', value: analysis.macroPercents.fiber },
            { name: 'Minerals', value: analysis.macroPercents.minerals },
        ];
    }, [analysis]);

    const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-[1600px] mx-auto overflow-hidden">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-5xl font-display font-black tracking-tighter text-slate-900 leading-none">
                        Diet <span className="gradient-text italic">Forge</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-4">Autonomous nutritional protocol generation for {form.name || 'patients'}.</p>
                </div>

                {step < 4 && (
                    <div className="flex gap-3">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-12 h-1.5 rounded-full transition-all duration-700 ${step >= i ? 'bg-indigo-600 shadow-[0_0_15px_var(--primary-glow)]' : 'bg-slate-100'}`} />
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {analyzing ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-40"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
                        </div>
                        <h2 className="mt-8 text-2xl font-black uppercase tracking-[0.4em] text-indigo-600 animate-pulse">Neural Synthesis</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest">Architecting Clinical Matrix...</p>
                    </motion.div>
                ) : step === 0 ? (
                    <motion.div key="step0" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="glass-container p-12">
                        <StepTitle title="Identity Registry" subtitle="Node Classification · Phase 1" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-10">
                                <div className="p-6 rounded-[32px] bg-indigo-50/50 border border-indigo-100/50">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4 block">Registry Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                        <select
                                            onChange={(e) => {
                                                const p = registryPets.find(rp => rp.id === e.target.value);
                                                if (p) handleSelectFromRegistry(p);
                                            }}
                                            className="form-input !h-[54px] pl-12 !bg-white border-none text-sm font-bold"
                                        >
                                            <option value="">Link existing clinical node...</option>
                                            {registryPets.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-[9px] font-bold text-indigo-400/60 mt-3 px-1 italic">Selecting a registry entry will inherit all biological constants.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="tag-label">Patient Alias <span className="text-red-500">*</span></label>
                                    <input value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Luna" className="form-input !h-[70px] text-2xl !bg-slate-50 ring-1 ring-slate-200/50" />
                                </div>

                                <div className="space-y-4">
                                    <label className="tag-label">Economic Region</label>
                                    <select value={form.region} onChange={e => updateForm('region', e.target.value)} className="form-input !h-[70px] font-bold !bg-slate-50 ring-1 ring-slate-200/50">
                                        {Object.keys(REGIONAL_DATA).map(r => <option key={r} value={r}>{r} ({REGIONAL_DATA[r].symbol})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="tag-label mb-6 block">Phylogenetic Node</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {SPECIES_CONFIG.map(sp => (
                                        <button
                                            key={sp.id}
                                            onClick={() => updateForm('species', sp.id)}
                                            className={`p-8 rounded-[40px] flex flex-col items-center gap-4 transition-all duration-500 relative overflow-hidden group ${form.species === sp.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105' : 'bg-slate-50 hover:bg-white border border-slate-100'}`}
                                        >
                                            <sp.icon className={`w-10 h-10 transition-transform duration-500 group-hover:scale-110 ${form.species === sp.id ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="text-xs font-black uppercase tracking-widest">{sp.label}</span>
                                            {form.species === sp.id && <motion.div layoutId="sp-glow" className="absolute inset-0 bg-white/10 blur-2xl" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <label className="tag-label">Breed Specification</label>
                            <div className="relative">
                                <select
                                    className="form-input !h-[70px] font-bold text-xl !bg-slate-50 ring-1 ring-slate-200/50"
                                    value={form.breed}
                                    onChange={e => updateForm('breed', e.target.value)}
                                    disabled={loadingBreeds}
                                >
                                    <option value="">{loadingBreeds ? 'Syncing Node Registry...' : 'Select Breed Node...'}</option>
                                    {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-12">
                            <button onClick={next} disabled={!form.name || !form.breed} className="btn-primary">
                                Advance Matrix <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ) : step === 1 ? (
                    <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass-container p-12">
                        <StepTitle title="Biological Metrics" subtitle="Vital Projection · Phase 2" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="kpi-card !bg-slate-50/50 border-none">
                                <Scale className="w-12 h-12 text-indigo-500 mb-8" />
                                <label className="tag-label mb-3 block">Patient Mass (KG)</label>
                                <div className="text-6xl font-display font-black text-indigo-600 mb-10">{form.weightKg}</div>
                                <input
                                    type="range" min="0.5" max="100" step="0.5"
                                    value={form.weightKg} onChange={e => updateForm('weightKg', parseFloat(e.target.value))}
                                    className="w-full accent-indigo-600"
                                />
                            </div>

                            <div className="kpi-card !bg-slate-50/50 border-none">
                                <Calendar className="w-12 h-12 text-sky-500 mb-8" />
                                <label className="tag-label mb-3 block">Temporal Duration (Years)</label>
                                <div className="text-6xl font-display font-black text-sky-600 mb-10">{form.ageYears}</div>
                                <input
                                    type="range" min="1" max="25"
                                    value={form.ageYears} onChange={e => updateForm('ageYears', parseInt(e.target.value))}
                                    className="w-full accent-sky-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-12 pt-8 border-t border-slate-100/50">
                            <button onClick={prev} className="btn-secondary px-8 rounded-2xl h-14 font-black flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" /> Recede
                            </button>
                            <button onClick={next} className="btn-primary">
                                Next Pipeline <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ) : step === 2 ? (
                    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass-container p-12">
                        <StepTitle title="Kinetic Capacity" subtitle="Metabolic Load · Phase 3" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { id: 'lazy', label: 'Couch Potato', desc: 'Minimal metabolic exertion.', icon: Activity, mult: 1.2 },
                                { id: 'active', label: 'Clinical Balance', desc: 'Regular physiological load.', icon: Activity, mult: 1.4 },
                                { id: 'athlete', label: 'Maximum Yield', desc: 'High metabolic throughput.', icon: Activity, mult: 1.8 },
                            ].map(lv => (
                                <button
                                    key={lv.id}
                                    onClick={() => updateForm('activityLevel', lv.id as any)}
                                    className={`p-10 rounded-[40px] text-left transition-all duration-500 relative overflow-hidden group ${form.activityLevel === lv.id ? 'bg-indigo-600 text-white shadow-2xl scale-[1.03]' : 'bg-slate-50 hover:bg-white border border-slate-100'}`}
                                >
                                    <lv.icon className={`w-14 h-14 mb-8 ${form.activityLevel === lv.id ? 'text-white' : 'text-indigo-500'}`} />
                                    <div className="text-2xl font-black mb-3">{lv.label}</div>
                                    <p className={`text-sm font-medium leading-relaxed opacity-60`}>{lv.desc}</p>
                                    <div className={`absolute top-10 right-10 text-4xl font-black ${form.activityLevel === lv.id ? 'opacity-20' : 'opacity-5'}`}>x{lv.mult}</div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between mt-12 pt-8 border-t border-slate-100/50">
                            <button onClick={prev} className="btn-secondary px-8 rounded-2xl h-14 font-black flex items-center gap-2">Recede</button>
                            <button onClick={next} className="btn-primary">Confirm Logic</button>
                        </div>
                    </motion.div>
                ) : step === 3 ? (
                    <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass-container p-12">
                        <StepTitle title="Pathological Map" subtitle="Constraint Matrix · Phase 4" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {availableConditions.map(c => {
                                const isSelected = (form.conditions || []).includes(c);
                                return (
                                    <button
                                        key={c}
                                        onClick={() => toggleCondition(c)}
                                        className={`p-8 rounded-[32px] text-sm font-black transition-all duration-500 flex flex-col items-center gap-4 border ${isSelected ? 'bg-red-500 text-white shadow-xl shadow-red-200 border-none' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                                    >
                                        {isSelected ? <AlertCircle className="w-6 h-6 animate-pulse" /> : <HeartPulse className="w-6 h-6 text-slate-200" />}
                                        <span className="uppercase tracking-widest text-[10px]">{c}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between mt-12 pt-8 border-t border-slate-100/50">
                            <button onClick={prev} className="btn-secondary px-8 rounded-2xl h-14 font-black">Recede</button>
                            <button onClick={runAnalysis} className="btn-primary !bg-slate-900 border-none">
                                Forge Protocol <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    // ── Analysis Dashboard ──
                    <motion.div key="analysis" ref={pdfRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                        <div className="flex flex-col xl:flex-row gap-10 items-stretch">
                            {/* Primary Analysis Cell */}
                            <div className="flex-1 glass-container p-12 bg-white/90">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="tag-label text-emerald-600">Clinical Sync Stable</span>
                                        </div>
                                        <h2 className="text-7xl font-display font-black tracking-tighter text-slate-900 leading-[0.85]">{form.name}</h2>
                                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[11px] mt-4">{form.breed}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={handleDownloadPDF} className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-xl transition-all" title="Download PDF">
                                            <Download className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleSaveToFirebase}
                                            disabled={saving}
                                            className="btn-primary h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                        >
                                            {saving ? (
                                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                                            ) : (
                                                <><Save className="w-4 h-4" /> Commit Registry</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                                    {[
                                        { label: 'Energy Target', value: `${analysis?.mer} kcal`, icon: Target, color: '#6366F1' },
                                        { label: 'Metabolic Base', value: `${analysis?.rer} kcal`, icon: Activity, color: '#0EA5E9' },
                                        { label: 'Synthesis Score', value: `${analysis?.synthesisScore}%`, icon: Sparkles, color: '#10B981' },
                                        { label: 'Phase Stage', value: form.ageYears > 8 ? 'Senior' : 'Adult', icon: HeartPulse, color: '#F59E0B' },
                                    ].map(stat => (
                                        <div key={stat.label} className="p-8 rounded-[40px] bg-slate-50/50 border border-white hover:bg-white hover:shadow-2xl hover:scale-105 transition-all duration-500">
                                            <stat.icon className="w-8 h-8 mb-4" style={{ color: stat.color }} />
                                            <div className="tag-label opacity-40 mb-2">{stat.label}</div>
                                            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dynamic Macro Percentages Bar */}
                                <div className="mb-12 p-6 rounded-[32px] bg-slate-50/50 border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">Macro Distribution</h4>
                                        <span className="tag-label">{form.species.toUpperCase()} Profile{form.conditions.length > 0 ? ' + Conditions' : ''}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {pieData.map((d, i) => (
                                            <div key={d.name} className="flex items-center gap-4">
                                                <div className="w-20 text-[10px] font-black uppercase tracking-widest text-slate-500">{d.name}</div>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${d.value}%` }}
                                                        transition={{ delay: i * 0.1, duration: 1 }}
                                                        className="h-full rounded-full"
                                                        style={{ background: COLORS[i] }}
                                                    />
                                                </div>
                                                <div className="w-10 text-right text-sm font-black" style={{ color: COLORS[i] }}>{d.value}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Full Weekly Meal Plan Section */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-black text-slate-900">Weekly Meal Protocol</h3>
                                        <span className="tag-label">Full Cycle Analysis</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analysis?.mealPlan.map((m, i) => (
                                            <motion.div
                                                key={m.day}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-6 rounded-[32px] bg-slate-50/80 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">{m.day[0]}</div>
                                                        <span className="font-black text-slate-900">{m.day} Node</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-indigo-600">{m.calories} <span className="text-[10px] font-bold text-slate-400">KCAL</span></span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mt-4 ml-2">
                                                    <div className="flex gap-3 text-xs font-bold text-slate-600">
                                                        <span className="text-indigo-500 uppercase tracking-widest text-[9px] w-12">B-FAST</span>
                                                        <span className="flex-1 opacity-70 italic">{m.meals.breakfast}</span>
                                                    </div>
                                                    <div className="flex gap-3 text-xs font-bold text-slate-600">
                                                        <span className="text-indigo-500 uppercase tracking-widest text-[9px] w-12">LUNCH</span>
                                                        <span className="flex-1 opacity-70 italic">{m.meals.lunch}</span>
                                                    </div>
                                                    <div className="flex gap-3 text-xs font-bold text-slate-600">
                                                        <span className="text-indigo-500 uppercase tracking-widest text-[9px] w-12">DINNER</span>
                                                        <span className="flex-1 opacity-70 italic">{m.meals.dinner}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Interactive Metrics Cell */}
                            <div className="w-full xl:w-[480px] flex flex-col gap-8">
                                <div className="glass-container p-10 bg-indigo-600 border-none text-white relative overflow-hidden group">
                                    <div className="absolute top-[-40%] right-[-40%] w-full h-full bg-white/10 rounded-full blur-[120px]" />
                                    <h3 className="text-2xl font-black mb-10 flex items-center justify-between">Macronutrient Distribution <PieChartIcon className="w-6 h-6 opacity-40" /></h3>

                                    <div className="h-[300px] relative z-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={80}
                                                    outerRadius={110}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    animationDuration={2500}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '24px', border: 'none', background: 'rgba(255,255,255,0.95)', color: '#111' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-4xl font-black">{analysis?.synthesisScore}%</span>
                                            <span className="tag-label opacity-60">Synthesis</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                                        {pieData.map((d, i) => (
                                            <div key={d.name} className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{d.name} ({d.value}%)</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-container p-12 bg-white flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-black text-slate-900">Economic Projection</h3>
                                            <div className="flex gap-2">
                                                <button onClick={handleDownloadBudget} className="p-2 hover:bg-slate-100 rounded-xl transition-all" title="Download Budget CSV">
                                                    <Download className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                                                </button>
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                                    <Wallet className="w-6 h-6 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Budget Period Toggle */}
                                        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                                            <button
                                                onClick={() => setBudgetView('weekly')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${budgetView === 'weekly' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <CalendarDays className="w-4 h-4" /> Weekly
                                            </button>
                                            <button
                                                onClick={() => setBudgetView('monthly')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${budgetView === 'monthly' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <CalendarRange className="w-4 h-4" /> Monthly
                                            </button>
                                        </div>

                                        <div className="space-y-10">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <div className="tag-label mb-3">{budgetView === 'monthly' ? 'Monthly Cost' : 'Weekly Cost'}</div>
                                                    <div className="text-5xl font-display font-black text-slate-900 tracking-tighter">
                                                        {analysis?.budget.currency}{budgetView === 'monthly' ? analysis?.budget.monthly : analysis?.budget.weekly}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="tag-label mb-3">Daily Estimate</div>
                                                    <div className="text-2xl font-black text-indigo-600">{analysis?.budget.currency}{analysis?.budget.daily}</div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center tag-label opacity-60">
                                                    <span>Node Resource Load</span>
                                                    <span>82% of regional avg</span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-indigo-500" style={{ width: '45%' }} />
                                                    <div className="h-full bg-emerald-400" style={{ width: '35%' }} />
                                                    <div className="h-full bg-sky-400" style={{ width: '20%' }} />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {analysis?.budget.ingredients.map((ing, i) => (
                                                    <div key={ing.name} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                                            <span className="font-bold text-slate-600 text-[11px] uppercase tracking-widest">{ing.name}</span>
                                                        </div>
                                                        <span className="font-black text-slate-900">
                                                            {analysis?.budget.currency}{budgetView === 'monthly' ? ing.costMonthly : ing.costWeekly}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={() => setStep(0)} className="btn-secondary w-full mt-10 h-16 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-none">
                                        Re-Initialize Forge Matrix
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Final Analytics Layer */}
                        <div className="glass-container p-12 bg-white/50 border-white">
                            <h3 className="text-3xl font-display font-black text-slate-900 mb-10">Advanced Health Projection</h3>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analysis?.mealPlan.map(m => ({
                                        node: m.day.substring(0, 3),
                                        value: m.calories,
                                        target: analysis?.mer || 0,
                                    })) || []}>
                                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                        <XAxis dataKey="node" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="#6366F1" radius={[12, 12, 12, 12]} barSize={40} name="Daily Calories" />
                                        <Bar dataKey="target" fill="#E2E8F0" radius={[12, 12, 12, 12]} barSize={40} name="MER Target" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
