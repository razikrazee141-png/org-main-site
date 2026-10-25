# NextGen — Official Corporate Website

> **Leading Today, Shaping Tomorrow.**

NextGen is a forward-looking multidisciplinary organisation dedicated to creating meaningful opportunities through technology, education, social services, and community development.

---

## 🏛️ Project Architecture

This repository hosts the full-stack official website of NextGen:

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, and bespoke Canvas dynamic orb backgrounds.
- **Brand Identity:** High-fidelity vector SVG and raster brand mark (`#125EA2`, `#388E3C`, `#ED2924`, `#FFA726`).
- **Leadership Showcase:** Auto-rotating board showcase (Muhammed Rihab, Muhammed Sadath, Sayyid Fazal Al Bukhari, Muhammed Razik, Akbar) with cross-dissolve & Ken-Burns motion design.
- **Backend API:** Express 5 + Node.js backend providing inquiry routing, RFC regex email validation, IP rate limiting, honeypot bot defense, and persistent storage.
- **Administrative Inbox:** Protected portal (`/admin` or `?view=admin`) for staff to review, triage, filter, and respond to incoming inquiries.

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Configure your port and administrative passkey in `.env`.

### 3. Development Mode

Run the frontend development server:

```bash
npm run dev
```

Run the backend server concurrently:

```bash
npm run server
```

### 4. Production Build & Serving

Build the optimized production assets:

```bash
npm run build
```

Start the single unified server (serves both static frontend bundle and backend API on port 5000):

```bash
npm start
```

---

## 🛡️ Administrative Portal

To access the inquiry management dashboard:
1. Navigate to `/admin` or `?view=admin` (or click *Inquiries Portal* in the footer).
2. Enter your administrative passkey (default in `.env` is `nextgen_admin_2026`).
3. View, mark status (*New*, *Reviewed*, *Responded*), search, or reply directly via email.

---

## 📍 Registered Office

**NextGen Head Office**  
Shivamogga, Karnataka, India  
Operating Hours: Monday – Friday, 9:30 AM – 5:30 PM (IST)

---

## 📄 License & Rights

© 2026 NextGen. All rights reserved.
