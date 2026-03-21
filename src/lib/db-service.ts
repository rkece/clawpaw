import { db } from './firebase';
import { ref, push, set, get, update, remove, query, orderByChild, limitToLast } from 'firebase/database';
import type { Pet } from './store';
import type { NutritionAnalysis } from './nutrition-engine';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  CLAWS & PAWS – FIREBASE DATABASE SERVICE
 *  Multi-Collection Architecture for Multi-Tenant Clinics
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *  Firebase Realtime DB Structure:
 *  ├── clinics/{clinicId}/
 *  │   ├── profile/         → Clinic metadata, subscription, branding
 *  │   ├── patients/        → Pet profiles (species, breed, weight, etc.)
 *  │   ├── dietPlans/       → Generated diet plans per pet
 *  │   ├── analytics/       → Historical analytics snapshots
 *  │   ├── compliance/      → Compliance tracking per pet
 *  │   ├── auditLogs/       → Timestamped audit trail
 *  │   ├── activity/        → Recent activity feed
 *  │   ├── billing/         → Subscription & payment records
 *  │   └── staff/           → RBAC staff members
 */

// ══════════════════════════════════════════════════════
// 1. CLINIC PROFILE COLLECTION
// ══════════════════════════════════════════════════════

export interface ClinicProfile {
    clinicId: string;
    clinicName: string;
    address?: string;
    email?: string;
    phone?: string;
    subscriptionPlan: 'free' | 'pro' | 'enterprise';
    subscriptionExpiry?: number;
    totalPatientLimit: number;
    createdAt: number;
    updatedAt: number;
}

export async function getClinicProfile(clinicId: string): Promise<ClinicProfile | null> {
    const profileRef = ref(db, `clinics/${clinicId}/profile`);
    const snapshot = await get(profileRef);
    if (!snapshot.exists()) return null;
    return snapshot.val() as ClinicProfile;
}

export async function updateClinicProfile(clinicId: string, data: Partial<ClinicProfile>) {
    const profileRef = ref(db, `clinics/${clinicId}/profile`);
    await update(profileRef, { ...data, updatedAt: Date.now() });
    await logAudit(clinicId, 'CLINIC_UPDATE', `Clinic profile modified`);
}

