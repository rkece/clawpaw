# Claws & Paws – Veterinary Nutrition AI

Claws & Paws is a high-tech, clinical-grade Veterinary Nutrition Management System designed for elite veterinary practices. It streamlines patient registration, autonomous diet synthesis, and clinical analytics.

## 🚀 Key Features

- **Intelligence Hub**: Real-time dashboard showing clinic-wide analytics, species distribution, and synthesis averages.
- **Patient Registry**: Secure datastore for biological pet profiles, history, and medical conditions.
- **Diet Forge (Dietary Node)**: Autonomous nutritional protocol generation based on species, breed, and pathology.
- **Clinical Analytics**: Deep-dive insights into patient retention, protocol versions, and regional compliance.
- **Medical Store**: Professional-grade supply procurement system with curated nutritional products.

## 📊 Analytics Engine

The application uses a **Multi-Tenant Architecture** where data is strictly isolated per clinic.

### Data Isolation
- **Per-Clinic Registry**: Every login initializes a unique clinical node. Patient data added in one clinic is never visible to another.
- **Dynamic Calculation**: Analytics are calculated on-the-fly from live Firebase data:
  - **Avg Synthesis**: Mean score of all generated diet protocols.
  - **Species Load**: Real-time distribution of phylogenetic nodes (Dog, Cat, etc.).
  - **Retention Tracking**: Analyzes patient activity and plan versioning to determine clinic performance.

### Intelligence Hub (Dashboard)
The dashboard provides high-level KPIs:
- **Synthesis Depth**: Measures the average quality score of nutrition plans.
- **Active Protocols**: Real-time count of active nutritional plans in the current clinic.
- **Activity Feed**: Live audit trail of clinical actions (registrations, updates).

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Database**: Firebase Realtime Database
- **Visuals**: Recharts (for clinical projections), Lucide React (icons)
- **Deployment**: Vercel

## 📂 Project Structure

- `/src/app/dashboard`: Core application modules (Registry, Planner, Analytics).
- `/src/lib`: Logic engines (Nutrition Calculation, DB Services).
- `/src/data`: Biological constants and regional economic data.
- `/src/components`: Reusable UI primitives and layout systems.

---
*Created with focus on medical precision and premium user experience.*
