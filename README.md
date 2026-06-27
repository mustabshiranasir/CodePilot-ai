# CodePilot AI

Automated code analysis platform with real-time scanning, team collaboration, and AI-powered fix recommendations.

## Features

- **Smart Scanning** — 11+ scanners detect code quality, security, performance, and architecture issues
- **AI Analysis** — automatic root cause identification, explanations, and fix recommendations
- **Team Isolation** — passcode-based team scoping; admins manage membership and roles
- **Real-Time Updates** — live dashboards via Supabase subscriptions for scans, issues, and activity
- **Upload Any Code** — ZIP file upload or GitHub URL fetch
- **Team Metrics** — per-developer performance tracking and project analytics

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| Email | SMTP2GO (via Edge Function) |
| Scan Engine | Custom AST parsing and pattern matching |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (linked)

### Setup

```bash
npm install
npm run dev
```

### Environment Variables (`.env`)

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database

Run `supabase/migrations/00001_codepilot.sql` in your Supabase SQL Editor.

### Edge Function (Email Invites)

```bash
supabase functions deploy send-invite --no-verify-jwt
supabase secrets set SMTP2GO_API_KEY=your_key FROM_EMAIL=sender@yourdomain.com
```

## Project Structure

```
src/
├── components/ui/       # Reusable UI components (Card, Badge, Modal, etc.)
├── contexts/            # Auth, Theme, Data contexts
├── lib/services/        # Supabase service layer (scans, issues, team, etc.)
├── lib/                 # scanEngine, supabase client, utils
└── pages/               # Dashboard, Projects, Team, Analytics, Settings, etc.
```

## Build

```bash
npm run build    # tsc -b && vite build
```
