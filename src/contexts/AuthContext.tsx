'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    type User,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { initializeAllCollections } from '@/lib/db-service';
import { useAuthStore, type ClinicUser, type UserRole } from '@/lib/store';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    clinicUser: ClinicUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    displayName: string;
    clinicName: string;
    role?: UserRole;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { user, clinicUser, loading, setUser, setClinicUser, setLoading, logout: storeLogout } = useAuthStore();

    useEffect(() => {
        let isMounted = true;
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!isMounted) return;
            setLoading(true);
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    // Load clinic user profile from DB
                    const profileRef = ref(db, `users/${firebaseUser.uid}`);
                    const snap = await get(profileRef);
                    
                    if (!isMounted) return;

                    if (snap.exists()) {
                        const cu = snap.val() as ClinicUser;
                        setClinicUser(cu);
                        // Initialize collections for existing users (idempotent)
                        initializeAllCollections(cu.clinicId, cu.clinicName).catch(console.error);
                    } else {
                        // Auto-create minimal profile
                        const cu: ClinicUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email ?? '',
                            displayName: firebaseUser.displayName ?? 'Clinic User',
                            role: 'vet',
                            clinicId: firebaseUser.uid,
                            clinicName: 'My Clinic',
                        };
                        await set(profileRef, cu);
                        if (isMounted) {
                            setClinicUser(cu);
                            // Initialize all Firebase collections
                            await initializeAllCollections(cu.clinicId, cu.clinicName);
                        }
                    }
                } else {
                    setUser(null);
                    setClinicUser(null);
                }
            } catch (err: any) {
                console.error('[AUTH_ERROR] System synchronization failed:', err);
                if (err.message?.includes('PERMISSION_DENIED')) {
                    toast.error('Clinical Node Access Denied. Contact Authority.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        });
        return () => {
            isMounted = false;
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const profileRef = ref(db, `users/${result.user.uid}`);
        const snap = await get(profileRef);
        if (snap.exists()) setClinicUser(snap.val() as ClinicUser);
    };

    const register = async (data: RegisterData) => {
        const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(result.user, { displayName: data.displayName });

        const clinicId = result.user.uid;
        const cu: ClinicUser = {
            uid: result.user.uid,
            email: data.email,
            displayName: data.displayName,
            role: data.role ?? 'admin',
            clinicId,
            clinicName: data.clinicName,
        };

        // Save user profile
        await set(ref(db, `users/${result.user.uid}`), cu);
        // Initialize all Firebase collections for this clinic
        await initializeAllCollections(clinicId, data.clinicName);

        setClinicUser(cu);
    };

    const logout = async () => {
        await signOut(auth);
        storeLogout();
        toast.success('Logged out successfully');
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    return (
        <AuthContext.Provider value={{ user, clinicUser, loading, login, register, logout, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
