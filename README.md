# Claws & Paws – Veterinary Nutrition AI

Claws & Paws is a high-tech, clinical-grade Veterinary Nutrition Management System designed for elite veterinary practices. It streamlines patient registration, autonomous diet synthesis, and clinical analytics.

## 🚀 Key Features

- **Intelligence Hub**: Real-time dashboard showing clinic-wide analytics, species distribution, and synthesis averages.
- **Patient Registry**: Secure datastore for biological pet profiles, history, and medical conditions.
- **Diet Forge (Dietary Node)**: Autonomous nutritional protocol generation based on species, breed, and pathology.
- **Clinical Analytics**: Deep-dive insights into patient retention, protocol versions, and regional compliance.
- **Medical Store**: Professional-grade supply procurement system with curated nutritional products.
- **Clinic RBAC**: Role-Based Access Control for secure staff management and audit trails.
- **Pharma Engine**: Controlled inventory system for veterinary pharmaceuticals with narcotics safety tiers.
- **Compliance Dashboard**: Real-time monitoring of patient adherence to nutritional protocols.

## 📊 Analytics & Intelligence Engine

The application uses a **Multi-Tenant Architecture** where data is strictly isolated per clinic.

### 1. Data Isolation & Security
- **Per-Clinic Registry**: Every login initializes a unique clinical node. Patient data added in one clinic is never visible to another.
- **RBAC (Access Control)**: Staff roles (Admin, Vet, Tech) are enforced at the UI and Data layer. Audit logs track every modification to the clinical chain.

### 2. Clinical Analytics Logic
Analytics are calculated on-the-fly from live Firebase data using the following metrics:
- **Synthesis Depth**: Measures the average quality score of nutrition plans across the clinic.
- **NDS (Nutrient Distribution Score)**: A proprietary metric calculating the precision of macro-nutrient allocation across the patient base.
- **Retention Tracking**: Analyzes patient activity and plan versioning to determine clinic performance.
- **Species Share**: Phylogenetic distribution mapping (Dog, Cat, etc.) to optimize inventory.

### 3. Compliance & Audit
- **Adherence Tracking**: Automated monitoring of meal followership and weight stability.
- **Alert System**: Real-time triggers for critical interventions (e.g., ">5% Weight Drop" or "Missed Protocol").
- **Audit Logs**: Every clinical decision (Plan generation, Medication dispensing) creates a permanent, non-repudiable audit entry.

## 🧪 The Dietary Node (Implementation Levels)
The Dietary Node (Diet Forge) follows a rigorous 6-level implementation logic:
- **L0: Selection Hub**: Synchronizes with the Registry to pull existing patient metrics.
- **L1: Phylogenetic Node**: Determines base nutritional profiles (e.g., Cats = Obligate Carnivores).
- **L2: Biological Profiling**: Collects metrics (Weight, Age, Breed).
- **L3: Metabolic Intensity**: Applies expenditure multipliers ($1.2x$ to $1.8x$).
- **L4: Pathological Logic**: Maps health conditions (Obesity, CKD, Diabetes) to macro adjustments.
- **L5: Neural Synthesis**: The Nutrition Engine performs formula-based calculus ($70 \times Weight^{0.75}$).
- **L6: Protocol Commitment**: Finalizes the `StoredDietPlan` and secures it in the clinical blockchain.

## 💊 Pharmacy & Medical Systems
- **Tiered Safety Control**: Medications are tiered (Tier 1 to Tier 3). Tier 3 (Narcotics) requires Vet-in-Charge overrides.
- **Stock Management**: Real-time inventory tracking with "Critical Stock" alerts.
- **Economic Localization**: Direct currency and cost-of-living multipliers for multi-regional clinics (India, UAE, USA, etc.).

## 🛠️ Technical Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Database**: Firebase Realtime Database
- **Visuals**: Recharts (for clinical projections), Lucide React (icons)
- **Deployment**: Vercel

---
*Created with focus on medical precision and premium user experience.*
