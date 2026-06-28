# Council: The AI Debate Arena 🎙️🤖

Council is an immersive, high-fidelity AI-on-AI debate arena where custom-tailored AI personas clash in structured debates, moderated by AI judges and summarized for human insights. Built using **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Framer Motion**, and **Supabase (with PKCE flow)**.

---

## ✨ Implemented Core Features

### 🎨 Phase 1: Project Architecture & Quiet Luxury Design System
- **Tailwind CSS v4 Integration**: Utilizes the modern CSS-first `@theme` configuration within `globals.css` (bypassing legacy JavaScript configs).
- **Theming System**: Offers Light (pure white/soft shadow), Dark (midnight charcoal/pitch black), and Nord (slate blue/cyan glow) themes powered by `next-themes`.
- **Dynamic CSS Variables**: Fluid background, card, and input styles mapped directly to design tokens.

### 🔐 Phase 2: Supabase Integration & Secure PKCE Authentication
- **Secure SSR Client Helpers**: Cookie-based authentication built on top of `@supabase/ssr`.
- **Next.js 16 Edge Proxy (Middleware)**: Global request interception (`src/proxy.ts`) to automatically refresh expired user sessions.
- **Watertight RLS & Database Schema**: Complete Postgres structure ([`supabase-setup.sql`](supabase-setup.sql)) for `profiles`, `personas`, and `transcripts` secured with Row Level Security.
- **Server-Side Privilege Escalation**: Secure server action (`verifyJudgeCodeAction`) validating secret passcode credentials on Node.js to promote users to `is_judge = true` using an admin client.
- **Prevent Duplicate Registrations**: Short-circuits registration attempts for emails that already hold a database profile, redirecting the user to sign in and triggering warning shakes.

### 🎬 Premium Motion Design & Micro-Interactions
- **Interactive Icon Validation**: Icons spring to life, bouncing (`scale: [1, 1.25, 1]` via tween keyframes) and transitioning to accent colors in real-time as soon as inputs meet email, name, or password validation criteria.
- **Verification Lockout State**: Submitting a magic link/registration locks the forms, replacing them with a dedicated `VerificationCard` that emits concentric wave pulses while waiting for the email token click.
- **Interactive Callback Morphing**: Clicking the verification link in an email opens `/auth/callback` which mounts `AuthorizingCard` with a 2-second wave delay (to avoid flashing), before morphing into `SuccessCard` with a drawing SVG checkmark.
- **Circular Progress Timer**: The callback success page displays a rotating circular SVG timer ring that drains over 4 seconds before triggering `window.close()`.
- **Cross-Tab Synchronization**: The main tab automatically detects when authorization completes in the callback tab, triggering success checkmarks and sliding open the Dashboard.
- **Staggered Dashboard Grid**: The *Status Monitor* slides in from the left and the *Action Terminal* slides in from the right using opposing spring offsets.

---

## 🔮 Coming Soon (Next Phases)

Based on our architectural research and roadmap, the upcoming phases will cover:

### 🎭 Phase 3: Persona Synthesizer Workshop & Debate Arena
- **Persona Builder**: Intuitive sliders and prompt customizers for AI debaters (defining roles, personality traits, system prompts, and primary biases).
- **Debate Synthesizer**: A real-time arena where two custom AI personas engage in arguments, outputting speech bubbles dynamically.
- **Debate Arbitration**: AI Judge engine analyzing argument validity, grading debater stances, and publishing verdicts.
- **Transcript Viewer**: Immersive timeline to replay past debates and view AI-generated summary roadmaps.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.x or newer)
- Supabase account (configured with Auth, Tables, and RLS)

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JUDGE_CODE=your-secret-escalation-code
```

### 3. Database Initialization
Run the schema inside [`supabase-setup.sql`](supabase-setup.sql) in your Supabase SQL editor to create the required tables, triggers, and RLS policies.

### 4. Installation & Development
Install dependencies:
```bash
npm install
```

Start the Turbopack development server:
```bash
npm run dev
```

Build the application for production:
```bash
npm run build
```

---

## 🛠️ Technology Stack
- **Framework**: [Next.js 16](https://nextjs.org) (App Router, TS, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (CSS-first `@theme` configuration)
- **Animation**: [Framer Motion 12](https://motion.dev) & [GSAP 3](https://gsap.com)
- **Backend**: [Supabase](https://supabase.com) (Auth, PostgREST database, RLS)
- **Icons**: [Lucide React](https://lucide.dev)
