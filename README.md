Barrier-Free Spatial Data CMS & Interactive Map Platform

This project is an open-source, full-stack Content Management System (CMS) and interactive web platform built on React, TypeScript, and Vite, designed to map, manage, and distribute accessibility data for vulnerable populations.

Instead of remaining a minimal boilerplate, this repository has been engineered into a production-ready infrastructure featuring advanced client-side optimization and dynamic administrator utilities.

✨ Key Architecture & Features

High-Performance Image Optimization: Re-engineered core file processing modules (FestivalEditor and HotspotEditor) from heavy FileReader-based encodings to a lightweight Blob and ObjectURL architecture (createObjectURL / revokeObjectURL), eliminating client-side memory leaks during high-resolution map and hotspot asset uploads.

Live-Synchronized Map Layer: Implements an interactive React-based mapping interface where user session states, filter configurations, and live map camera bounding boxes synchronize dynamically in real-time.

Dynamic Content Management: Features an advanced Admin Dashboard that allows non-technical field coordinators to structure spatial items, log operational data, and toggle UI modal properties without manual code modification.

Production Environment Security: Sensitive third-party credentials (such as map engine keys and Firebase database tokens) are strictly decoupled via client-side environmental variables (process.env).

🛠️ Getting Started

1. Prerequisites & Installation

Clone the repository and install the required workspace dependencies:

git clone https://github.com/jungmin12313/Website.git
cd Website
npm install


2. Environment Variables Setup

Create a .env or .env.local file in your root directory to securely inject your cloud endpoints and map infrastructure tokens:

NEXT_PUBLIC_MAP_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key_here


3. Running Development Environment

To spin up the optimized Vite development server locally with Hot Module Replacement (HMR):

npm run dev


📐 Linting & Code Quality

This repository maintains strict runtime type-safety and code styling. The ESLint configuration has been updated to support type-aware lint rules via @typescript-eslint:

tseslint.configs.recommendedTypeChecked for structural validation.

Integrated eslint-plugin-react-x and eslint-plugin-react-dom to enforce robust React-specific application rendering patterns.

📄 License

This project is licensed under the terms of the MIT License.
