# PROJECT CONTEXT

## Overview
**EasyConstruct** (formerly RaaP Modular) is a Local Construction Pricing Tool / Cost Estimator web application for Hilton-style modular building projects. It provides interactive cost analysis, scenario comparison, and location-based pricing.

## Project Structure
```
Hilton/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI components (hilton/, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities, API clients
│   │   └── tests/       # Vitest test files
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Entry point
│   ├── routes.ts        # API routes
│   └── seeds/           # Data seeding scripts
├── shared/              # Shared types/utilities
└── attached_assets/     # Static assets, images
```

## Key Features
- **Cost Estimator**: Multi-scenario cost comparison (Scenario A/B)
- **Location Pricing**: Google Maps integration with city-based cost modifiers
- **Interactive Inputs**: Sliders, dropdowns for building parameters
- **PDF Export**: Cost breakdown report generation
- **Mobile Responsive**: Optimized for desktop and mobile

## Data Sources
- **Supabase**: PostgreSQL database for cities, cost constants
- **CSV Files**: `Hilton Cost.csv`, `zip.csv` for baseline data

## Current State
- Dev server runs on port 8080 (`npm run dev`)
- Tests use Vitest (`npm run test`)
- Build outputs to `dist/` for production
