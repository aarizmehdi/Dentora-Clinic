<div align="center">
  <img src="https://img.icons8.com/color/96/000000/tooth.png" alt="Dentora Logo" />
  <h1>Dentora - Modern Clinic Management System</h1>
  <p>A comprehensive, lightning-fast SaaS operating system designed for modern dental practices.</p>
</div>

---

## 🚀 Overview
**Dentora** is a powerful Dental Practice Management (DPM) system built with React, TypeScript, and Firebase. It replaces clunky legacy dental software with a beautiful, glassmorphic UI, offering real-time patient charting, appointment scheduling, and automated workflows.

## ✨ Key Features

### 🦷 Advanced Clinical Charting
- **Interactive Odontogram**: Visually log existing conditions, planned treatments, and completed procedures tooth-by-tooth.
- **Periodontal Charting**: Detailed 6-point pocket depth tracking, mobility, furcation, and bleeding/suppuration indicators.
- **Smart Validation**: Logic engine ensures treatments match tooth types (e.g., no adult procedures on primary teeth).

### 📅 Smart Scheduling & Booking
- **Multi-View Calendar**: Toggle between Operatory View (by room) and Provider View (by doctor) seamlessly.
- **Conflict Prevention**: Built-in logic prevents double-booking and respects clinic operating hours.
- **Odontogram Quick-Start**: Jump directly into an active visit from today's schedule without navigating away.

### 💬 Automated Patient Communication
- **WhatsApp Integration**: Native integration with the UltraMsg API.
- **Automated Alerts**: Automatically send appointment confirmations, friendly reminders, and post-visit PDF invoices directly to patients' phones via WhatsApp.

### 💳 Integrated Billing
- **One-Click Invoicing**: Generate professional PDF invoices directly from completed clinical treatment plans.
- **Payment Tracking**: Track partial payments, outstanding balances, and daily collections via an actionable billing dashboard.

---

## 🛠 Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, Framer Motion (for micro-animations), Lucide React (icons)
- **Backend/Database**: Firebase (Auth, Firestore DB, Storage)
- **PDF Generation**: jsPDF, html2canvas
- **API Integration**: UltraMsg API (WhatsApp)

## 📦 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aarizmehdi/Dentora-Clinic.git
   cd Dentora-Clinic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration & Defaults
- **No Dummy Data**: Upon initial signup and registration of a new clinic, Dentora launches with a clean slate. No dummy patients or appointments are injected.
- **WhatsApp Setup**: By default, WhatsApp automation is disabled. Clinic administrators can navigate to **Practice Settings** to input their Instance ID and Token, and securely enable the `Auto` invoice delivery mode.

---

> Designed & Built for seamless dental workflows.
