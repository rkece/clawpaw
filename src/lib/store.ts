'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';

export type UserRole = 'admin' | 'vet' | 'staff';

export interface ClinicUser {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    clinicId: string;
    clinicName: string;
    avatar?: string;
    onboardingComplete?: boolean;
}

export interface Pet {
    id?: string;
    name: string;
    species: 'dog' | 'cat' | 'hamster' | 'rabbit';
    breed: string;
    ageYears: number;
    weightKg: number;
    activityLevel: 'lazy' | 'active' | 'athlete';
    conditions: string[];
    region: string;
    ownerId?: string;
    ownerName?: string;
    status?: string;
    planId?: string;
    createdAt?: number;
}

// ── Auth Store ───────────────────────────
interface AuthState {
    user: User | null;
    clinicUser: ClinicUser | null;
    loading: boolean;
    setUser: (u: User | null) => void;
    setClinicUser: (cu: ClinicUser | null) => void;
    setLoading: (b: boolean) => void;
    setOnboardingComplete: (complete: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        user: null,
        clinicUser: null,
        loading: true,
        setUser: (user) => set({ user }),
        setClinicUser: (clinicUser) => set({ clinicUser }),
        setLoading: (loading) => set({ loading }),
        setOnboardingComplete: (complete) => {
            const current = get().clinicUser;
            if (current) {
                set({ clinicUser: { ...current, onboardingComplete: complete } });
            }
        },
        logout: () => set({ user: null, clinicUser: null }),
    }), { name: 'cp-auth', partialize: (s) => ({ clinicUser: s.clinicUser }) })
);

// ── UI Store ─────────────────────────────
interface UIState {
    sidebarOpen: boolean;
    darkMode: boolean;
    activeNotifications: number;
    toggleSidebar: () => void;
    setSidebarOpen: (v: boolean) => void;
    toggleDarkMode: () => void;
    setActiveNotifications: (n: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
    sidebarOpen: true,
    darkMode: false,
    activeNotifications: 3,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    setActiveNotifications: (activeNotifications) => set({ activeNotifications }),
}));

// ── Patient Store ────────────────────────
interface PatientState {
    pets: Pet[];
    selectedPet: Pet | null;
    setPets: (pets: Pet[]) => void;
    setSelectedPet: (pet: Pet | null) => void;
}

export const usePatientStore = create<PatientState>()((set) => ({
    pets: [],
    selectedPet: null,
    setPets: (pets) => set({ pets }),
    setSelectedPet: (selectedPet) => set({ selectedPet }),
}));
