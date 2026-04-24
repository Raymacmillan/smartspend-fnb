<div align="center">

# 💰 SmartSpend

**Intelligent spending insights for FNB Botswana customers**

*CSS Squad · FNB FinTech Hackathon 2025*



</div>

---

## Overview

SmartSpend is an embedded analytics feature designed for FNB Botswana. It turns ordinary transaction data into actionable intelligence — telling users exactly where their money is going, how much they're losing to avoidable bank charges, and what specific habit changes would improve their financial health.

It solves a problem we see every day in Botswana: people know they should save, but they don't know *where* their money is actually leaking. SmartSpend closes that gap with five calculable, personalised modules.

---

## The Five Modules

### 1. Spend Insights
Auto-categorises transactions (groceries, dining, ATM, airtime, bank charges, fuel, electricity) using keyword-based rules. Detects month-on-month trends and flags repeated small purchases that add up — e.g. *"You spent P240 on airtime through 24 small purchases this month."*

### 2. Smart Recommendations
Every recommendation ships with four fields: **issue**, **cost impact**, **better option**, **estimated saving**. No generic "save more" advice — only specific, quantifiable suggestions. Example: *"Grouping airtime into one P100 purchase could save P18/month in transaction fees."*

### 3. Goal-Based Saving
Users create goals with a target amount (Pula), current savings, and deadline. The calculator returns months remaining, required monthly saving, projected completion, and category-specific suggestions to close any gap.

### 4. Bank Charge Intelligence
Classifies charges by type (ATM, interbank transfers, SMS fees, service fees) and surfaces cheaper alternatives — e.g. *"FNB-to-FNB transfers are free — use them where possible."*

### 5. Financial Health Score
A 0–100 score across five weighted factors: saving consistency (25pts), charge efficiency (20pts), discretionary spend ratio (20pts), goal progress (20pts), and spending volatility (15pts). Returns what helped, what hurt, and the top action to improve next month.

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | Expo SDK 54 (React Native 0.81)                 |
| Navigation     | Expo Router (file-based, stack + tabs)          |
| Language       | JavaScript (JSX)                                |
| Authentication | Firebase Auth — mobile number + 4-digit PIN     |
| Database       | Cloud Firestore                                 |
| State          | React Context + useReducer                      |
| AI (optional)  | Groq API for natural-language insights          |
| Currency       | Botswana Pula (P) with en-ZA locale formatting  |
| Charts         | react-native-svg                                |

---

## Architecture

Three clean layers, strict separation:

```
┌─────────────────────────────────────────┐
│  Screens  (app/)                        │  Expo Router routes
│  ─ orchestrate data and user actions    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Components  (src/components/)          │  Stateless UI
│  ─ organised by feature                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Services  (src/services/)              │  Pure business logic
│  ─ engines: categorisation,             │  and Firebase
│    recommendations, goals, charges,     │  integration
│    health scoring                       │
└─────────────────────────────────────────┘
```

Engines never import React. Components never make network calls. Screens stay thin.

---

## Folder Structure

```
smartspend-fnb/
├── app/                            # Expo Router screens
│   ├── _layout.jsx                 # Root layout + auth guard
│   ├── index.jsx                   # Entry redirect
│   ├── login.jsx                   # Mobile + PIN login
│   ├── onboarding.jsx              # 3-step onboarding
│   ├── (tabs)/                     # Main tab navigation
│   │   ├── _layout.jsx
│   │   ├── index.jsx               # Home
│   │   ├── analytics.jsx
│   │   ├── goals.jsx
│   │   ├── insights.jsx
│   │   └── more.jsx
│   └── smartspend/                 # Feature detail screens
│       ├── category.jsx
│       ├── charges.jsx
│       ├── recommendations.jsx
│       ├── health-score.jsx
│       ├── goal-detail.jsx
│       └── add-goal.jsx
│
├── src/
│   ├── components/                 # Reusable UI (organised by feature)
│   ├── services/
│   │   ├── firebase/               # config, auth, firestore, seed
│   │   ├── categorisation/         # keyword engine
│   │   ├── recommendations/        # rules-based engine
│   │   ├── goals/                  # math calculator
│   │   ├── charges/                # charge analyser
│   │   └── health/                 # health scorer
│   ├── hooks/                      # useTransactions, useGoals, useCharges
│   ├── store/                      # Context + reducer
│   ├── constants/                  # theme, colors, categories
│   ├── utils/                      # currency, dates, math
│   └── data/                       # Sample seed data for demos
│
├── assets/                         # Icons, images, fonts
├── .env.example                    # Template for environment variables
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build profiles
├── vercel.json                     # Vercel deployment config
└── package.json
```

---

## Authentication Model

SmartSpend uses the same pattern as FNB's real banking app: **mobile number identifies the user, PIN authenticates them.**

Under the hood, Firebase Auth receives a synthetic email derived from the mobile number and a padded PIN as the password. This means:

- Mobile numbers are globally unique (no two users can have the same account)
- PIN collisions are impossible because the PIN alone isn't the identifier
- Firebase rate-limits failed login attempts automatically
- PINs are never stored in Firestore — only hashed inside Firebase Auth

In production, this would be replaced with a direct binding to FNB's customer identity system. For the demo it simulates that flow faithfully.

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- Expo Go app (for phone testing) **or** Android emulator

### Steps

```bash
# 1. Clone
git clone git@github.com:Raymacmillan/smartspend-fnb.git
cd smartspend-fnb

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment
cp .env.example .env
# Fill in .env with the Firebase + Groq credentials (ask the team)

# 4. Start the dev server
npx expo start --tunnel
```

Scan the QR code with Expo Go on your phone — or press `a` for an Android emulator, `w` for web.

---

## Deployment

### Web — Vercel

Vercel auto-deploys on every push to `main`. The production build runs:

```bash
npx expo export --platform web
```

Output goes to `dist/`. Vercel serves it with rewrites so Expo Router handles all client-side routes.

### Android APK — EAS Build

```bash
eas build --platform android --profile preview
```

Builds a standalone `.apk` in the cloud (10–15 min). Shareable install link at the end.

### iOS

Any iPhone user can scan the QR code from `expo start --tunnel` with Expo Go installed.

---

## Environment Variables

All keys are prefixed `EXPO_PUBLIC_` so Expo picks them up at build time:

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_GROQ_API_KEY
```

Never commit `.env`. Use `.env.example` as a template only.

---

## Firestore Data Model

```
users/{userId}
  ├── name, mobile, consent, createdAt
  │
  ├── transactions/{txnId}
  │   ├── description, amount, date (Timestamp)
  │
  └── goals/{goalId}
      ├── name, target, saved, deadline, createdAt
```

Security rules restrict every read and write to the owning user:

```
match /users/{userId}/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```

---

## Development Conventions

- **Branch:** all work on `main` (solo hackathon workflow)
- **Commits:** present-tense imperative — *"add"*, *"fix"*, *"refactor"*, never *"added"*
- **Prefixes:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- **Auth:** SSH only, never HTTPS + tokens
- **Language:** JavaScript only, no TypeScript (hackathon speed)
- **Currency:** always formatted via `formatPula()` — never hand-roll
- **Colors:** from `src/constants/theme.js`, never hex literals in components

---

## The Team

**CSS Squad · Gaborone, Botswana**

Built for the FNB FinTech Hackathon 2025.

---

<div align="center">

**Made in Botswana 🇧🇼**

</div>