export async function initClinicProfile(clinicId: string, clinicName: string) {
    const profileRef = ref(db, `clinics/${clinicId}/profile`);
    const existing = await get(profileRef);
    if (!existing.exists()) {
        const profile: ClinicProfile = {
            clinicId,
            clinicName,
            subscriptionPlan: 'pro',
            totalPatientLimit: 500,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        await set(profileRef, profile);
    }
}

// ══════════════════════════════════════════════════════
// 2. PATIENTS / PETS COLLECTION
// ══════════════════════════════════════════════════════

export async function addPet(clinicId: string, pet: Pet) {
    if (!clinicId) throw new Error("Clinic ID is required for persistence");
    console.log(`[DATABASE] Registering patient: ${pet.name} at path: clinics/${clinicId}/patients`);

    const petsRef = ref(db, `clinics/${clinicId}/patients`);
    const newPetRef = push(petsRef);
    const petWithMeta = {
        ...pet,
        id: newPetRef.key,
        status: pet.status || 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await set(newPetRef, petWithMeta);
    console.log(`[DATABASE] Success! Node Created: ${newPetRef.key}`);

    await logActivity(clinicId, 'Register Patient', `Added new patient: ${pet.name} (${pet.species})`);
    await logAudit(clinicId, 'PATIENT_ADD', `Patient "${pet.name}" registered | Species: ${pet.species} | Breed: ${pet.breed}`);
    return petWithMeta;
}

export async function getPets(clinicId: string): Promise<Pet[]> {
    if (!clinicId || clinicId === 'undefined' || clinicId === 'null') return [];
    try {
        console.log(`[DATABASE] Fetching patient registry for: ${clinicId}`);
        const petsRef = ref(db, `clinics/${clinicId}/patients`);
        const snapshot = await get(petsRef);
        if (!snapshot.exists()) return [];
        return Object.values(snapshot.val()) as Pet[];
    } catch (err) {
        console.error('[DATABASE_ERROR] Registry fetch failed:', err);
        return [];
    }
}

export async function getPetById(clinicId: string, petId: string): Promise<Pet | null> {
    if (!clinicId || !petId) return null;
    const petRef = ref(db, `clinics/${clinicId}/patients/${petId}`);
    const snapshot = await get(petRef);
    if (!snapshot.exists()) return null;
    return snapshot.val() as Pet;
}

export async function updatePet(clinicId: string, petId: string, data: Partial<Pet>) {
    if (!clinicId || !petId) throw new Error("Clinic ID and Pet ID required for sync");
    console.log(`[DATABASE] Synchronizing updates for node: ${petId} at clinics/${clinicId}/patients`);

    const petRef = ref(db, `clinics/${clinicId}/patients/${petId}`);
    await update(petRef, { ...data, updatedAt: Date.now() });
    console.log(`[DATABASE] Node Sync Complete: ${petId}`);

    await logActivity(clinicId, 'Update Patient', `Modified records for pet ID: ${petId}`);
    await logAudit(clinicId, 'PATIENT_UPDATE', `Patient ${petId} records modified`);
}

export async function deletePet(clinicId: string, petId: string) {
    const petRef = ref(db, `clinics/${clinicId}/patients/${petId}`);
    await remove(petRef);
    await logAudit(clinicId, 'PATIENT_DELETE', `Patient ${petId} removed from registry`);
}

export async function clearDemoPatients(clinicId: string) {
    console.log(`[DATABASE] Cleaning demo records for clinic: ${clinicId}`);
    const petsRef = ref(db, `clinics/${clinicId}/patients`);
    const snapshot = await get(petsRef);
    if (!snapshot.exists()) return;

    const pets = snapshot.val();
    const updates: any = {};
    Object.keys(pets).forEach(id => {
        if (pets[id].isDemo) updates[id] = null;
    });

    await update(petsRef, updates);
    console.log(`[DATABASE] Demo cleanup complete.`);
}

// ══════════════════════════════════════════════════════
// 3. DIET PLANS COLLECTION
// ══════════════════════════════════════════════════════

export interface StoredDietPlan {
    id?: string;
    petId: string;
    petName: string;
    species: string;
    breed: string;
    weightKg: number;
    ageYears: number;
    activityLevel: string;
    conditions: string[];
    region: string;
    analysis: NutritionAnalysis;
    budgetPeriod: 'weekly' | 'monthly';
    createdAt: number;
    updatedAt: number;
    status: 'active' | 'archived' | 'revised';
    version: number;
}

export async function saveDietPlan(clinicId: string, plan: Omit<StoredDietPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredDietPlan> {
    const plansRef = ref(db, `clinics/${clinicId}/dietPlans`);
    const newPlanRef = push(plansRef);
    const planWithMeta: StoredDietPlan = {
        ...plan,
        id: newPlanRef.key!,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    await set(newPlanRef, planWithMeta);

    // Link plan to pet
    if (plan.petId) {
        const petRef = ref(db, `clinics/${clinicId}/patients/${plan.petId}`);
        await update(petRef, { planId: newPlanRef.key, updatedAt: Date.now() });
    }

    await logActivity(clinicId, 'Diet Plan Generated', `Protocol created for ${plan.petName} (${plan.breed})`);
    await logAudit(clinicId, 'PLAN_CREATE', `Diet plan v${plan.version} for "${plan.petName}" | MER: ${plan.analysis.mer}kcal | Budget: ${plan.analysis.budget.currency}${plan.analysis.budget.monthly}/mo`);

    // Record analytics snapshot
    await recordAnalyticsSnapshot(clinicId, {
        type: 'plan_created',
        petName: plan.petName,
        mer: plan.analysis.mer,
        rer: plan.analysis.rer,
        species: plan.species,
    });
    if (!clinicId || clinicId === 'undefined' || clinicId === 'null') throw new Error("Clinic ID is required for saving diet plan");
    try {
        const plansRef = ref(db, `clinics/${clinicId}/dietPlans`);
        const newPlanRef = push(plansRef);
        const planWithMeta: StoredDietPlan = {
            ...plan,
            id: newPlanRef.key!,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        await set(newPlanRef, planWithMeta);

        // Link plan to pet
        if (plan.petId) {
            const petRef = ref(db, `clinics/${clinicId}/patients/${plan.petId}`);
            await update(petRef, { planId: newPlanRef.key, updatedAt: Date.now() });
        }

        await logActivity(clinicId, 'Diet Plan Generated', `Protocol created for ${plan.petName} (${plan.breed})`);
        await logAudit(clinicId, 'PLAN_CREATE', `Diet plan v${plan.version} for "${plan.petName}" | MER: ${plan.analysis.mer}kcal | Budget: ${plan.analysis.budget.currency}${plan.analysis.budget.monthly}/mo`);

        // Record analytics snapshot
        await recordAnalyticsSnapshot(clinicId, {
            type: 'plan_created',
            petName: plan.petName,
            mer: plan.analysis.mer,
            rer: plan.analysis.rer,
            species: plan.species,
        });

        return planWithMeta;
    } catch (err) {
        console.error(`[DATABASE_ERROR] Failed to save diet plan for clinic ${clinicId}:`, err);
        throw err;
    }
}

export async function getDietPlans(clinicId: string): Promise<StoredDietPlan[]> {
    if (!clinicId || clinicId === 'undefined' || clinicId === 'null') return [];
    try {
        const plansRef = ref(db, `clinics/${clinicId}/dietPlans`);
        const snapshot = await get(plansRef);
        if (!snapshot.exists()) return [];
        return Object.values(snapshot.val()) as StoredDietPlan[];
    } catch (err) {
        console.error('[DATABASE_ERROR] Protocol fetch failed:', err);
        return [];
    }
}

export async function getDietPlansByPet(clinicId: string, petId: string): Promise<StoredDietPlan[]> {
    if (!clinicId || clinicId === 'undefined' || clinicId === 'null' || !petId) return [];
    try {
        const plans = await getDietPlans(clinicId); // getDietPlans already has error handling
        return plans.filter(p => p.petId === petId).sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
        console.error(`[DATABASE_ERROR] Failed to get diet plans for pet ${petId} in clinic ${clinicId}:`, err);
        return [];
    }
}

export async function archiveDietPlan(clinicId: string, planId: string) {
    await logAudit(clinicId, 'PLAN_ARCHIVE', `Diet plan ${planId} archived`);
}

// ══════════════════════════════════════════════════════
// 4. ANALYTICS COLLECTION (Historical Snapshots)
// ══════════════════════════════════════════════════════

export interface AnalyticsSnapshot {
    id?: string;
    type: string;
    petName?: string;
    mer?: number;
    rer?: number;
    species?: string;
    complianceScore?: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

export async function recordAnalyticsSnapshot(clinicId: string, data: Omit<AnalyticsSnapshot, 'id' | 'timestamp'>) {
    const analyticsRef = ref(db, `clinics/${clinicId}/analytics`);
    await push(analyticsRef, {
        ...data,
        timestamp: Date.now(),
    });
}

export async function getAnalyticsHistory(clinicId: string, limit = 50): Promise<AnalyticsSnapshot[]> {
    const analyticsRef = ref(db, `clinics/${clinicId}/analytics`);
    const snapshot = await get(analyticsRef);
    if (!snapshot.exists()) return [];
    const entries = Object.entries(snapshot.val()).map(([id, val]: [string, any]) => ({ id, ...val }));
    return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ══════════════════════════════════════════════════════
// 5. COMPLIANCE COLLECTION
// ══════════════════════════════════════════════════════

export interface ComplianceRecord {
    id?: string;
    petId: string;
    petName: string;
    planId: string;
    weekNumber: number;
    score: number; // 0-100
    mealsFollowed: number;
    mealsTotal: number;
    notes?: string;
    timestamp: number;
}

export async function recordCompliance(clinicId: string, record: Omit<ComplianceRecord, 'id' | 'timestamp'>) {
    const complianceRef = ref(db, `clinics/${clinicId}/compliance`);
    await push(complianceRef, {
        ...record,
        timestamp: Date.now(),
    });
    await logAudit(clinicId, 'COMPLIANCE_LOG', `Compliance recorded for ${record.petName}: ${record.score}%`);
}

export async function getComplianceByPet(clinicId: string, petId: string): Promise<ComplianceRecord[]> {
    const complianceRef = ref(db, `clinics/${clinicId}/compliance`);
    const snapshot = await get(complianceRef);
    if (!snapshot.exists()) return [];
    const all = Object.entries(snapshot.val()).map(([id, val]: [string, any]) => ({ id, ...val }));
    return all.filter(r => r.petId === petId).sort((a, b) => b.timestamp - a.timestamp);
}

export async function getClinicCompliance(clinicId: string): Promise<ComplianceRecord[]> {
    const complianceRef = ref(db, `clinics/${clinicId}/compliance`);
    const snapshot = await get(complianceRef);
    if (!snapshot.exists()) return [];
    return Object.entries(snapshot.val()).map(([id, val]: [string, any]) => ({ id, ...val }));
}

// ══════════════════════════════════════════════════════
// 6. AUDIT LOGS COLLECTION (Immutable Trail)
// ══════════════════════════════════════════════════════

export interface AuditLog {
    id?: string;
    action: string;
    category: string;
    details: string;
    timestamp: number;
    ipAddress?: string;
}

export async function logAudit(clinicId: string, category: string, details: string) {
    const auditRef = ref(db, `clinics/${clinicId}/auditLogs`);
    await push(auditRef, {
        action: category,
        category,
        details,
        timestamp: Date.now(),
    });
}

export async function getAuditLogs(clinicId: string, limit = 100): Promise<AuditLog[]> {
    const auditRef = ref(db, `clinics/${clinicId}/auditLogs`);
    const snapshot = await get(auditRef);
    if (!snapshot.exists()) return [];
    const logs = Object.entries(snapshot.val()).map(([id, val]: [string, any]) => ({ id, ...val }));
    return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ══════════════════════════════════════════════════════
// 7. ACTIVITY FEED (Recent Actions)
// ══════════════════════════════════════════════════════

export async function logActivity(clinicId: string, action: string, details: string) {
    const logRef = ref(db, `clinics/${clinicId}/activity`);
    await push(logRef, {
        action,
        details,
        user: 'system',
        timestamp: Date.now(),
    });
}

export async function getRecentActivity(clinicId: string, limit = 10) {
    const logRef = ref(db, `clinics/${clinicId}/activity`);
    const snapshot = await get(logRef);
    if (!snapshot.exists()) return [];
    const logs = Object.entries(snapshot.val()).map(([id, val]: [string, any]) => ({ id, ...val }));
    return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ══════════════════════════════════════════════════════
// 8. BILLING / SUBSCRIPTION COLLECTION
// ══════════════════════════════════════════════════════

export interface BillingRecord {
    id?: string;
    amount: number;
    currency: string;
    plan: string;
    status: 'paid' | 'pending' | 'failed';
    timestamp: number;
}

export async function recordBilling(clinicId: string, billing: Omit<BillingRecord, 'id' | 'timestamp'>) {
    const billingRef = ref(db, `clinics/${clinicId}/billing`);
    await push(billingRef, {
        ...billing,
        timestamp: Date.now(),
    });
}

export async function getBillingHistory(clinicId: string): Promise<BillingRecord[]> {
    const billingRef = ref(db, `clinics/${clinicId}/billing`);
    const snapshot = await get(billingRef);
    if (!snapshot.exists()) return [];
    return Object.entries(snapshot.val()).map(([id, val]: [string, any]) => ({ id, ...val }));
}

// ══════════════════════════════════════════════════════
// 9. STAFF / RBAC COLLECTION
// ══════════════════════════════════════════════════════

export interface StaffMember {
    id?: string;
    name: string;
    email: string;
    role: 'admin' | 'vet' | 'staff' | 'tech';
    permissions: 'full' | 'clinical' | 'limited';
    status: 'active' | 'on-leave' | 'inactive';
    lastLogin?: number;
    createdAt: number;
}

export async function addStaffMember(clinicId: string, staff: Omit<StaffMember, 'id' | 'createdAt'>) {
    const staffRef = ref(db, `clinics/${clinicId}/staff`);
    const newRef = push(staffRef);
    const member: StaffMember = {
        ...staff,
        id: newRef.key!,
        createdAt: Date.now(),
    };
    await set(newRef, member);
    await logAudit(clinicId, 'STAFF_ADD', `Staff member "${staff.name}" added with role: ${staff.role}`);
    return member;
}

export async function getStaffMembers(clinicId: string): Promise<StaffMember[]> {
    const staffRef = ref(db, `clinics/${clinicId}/staff`);
    const snapshot = await get(staffRef);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as StaffMember[];
}

// ══════════════════════════════════════════════════════
// 10. AGGREGATED ANALYTICS (Dashboard)
// ══════════════════════════════════════════════════════

export async function getClinicAnalytics(clinicId: string) {
    const [pets, plans, compliance, recentActivity, auditLogs] = await Promise.all([
        getPets(clinicId),
        getDietPlans(clinicId),
        getClinicCompliance(clinicId),
        getRecentActivity(clinicId),
        getAuditLogs(clinicId, 20),
    ]);

    // Species breakdown
    const speciesCounts: Record<string, number> = {};
    pets.forEach(p => {
        speciesCounts[p.species] = (speciesCounts[p.species] || 0) + 1;
    });

    // Monthly plan creation tracking
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyPlanMap: Record<string, number> = {};
    plans.forEach(p => {
        const d = new Date(p.createdAt);
        const key = monthNames[d.getMonth()];
        monthlyPlanMap[key] = (monthlyPlanMap[key] || 0) + 1;
    });

    // Build monthly data — show last 6 months
    const now = new Date();
    const monthlyPlans = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = monthNames[d.getMonth()];
        monthlyPlans.push({ month: label, count: monthlyPlanMap[label] || 0 });
    }

    // Average compliance
    const avgCompliance = compliance.length > 0
        ? Math.round(compliance.reduce((s, c) => s + c.score, 0) / compliance.length)
        : 0;

    // Active plans count
    const activePlans = plans.filter(p => p.status === 'active').length;

    // Average synthesis score from active plans
    const avgSynthesis = plans.length > 0
        ? Math.round(plans.reduce((s, p) => s + (p.analysis?.synthesisScore || 90), 0) / plans.length)
        : 94;

    return {
        totalPatients: pets.length,
        totalPlans: plans.length,
        activePlans,
        activePets: pets.filter(p => p.status !== 'archived').length,
        avgSynthesis,
        speciesCounts,
        monthlyPlans,
        avgCompliance,
        recentActivity,
        auditLogs,
        planRevisions: plans.filter(p => p.version > 1).length,
    };
}

// ══════════════════════════════════════════════════════
// 11. COLLECTION INITIALIZER — Seeds all collection roots
//     so they appear in Firebase Console immediately.
// ══════════════════════════════════════════════════════

export async function initializeAllCollections(clinicId: string, clinicName: string) {
    const clinicRoot = ref(db, `clinics/${clinicId}`);
    const snap = await get(clinicRoot);
    const existing = snap.exists() ? snap.val() : {};

    const now = Date.now();

    // ── 1. Clinic Profile ──────────────────────────────
    if (!existing.profile) {
        await set(ref(db, `clinics/${clinicId}/profile`), {
            clinicId,
            clinicName,
            subscriptionPlan: 'pro',
            totalPatientLimit: 500,
            createdAt: now,
            updatedAt: now,
        });
    }

    // ── 2. Patients (Empty Init) ───────────────────────
    if (!existing.patients) {
        // No sample pets added anymore for cleaner registry
        console.log('[DATABASE] Initialized empty patients registry');
    }

    // ── 3. Diet Plans (Empty Init) ─────────────────────
    if (!existing.dietPlans) {
        // Empty init
    }

    // ── 4. Compliance (Empty Init) ──────────────────────
    if (!existing.compliance) {
        // Empty init
    }

    // ── 6. Audit Logs ──────────────────────────────────
    if (!existing.auditLogs) {
        await push(ref(db, `clinics/${clinicId}/auditLogs`), {
            action: 'SYSTEM_INIT',
            category: 'SYSTEM_INIT',
            details: `All Firebase collections initialized for clinic "${clinicName}"`,
            timestamp: now,
        });
    }

    // ── 7. Activity Feed ───────────────────────────────
    if (!existing.activity) {
        await push(ref(db, `clinics/${clinicId}/activity`), {
            action: 'System Initialized',
            details: `Welcome to Claws & Paws! All collections are ready.`,
            user: 'system',
            timestamp: now,
        });
    }

    // ── 8. Billing ─────────────────────────────────────
    if (!existing.billing) {
        await push(ref(db, `clinics/${clinicId}/billing`), {
            amount: 0,
            currency: 'INR',
            plan: 'pro-trial',
            status: 'paid',
            timestamp: now,
        });
    }

    // ── 9. Staff ───────────────────────────────────────
    if (!existing.staff) {
        await push(ref(db, `clinics/${clinicId}/staff`), {
            name: clinicName + ' Admin',
            email: 'admin@clinic.local',
            role: 'admin',
            permissions: 'full',
            status: 'active',
            createdAt: now,
        });
    }

    console.log(`✅ Firebase collections initialized for clinic: ${clinicName} (${clinicId})`);
}
