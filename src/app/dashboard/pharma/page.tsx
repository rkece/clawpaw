'use client';

import { useState } from 'react';
import { Pill, Search, Filter, Plus, ShoppingCart, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const MEDICATIONS = [
    { id: '1', name: 'Amoxicillin', category: 'Antibiotic', stock: 124, price: '₹450', status: 'In Stock', safety: 'Tier 1' },
    { id: '2', name: 'Carpufen', category: 'NSAID', stock: 42, price: '₹890', status: 'Low Stock', safety: 'Tier 2' },
    { id: '3', name: 'Meloxicam', category: 'Analgesic', stock: 89, price: '₹320', status: 'In Stock', safety: 'Tier 1' },
    { id: '4', name: 'Apoquel', category: 'Dermatology', stock: 15, price: '₹2400', status: 'Critical', safety: 'Tier 3' },
    { id: '5', name: 'Frontline Plus', category: 'Parasiticide', stock: 210, price: '₹1200', status: 'In Stock', safety: 'Tier 1' },
];

export default function PharmaStorePage() {
    const [search, setSearch] = useState('');

    return (
        <div className="content-wrapper">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        <Pill className="w-6 h-6 text-primary-light" />
                        Clinical Pharma Store
                    </h2>
                    <p className="text-sm text-muted">Controlled inventory for veterinary pharmaceuticals</p>
                </div>
                <button className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Inventory
                </button>
            </div>

            <div className="glass-card mb-8">
                <div className="p-4 border-b border-subtle flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search medication name or category..."
                            className="form-input pl-10"
                        />
                    </div>
                    <button className="btn-secondary px-4">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Medication</th>
                            <th>Category</th>
                            <th>Safety Level</th>
                            <th>Stock Level</th>
                            <th>Unit Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MEDICATIONS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())).map((m, i) => (
                            <motion.tr
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <td>
                                    <div className="font-bold text-sm text-white">{m.name}</div>
                                    <div className="text-[10px] text-muted font-bold uppercase tracking-widest">ID: {m.id}X99</div>
                                </td>
                                <td><span className="badge badge-info">{m.category}</span></td>
                                <td>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <ShieldCheck className={`w-3 h-3 ${m.safety === 'Tier 1' ? 'text-success' : m.safety === 'Tier 2' ? 'text-warning' : 'text-error'}`} />
                                        {m.safety}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-glass rounded-full overflow-hidden">
                                            <div className={`h-full ${m.stock < 20 ? 'bg-error' : m.stock < 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(100, (m.stock / 200) * 100)}%` }} />
                                        </div>
                                        <span className="text-xs font-bold">{m.stock}</span>
                                    </div>
                                </td>
                                <td className="font-bold text-white">{m.price}</td>
                                <td>
                                    <button className="btn-ghost p-2 rounded-lg hover:text-primary"><ShoppingCart className="w-4 h-4" /></button>
                                    <button className="btn-ghost p-2 rounded-lg"><Info className="w-4 h-4" /></button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 rounded-2xl bg-error bg-opacity-5 border border-error border-opacity-20 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-error flex-shrink-0" />
                <div>
                    <div className="text-sm font-bold text-error mb-1">Narcotics Control Active</div>
                    <p className="text-xs text-muted leading-relaxed">Tier 3 medications require multi-factor authorization and vet-in-charge override for dispensing.</p>
                </div>
            </div>
        </div>
    );
}
