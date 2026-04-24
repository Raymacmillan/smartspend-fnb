# SmartSpend Analytics 🇧🇼
### FNB FinTech Hackathon 2025

SmartSpend Analytics is a React Native mobile application built with Expo, Firebase, and Groq AI. Designed specifically for the Botswana market, it provides FNB customers with highly personalized, intelligent financial insights to bridge the gap between raw banking data and actionable financial literacy.

## 🎯 Purpose of this Project
Most traditional banking apps only show you *what* you spent. SmartSpend acts as an automated financial coach that tells you *why* it matters and *exactly how* to improve. 

The core purpose is to tackle financial stress and improve financial literacy for Batswana by identifying "avoidable leakages"—such as high ATM withdrawal fees, avoidable interbank charges, and unbudgeted discretionary spending at local merchants (e.g., Spar, Choppies, BPC). By providing a real-time Financial Health Score (0–100) and actionable AI-driven savings plans, SmartSpend empowers users to take control of their financial future.

## 🛠️ Engineering Architecture:

1. **7-Layer Modular Architecture**: Built a strict N-tier separation of concerns (UI, Analytics Engine, Advisory Engine, Data Layer, Goals Service, Notifications, and API Integrations) to ensure scalability, security, and testability.
2. **Real-time AI Advisory Integration**: Replaced legacy LLMs with Groq's blazingly fast `llama-3.1-8b-instant` model. Engineered a robust prompt system that strictly enforces JSON object responses to reliably render UI components without breaking the app.
3. **Privacy-by-Design Data Processing**: Built a localized, client-side pure JS rule engine (`dataProcessor.js`) that categorizes raw transaction data, extracts derived bank fees (e.g., P8.50 per ATM visit), and strips PII before any data is sent to the AI for analysis.
4. **Frictionless Onboarding & Mock Hydration**: Engineered a secure, local PIN-based authentication layer over Firebase Auth. For new users, the system automatically injects realistic, randomized local transaction data (KFC, Engen, BPC, etc.) to immediately demonstrate the app's core value during hackathon demos.
5. **Robust State Management**: Leveraged React Context and `useReducer` for predictable, unidirectional data flows across the application, managing complex states like goal-tracking metrics and real-time category aggregation.

## 💻 Tech Stack
- **Framework**: Expo SDK 54 (React Native 0.81)
- **Navigation**: Expo Router (File-based Routing)
- **Backend (BaaS)**: Firebase (Authentication & Cloud Firestore)
- **Intelligence**: Groq AI (`llama-3.1-8b-instant`) for real-time recommendations
- **State Management**: React Context API + Custom Hooks
- **Icons & UI**: Material Community Icons / Custom Theme System

## 🚀 How to Get Started

### Prerequisites
- Node.js 20+
- Expo Go app on your iOS/Android device

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/Raymacmillan/smartspend-fnb.git
cd smartspend-fnb

# 2. Install dependencies
npm install