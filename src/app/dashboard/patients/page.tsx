'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Dog, Cat, PawPrint, Rabbit,
    Edit3, Trash2, Eye, X, Loader2, ChevronDown, CheckCircle,
    User, Target, Activity, MapPin, Sparkles, Scale, Calendar, Hospital
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addPet, getPets, updatePet, deletePet, clearDemoPatients } from '@/lib/db-service';
import { usePatientStore, type Pet } from '@/lib/store';
import { fetchBreeds } from '@/lib/api-service';
import petData from '@/data/pet-data.json';
import toast from 'react-hot-toast';

const SPECIES_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    dog: Dog, cat: Cat, hamster: PawPrint, rabbit: Rabbit,
};

const SPECIES_COLORS: Record<string, string> = {
    dog: '#6366F1', cat: '#0EA5E9', hamster: '#F59E0B', rabbit: '#10B981',
};

// ── Patient Modal (Management Node) ──────────────────────
function PatientModal({
    open, onClose, onSave, editPet
}: {
    open: boolean;
    onClose: () => void;
    onSave: (pet: Pet) => Promise<void>;
    editPet?: Pet | null;
}) {
    const [form, setForm] = useState<Pet>({
        name: '',
        species: 'dog',
        breed: '',
        ageYears: 2,
        weightKg: 10,
        activityLevel: 'active',
        conditions: [],
        region: 'India',
        ownerName: '',
        status: 'active',
    });
    const [loading, setLoading] = useState(false);
    const [breeds, setBreeds] = useState<string[]>([]);
    const [loadingBreeds, setLoadingBreeds] = useState(false);

    useEffect(() => {
        if (editPet) setForm(editPet);
        else setForm({ name: '', species: 'dog', breed: '', ageYears: 2, weightKg: 10, activityLevel: 'active', conditions: [], region: 'India', ownerName: '', status: 'active' });
    }, [editPet, open]);

    useEffect(() => {
        const load = async () => {
            setLoadingBreeds(true);
            try {
                if (form.species === 'dog' || form.species === 'cat') {
                    const b = await fetchBreeds(form.species);
                    setBreeds(b);
                } else {
                    setBreeds((petData as any)[form.species + 's'].breeds.map((b: any) => b.name));
                }
            } finally { setLoadingBreeds(false); }
        };
        load();
    }, [form.species]);

    const handle = (k: keyof Pet, v: any) => setForm(f => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.name || !form.breed) { toast.error('Registry fail: Name/Breed required'); return; }
        setLoading(true);
        try {
            await onSave(form);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const CONDITIONS = ['Obesity', 'Diabetes', 'CKD', 'Hyperthyroid', 'Joint Care', 'Senior support'];
    const toggleCond = (c: string) => {
        const current = [...form.conditions];
        const idx = current.indexOf(c);
        if (idx > -1) current.splice(idx, 1);
        else current.push(c);
        handle('conditions', current);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl"
                    onClick={e => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="glass-card p-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] ring-1 ring-slate-200"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                    {editPet ? 'Update Node' : 'Patient Registration'}
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mt-1">Clinical Patient Intake Vector</p>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2.5">Descriptor (Name)</label>
                                    <div className="relative">
                                        <Dog className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                                        <input value={form.name} onChange={e => handle('name', e.target.value)} placeholder="e.g. Luna" className="form-input pl-12 h-14 font-black text-lg bg-slate-50 border-none ring-1 ring-slate-100" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2.5">Sovereign Node (Owner)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                                        <input value={form.ownerName ?? ''} onChange={e => handle('ownerName', e.target.value)} placeholder="Smith J." className="form-input pl-12 h-14 font-bold bg-slate-50 border-none ring-1 ring-slate-100" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Biological Phylogeny (Species)</label>
                                <div className="grid grid-cols-4 gap-4">
                                    {(['dog', 'cat', 'hamster', 'rabbit'] as const).map(sp => {
                                        const Ico = SPECIES_ICONS[sp];
                                        return (
                                            <button
                                                key={sp}
                                                type="button"
                                                onClick={() => handle('species', sp)}
                                                className={`flex flex-col items-center gap-2.5 p-5 rounded-[28px] transition-all duration-300 ${form.species === sp ? 'bg-indigo-600 text-white shadow-xl scale-105 shadow-indigo-100' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}
                                            >
                                                <Ico className="w-7 h-7" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{sp}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2.5">Breed Node</label>
                                    <div className="relative">
                                        <select value={form.breed} onChange={e => handle('breed', e.target.value)}
                                            className="form-input h-14 bg-slate-50 font-bold border-none ring-1 ring-slate-100 appearance-none">
                                            <option value="">Select breed vector...</option>
                                            {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                        {loadingBreeds ? <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" /> : <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2.5">Economic Region</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                                        <select value={form.region} onChange={e => handle('region', e.target.value)}
                                            className="form-input pl-12 h-14 bg-slate-50 font-bold border-none ring-1 ring-slate-100 appearance-none">
                                            {Object.keys(petData.global_prices ? petData.global_prices : { 'India': 1 }).map(r => <option key={r} value={r}>{r}</option>)}
                                            {/* fallback if global_prices structure differs */}
                                            <option value="India">India</option>
                                            <option value="USA">USA</option>
                                            <option value="Europe">Europe</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-3xl ring-1 ring-slate-100">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4"><Scale className="w-3.5 h-3.5" /> Bio-Mass (KG)</label>
                                    <div className="text-3xl font-black mb-4">{form.weightKg}</div>
                                    <input type="range" min="0.1" max="80" step="0.1" value={form.weightKg} onChange={e => handle('weightKg', +e.target.value)} className="w-full accent-indigo-600" />
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl ring-1 ring-slate-100">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4"><Calendar className="w-3.5 h-3.5" /> Duration (Years)</label>
                                    <div className="text-3xl font-black mb-4">{form.ageYears}</div>
                                    <input type="range" min="1" max="25" value={form.ageYears} onChange={e => handle('ageYears', +e.target.value)} className="w-full accent-indigo-600" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Adaptive Health Matrix</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {CONDITIONS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => toggleCond(c)}
                                            className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${form.conditions.includes(c) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-white'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12 pt-10 border-t border-slate-100">
                            <button onClick={onClose} className="btn-secondary flex-1 h-15 font-black uppercase tracking-widest text-xs">Terminate</button>
                            <button onClick={submit} className="btn-primary flex-1 h-15 justify-center font-black uppercase tracking-widest text-xs shadow-xl" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editPet ? 'Update Node' : 'Initialize Patient')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Patient Registry Page ─────────────────────────────────
export default function PatientsPage() {
    const [search, setSearch] = useState('');
    const [filterSpecies, setFilterSpecies] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editPet, setEditPet] = useState<Pet | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const { clinicUser } = useAuth();
    const { pets, setPets } = usePatientStore();

    const loadData = useCallback(async () => {
        if (!clinicUser?.clinicId) return;
        setLoadingData(true);
        try {
            const data = await getPets(clinicUser.clinicId);
            setPets(data);
        } catch (err) {
            toast.error('Sync error: Registry unavailable');
        } finally {
            setLoadingData(false);
        }
    }, [clinicUser?.clinicId, setPets]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSave = async (data: Pet) => {
        if (!clinicUser?.clinicId) return;
        try {
            if (editPet?.id) {
                await updatePet(clinicUser.clinicId, editPet.id, data);
                toast.success('Patient Node Sync Complete');
            } else {
                await addPet(clinicUser.clinicId, data);
                toast.success('New Patient Initialized');
            }
            loadData();
        } catch (err) {
            toast.error('Matrix error: Save failed');
        }
    };

    const handleDelete = async (pet: Pet) => {
        if (!clinicUser?.clinicId || !pet.id) return;
        if (!confirm(`Permanently terminate ${pet.name} records?`)) return;
        try {
            await deletePet(clinicUser.clinicId, pet.id);
            toast.success('Entry Terminated');
            loadData();
        } catch (err) { toast.error('Termination failed'); }
    };

    const handleClearDemo = async () => {
        if (!clinicUser?.clinicId) return;
        if (!confirm('Remove all sample patients? (Real patients will be kept)')) return;
        try {
            await clearDemoPatients(clinicUser.clinicId);
            toast.success('Sample Data Cleared');
            loadData();
        } catch (err) {
            toast.error('Clear failed');
        }
    };

    const filtered = useMemo(() => {
        return pets.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
                p.breed.toLowerCase().includes(search.toLowerCase());
            const matchSpecies = filterSpecies === 'all' || p.species === filterSpecies;
            return matchSearch && matchSpecies;
        });
    }, [pets, search, filterSpecies]);

    return (
        <div className="content-wrapper">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="badge badge-primary bg-indigo-50 text-indigo-600 border-indigo-100 font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1 mb-4">
                        Secure Patient Datastore Active
                    </div>
                    <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Patient <span className="gradient-text italic">Registry</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Found {pets.length} active biological entries in current node.</p>
                </motion.div>
                <div className="flex gap-4">
                    <button onClick={handleClearDemo} className="btn-secondary h-14 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-red-500 hover:bg-red-50 border-none">
                        Clear Demo Data
                    </button>
                    <button onClick={() => { setEditPet(null); setModalOpen(true); }} className="btn-primary h-14 px-8 shadow-primary font-black uppercase tracking-widest text-xs">
                        <Plus className="w-5 h-5" /> Initialize New
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-10">
                <div className="relative flex-1 min-w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Neural search patients, owners, breeds..."
                        className="form-input pl-12 h-14 bg-white/80 border-none ring-1 ring-slate-100 font-bold focus:ring-indigo-500 shadow-sm"
                    />
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {['all', 'dog', 'cat', 'hamster', 'rabbit'].map(sp => (
                        <button
                            key={sp}
                            onClick={() => setFilterSpecies(sp)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterSpecies === sp ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {sp}
                        </button>
                    ))}
                </div>
            </div>

            {loadingData ? (
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 glass-card bg-slate-100/50 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-24 text-center border-dashed border-2 border-slate-100 bg-slate-50/50">
                    <Hospital className="w-16 h-16 mx-auto mb-6 text-slate-200" />
                    <h3 className="text-2xl font-black text-slate-400 mb-2">Zero Matching Node Records</h3>
                    <p className="text-slate-400 font-medium mb-8">Refine search parameters or synchronize clinical data.</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden bg-white/50 border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Biological Node</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mass / Age</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kinetic State</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sync Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((pet) => {
                                        const Ico = SPECIES_ICONS[pet.species] ?? PawPrint;
                                        const color = SPECIES_COLORS[pet.species];
                                        return (
                                            <motion.tr
                                                key={pet.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                className="group hover:bg-white transition-all cursor-pointer"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                                                            style={{ background: `${color}10`, border: `1.5px solid ${color}20` }}>
                                                            <Ico className="w-6 h-6" style={{ color }} />
                                                        </div>
                                                        <div>
                                                            <div className="text-base font-black tracking-tight text-slate-900">{pet.name}</div>
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pet.ownerName ?? 'External Source'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-[13px] font-black text-slate-700 capitalize">{pet.species}</div>
                                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{pet.breed}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Weight</span>
                                                            <span className="text-sm font-black text-slate-900">{pet.weightKg} kg</span>
                                                        </div>
                                                        <div className="w-px h-6 bg-slate-100" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Age</span>
                                                            <span className="text-sm font-black text-slate-900">{pet.ageYears} y</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${pet.activityLevel === 'athlete' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        {pet.activityLevel}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Sync</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditPet(pet); setModalOpen(true); }} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                                            <Edit3 className="w-4.5 h-4.5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(pet)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <PatientModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditPet(null); }}
                onSave={handleSave}
                editPet={editPet}
            />
        </div>
    );
}
