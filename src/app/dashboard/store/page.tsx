'use client';

import { ShoppingBag, Search, Filter, Plus, ShoppingCart, Grid, List as ListIcon, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const PRODUCTS = [
    { id: 'P1', name: 'Premium Puppy Kibble', brand: 'Royal Canin', price: '₹3,400', rating: 4.8, category: 'Food' },
    { id: 'P2', name: 'Orthopedic Dog Bed', brand: 'PawComfort', price: '₹4,200', rating: 4.9, category: 'Comfort' },
    { id: 'P3', name: 'Cat Scratching Post', brand: 'MeowLabs', price: '₹1,500', rating: 4.5, category: 'Toys' },
    { id: 'P4', name: 'Multivitamin Syrup', brand: 'PetHealth', price: '₹650', rating: 4.7, category: 'Supplements' },
    { id: 'P5', name: 'Reflective Leash', brand: 'SafeWalk', price: '₹890', rating: 4.6, category: 'Accessories' },
    { id: 'P6', name: 'Automatic Water Fountain', brand: 'HydraPet', price: '₹2,100', rating: 4.8, category: 'Tech' },
];

export default function MedicalStorePage() {
    const [view, setView] = useState('grid');

    return (
        <div className="content-wrapper">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        <ShoppingBag className="w-6 h-6 text-secondary-light" />
                        Medical & Supply Store
                    </h2>
                    <p className="text-sm text-muted">Procure professional-grade supplies and recommended dietary products</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-glass border border-subtle rounded-xl p-1">
                        <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-primary text-white' : 'text-muted'}`}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-primary text-white' : 'text-muted'}`}><ListIcon className="w-4 h-4" /></button>
                    </div>
                    <button className="btn-primary">
                        <Plus className="w-4 h-4" /> inventory
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input placeholder="Search products, brands or categories..." className="form-input pl-10" />
                </div>
                <button className="btn-secondary px-6">Filters</button>
            </div>

            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {PRODUCTS.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass-card group overflow-hidden ${view === 'list' ? 'flex items-center p-4 gap-6' : ''}`}
                    >
                        <div className={view === 'grid' ? 'aspect-video bg-elevated relative overflow-hidden' : 'w-24 h-24 bg-elevated rounded-xl flex-shrink-0'}>
                            <div className="absolute inset-0 flex items-center justify-center text-muted opacity-20">
                                <ShoppingBag className="w-12 h-12" />
                            </div>
                            {view === 'grid' && (
                                <div className="absolute top-2 right-2">
                                    <span className="badge badge-info bg-opacity-80 backdrop-blur-md">{p.category}</span>
                                </div>
                            )}
                        </div>

                        <div className={view === 'grid' ? 'p-5' : 'flex-1'}>
                            <div className="text-[10px] font-black text-primary-light uppercase tracking-widest mb-1">{p.brand}</div>
                            <h3 className="font-bold text-white mb-2 line-clamp-1">{p.name}</h3>

                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className={`w-3 h-3 ${j < Math.floor(p.rating) ? 'text-warning fill-warning' : 'text-muted'}`} />
                                ))}
                                <span className="text-[10px] text-muted font-bold ml-1">{p.rating}</span>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="text-xl font-black text-white">{p.price}</div>
                                <button className="p-2.5 rounded-xl bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 group-hover:bg-primary group-hover:text-white transition-all">
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
