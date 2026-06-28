# Phase 1: Project Setup & Tailwind v4 Configuration

### Step 1: Initialize Next.js 15 Project  
- **Sub-step:** Create a new Next.js App Router project with TypeScript.  
  - **AI Coding Instructions:**  
    1. Run `npx create-next-app@latest council-mvp --typescript --experimental-app` (or equivalent command) to scaffold the project.  
    2. Enable the App Router if not automatic (ensure a `src/app` folder exists).  
    3. Install Tailwind CSS v4: `npm install tailwindcss@latest`.  
    4. Remove any existing `tailwind.config.js` and `postcss.config.js` files (Tailwind v4 uses CSS-first).  
    5. Create a global CSS file at `src/app/globals.css`.  
    6. In `src/app/layout.tsx`, import the global CSS:  
       ```tsx
       import './globals.css';
       ```  
  - **Guardrails:**  
    - Ensure the project uses the **App Router** (no `pages/` folder). All pages live under `src/app/`.  
    - Confirm TypeScript mode; abort if any JavaScript-only boilerplate remains.  
    - Do **not** create a `tailwind.config.js`; instead configure Tailwind via CSS.  
    - Use the **latest stable** versions of Next.js and Tailwind v4.  

### Step 2: Configure Tailwind v4 Using `@theme` CSS  
- **Sub-step:** Set up Tailwind with custom theme variables in `globals.css`.  
  - **AI Coding Instructions:**  
    1. In `src/app/globals.css`, add `@import "tailwindcss";` at the top.  
    2. Define theme variables using the new `@theme` directive. For example:  
       ```css
       @import "tailwindcss";
       @theme {
         /* Color tokens */
         --color-primary: #1a202c;
         --color-secondary: #4a5568;
         --color-accent: #e53e3e;
         /* Font tokens */
         --font-body: Inter, sans-serif;
         --font-heading: "Poppins", sans-serif;
       }
       ```  
    3. These variables create classes like `bg-primary`, `text-secondary`, `font-body`, etc.  
    4. Use these utility classes in your components (e.g., `<div class="bg-primary text-secondary">`).  
  - **Guardrails:**  
    - All theme tokens must be defined within the `@theme { }` block in the global CSS; do not use `:root` for tokens meant to create utilities. This ensures Tailwind generates corresponding utility classes.  
    - Place `@import "tailwindcss";` **before** any `@theme` definitions.  
    - Keep `globals.css` minimal: avoid other styles or layers at this stage.  
    - Use standard CSS syntax for the values (e.g. hex, oklch, etc.). Tailwind will create utilities based on the prefixes (e.g. `--color-*` yields color utilities).  

### Step 3: Tailwind Dark/Light Theme Setup  
- **Sub-step:** Implement a theme switcher (Light/Dark/Sepia).  
  - **AI Coding Instructions:**  
    1. Extend `globals.css` with CSS variables for dark and sepia modes. For example:  
       ```css
       :root {
         --color-background: white;
         --color-text: #1a202c;
       }
       .dark {
         --color-background: #1a202c;
         --color-text: white;
       }
       .sepia {
         --color-background: #f5f0e6;
         --color-text: #3a3a3a;
       }
       @layer base {
         body {
           background-color: var(--color-background);
           color: var(--color-text);
         }
       }
       ```  
    2. In your React components or root layout, add a toggle (e.g., a button) that sets `document.documentElement.classList` to `""` (light), `"dark"`, or `"sepia"`.  
  - **Guardrails:**  
    - Do **not** add dynamic theme logic in tailwind.config (since it is removed); handle theme toggling via CSS classes as shown.  
    - Ensure that the CSS variables for background/text are used in the `@layer base` to style the `<body>` or root element.  
    - Keep color choices restrained (monochromatic with muted accents) to meet design goals.  
    - Tailwind’s `dark:` prefix is replaced with manual `.dark` class usage for this CSS-first approach.  

# Phase 2: Supabase Integration & Authentication

### Step 1: Initialize Supabase and Client  
- **Sub-step:** Set up a Supabase project and connect it to Next.js.  
  - **AI Coding Instructions:**  
    1. In the Supabase dashboard, create a new project. Note the **Project URL** and **anon/public** key.  
    2. In your Next.js app, install Supabase client: `npm install @supabase/supabase-js`.  
    3. Create a file `src/lib/supabaseClient.ts` and initialize the client:  
       ```ts
       import { createClient } from '@supabase/supabase-js';
       export const supabase = createClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
       );
       ```  
    4. Add these keys to your `.env` (via Vercel Env for production):  
       ```
       NEXT_PUBLIC_SUPABASE_URL=your-url
       NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
       ```  
  - **Guardrails:**  
    - Use **only** Supabase (no Firebase).  
    - Do not store service role keys in frontend. Only use anon/public keys on client.  
    - Ensure TypeScript strict mode; add `!` after process.env vars if needed to assert presence.  

### Step 2: Configure Authentication (Email + Anonymous)  
- **Sub-step:** Enable Supabase Auth with email/password and anonymous sign-in.  
  - **AI Coding Instructions:**  
    1. In the Supabase dashboard -> Authentication -> Settings, enable email sign-ups and **Enable Anonymous Users** (if available).  
    2. Create a React Context or hook (`useSupabaseAuth`) to expose `supabase.auth` methods.  
    3. In the `_app.tsx` or root layout, wrap the app with this context provider.  
    4. Implement basic sign-up/sign-in components:  
       ```tsx
       // Example snippet for sign-up form
       const { supabase } = useSupabase();
       const handleEmailSignUp = async (email: string, password: string) => {
         const { error } = await supabase.auth.signUp({ email, password });
         if (error) alert(error.message);
       };
       ```  
    5. Implement anonymous login flow (e.g., a “Continue as Guest” button calling `supabase.auth.signIn({ provider: 'anonymous' })`).  
  - **Guardrails:**  
    - Ensure secure handling of credentials: Do **not** log them.  
    - Use Supabase’s built-in auth flows (do not reinvent).  
    - After any auth action, check for errors and handle them gracefully (toast/UI message).  
    - Maintain user session in Supabase; allow persistence (Supabase does this by default).  

### Step 3: Define User Roles and Judge Access  
- **Sub-step:** Implement a special “Judge” role unlocked by a magic code.  
  - **AI Coding Instructions:**  
    1. In Supabase Auth Settings -> “Configure” -> Custom Claims (or in the database with triggers), define a boolean field `is_judge` on the users table.  
    2. In your login/signup UI, add a field for “Judge Code” (optional). If the user enters the correct code (hardcode for MVP or store in environment), set their `is_judge` to `true`. Example:  
       ```tsx
       const JUDGE_CODE = process.env.NEXT_PUBLIC_JUDGE_CODE;
       if (enteredCode === JUDGE_CODE) {
         await supabase.from('profiles').update({ is_judge: true }).eq('id', user.id);
       }
       ```  
    3. On successful login, fetch user profile; if `is_judge` is true, unlock judge features (e.g., dynamic key inputs, special UI).  
    4. In Supabase Dashboard > Database > Table Editor, add a `profiles` table linked to `auth.users` with columns: `id (uuid)`, `email`, `name`, `is_judge (boolean default false)`, and any other user metadata.  
    5. Alternatively, use a Postgres trigger or Supabase Function to enforce this update on login based on a code.  
  - **Guardrails:**  
    - **Security:** Do not expose the judge code to client code. Fetch it securely (either check code only on server, or compare to an env var on client, but do not commit the code to the repo).  
    - Only authenticated users (including anonymous) can attempt the judge code.  
    - After marking `is_judge`, do not allow unsetting it by the client. This flag should only turn true once.  
    - In the UI, clearly differentiate judge-only features (hide them when `is_judge` is false).  

### Step 4: Design Database Schema in Supabase  
- **Sub-step:** Create tables for profiles, custom personas, transcripts, and debates.  
  - **AI Coding Instructions:**  
    1. In Supabase SQL Editor or Table Editor, create tables:  
       - **`profiles`** (if not existing):  
         | Column      | Type    | Note                           |  
         |-------------|---------|--------------------------------|  
         | id          | uuid    | Primary Key (from auth.users)  |  
         | email       | text    |                                |  
         | name        | text    |                                |  
         | is_judge    | boolean | default false                  |  
       - **`personas`**:  
         | Column           | Type   | Note                             |  
         |------------------|--------|----------------------------------|  
         | id               | uuid   | Primary Key                      |  
         | user_id          | uuid   | Foreign key to profiles(id)      |  
         | name             | text   | Persona name                     |  
         | role             | text   | Persona role/title               |  
         | avatarStyle      | text   | (string) Avatar style description |  
         | personalityTraits| text[] | Array of traits                 |  
         | systemPrompt     | text   | System prompt string             |  
         | primaryBias      | text   | Primary bias description         |  
       - **`transcripts`**:  
         | Column        | Type      | Note                        |  
         |---------------|-----------|-----------------------------|  
         | id            | uuid      | Primary Key                 |  
         | session_id    | uuid      | Unique session identifier   |  
         | user_id       | uuid      | Foreign key to profiles(id) |  
         | created_at    | timestamp | default now()              |  
         | debate_text   | text      | Full debate transcript     |  
         | roadmap       | text      | Synthesized roadmap output  |  
    2. Use Supabase’s SQL editor for any advanced defaults or triggers (e.g. `created_at`).  
  - **Guardrails:**  
    - Use Postgres native types (`text[]`, `timestamp`, etc.) for arrays and dates.  
    - Ensure foreign key constraints (`user_id` references `profiles.id`).  
    - Keep all table names and columns in **lowercase** to avoid case-sensitivity issues.  
    - Do **not** store sensitive keys here (keys should be environment vars).  
    - Plan all DB access through Supabase client methods to keep type-safety in TypeScript.  

# Phase 3: Persona Workshop Feature

### Step 1: Persona JSON Structure  
- **Sub-step:** Enforce the exact persona JSON schema.  
  - **AI Coding Instructions:**  
    1. Define a TypeScript type for Personas in `src/types/persona.ts`:  
       ```ts
       export type Persona = {
         id: string;
         name: string;
         role: string;
         avatarStyle: string;
         personalityTraits: string[];
         systemPrompt: string;
         primaryBias: string;
       };
       ```  
    2. Use this type everywhere a persona object is handled (forms, API calls, config).  
  - **Guardrails:**  
    - The properties must match exactly `{ id, name, role, avatarStyle, personalityTraits, systemPrompt, primaryBias }` with correct types.  
    - `id` should be a `string` (UUID); generate it client-side (e.g. `uuid()` from `nanoid`).  
    - Do not omit any field. All fields are required in the JSON blueprint.  

### Step 2: Persona Workshop UI and Form  
- **Sub-step:** Build a page/modal where the user defines a new persona.  
  - **AI Coding Instructions:**  
    1. Create a client-side React component `PersonaWorkshop.tsx`. Use `'use client';` at the top.  
    2. Add form inputs for all persona fields: name (text), role (text), avatarStyle (select or text), traits (allow multiple text entries or tags), systemPrompt (multiline text), primaryBias (text).  
    3. Add state (use `useState`) for each field, and assemble into a `Persona` object. Generate `id` with `nanoid()` on form submission.  
    4. On submit, validate that all fields are filled. Then **POST** this persona to a Next.js API route (e.g., `/api/personas`) or directly save via Supabase JS:  
       ```tsx
       await supabase.from('personas').insert({ 
         id, user_id: session.user.id, name, role, avatarStyle, personalityTraits, systemPrompt, primaryBias 
       });
       ```  
    5. Display the resulting JSON blueprint on screen for confirmation.  
  - **Guardrails:**  
    - This component must be a **Client Component** (`'use client'`) because it uses `useState` and DOM events.  
    - Ensure the form prevents XSS: sanitize or limit input length if needed.  
    - Validate that `personalityTraits` is an array of non-empty strings.  
    - Do not directly expose Supabase write exceptions; show a user-friendly error (toast) on failure.  
    - Keep the persona structure strictly as typed (no extra props).  

# Phase 4: Pre-built Agent Panels (Presets)

### Step 1: Define Presets Configuration  
- **Sub-step:** Create a constants file with 3 preset panels.  
  - **AI Coding Instructions:**  
    1. In `src/config/presets.ts`, export an object or array of presets. Example structure:  
       ```ts
       import { Persona } from '@/types/persona';

       export const presetPanels: Record<string, Persona[]> = {
         Career: [
           {
             id: 'p1',
             name: 'Career Coach',
             role: 'Career Strategist',
             avatarStyle: 'professional portrait',
             personalityTraits: ['enthusiastic', 'analytical', 'supportive'],
             systemPrompt: 'You are a career strategist focusing on growth ...',
             primaryBias: 'Growth Mindset',
           },
           // ...add 3-4 personas
         ],
         Creator: [ /* ... */ ],
         Ethical: [ /* ... */ ],
       };
       ```  
    2. Populate each panel with 3–4 persona objects matching the **exact structure** (use long descriptive prompts).  
    3. Ensure each persona in presets has a **unique `id` string** (can be static or UUIDs).  
    4. Use these presets in the UI (e.g., a selection dropdown or buttons).  
  - **Guardrails:**  
    - All objects must conform to the `Persona` type exactly (no missing fields).  
    - Do **not** hardcode dynamic runtime logic here; these presets just serve as defaults.  
    - The runtime debate logic should treat preset personas the same way as custom ones. (I.e., the code that orchestrates debates uses the `Persona` objects abstractly.)  

### Step 2: UI for Choosing Presets  
- **Sub-step:** Allow the judge/user to select a pre-built panel.  
  - **AI Coding Instructions:**  
    1. Create a component `PresetSelector.tsx`. Render a list or grid of preset panel names (Career, Creator, Ethical).  
    2. When a preset is selected, load its personas into the debate engine state (without requiring re-entry of API keys).  
    3. Optionally, show a summary (names and roles) of the personas in the panel.  
  - **Guardrails:**  
    - This component can be a Server Component (props-driven) or a Client Component if it uses state. If it fetches data from `presets.ts`, it can even be purely client-side import.  
    - Use Next.js’s App Router patterns: If using server components, pass preset data as props from the parent layout/page.  
    - The logic to launch a debate should work identically regardless of custom or preset personas.  

# Phase 5: Dynamic API Key Management & Routing Dashboard

### Step 1: API Key Input UI (Routing Dashboard)  
- **Sub-step:** Build a settings modal or page for judges to input keys.  
  - **AI Coding Instructions:**  
    1. Create a Client Component `ApiKeyDashboard.tsx`. Include `'use client';`.  
    2. Provide input fields for multiple keys: e.g., “Gemini API Key” and “OpenRouter API Key”.  
    3. Include controls to assign each key to a specific agent slot(s). For example: dropdowns or toggles labeled “Use this key for Agent 1, 2, 3, etc.”.  
    4. Use state (or context) to remember which key is assigned to which agent.  
    5. When the user saves, store this mapping in React state or in local storage (not in the backend for MVP).  
  - **Guardrails:**  
    - This component must be a **Client Component** (it handles user input).  
    - Do **not** send the API keys to Supabase or store them server-side; keep them only in client memory/local storage for this session.  
    - For security, treat these as sensitive: do not log them or display them plainly after input (mask them with `password` inputs).  
    - If user leaves the page and comes back, consider preserving state (e.g., using `useState` with session storage).  

### Step 2: Forwarding Keys to API Calls  
- **Sub-step:** Ensure API requests use the user-provided keys when available.  
  - **AI Coding Instructions:**  
    1. In your frontend code that triggers the debate (e.g., calling `/api/debate`), include the keys in the request. For example, use `fetch('/api/debate', { method: 'POST', headers: { 'x-gemini-key': geminiKey, 'x-openrouter-key': openRouterKey }, body: JSON.stringify(payload) })`.  
    2. In each Next.js API route (Edge runtime), read these headers: e.g.,  
       ```ts
       // In route handler:
       import { NextRequest } from 'next/server';
       export const runtime = 'edge';
       export async function POST(request: NextRequest) {
         const geminiKey = request.headers.get('x-gemini-key') || process.env.GEMINI_KEY;
         // ... use geminiKey for Gemini calls
       }
       ```  
    3. Alternatively, include keys in the JSON body if simpler. Use Next.js Edge `NextRequest` for headers.  
    4. For each agent call, decide which key to use: if an agent is assigned a custom key, use it; otherwise default to server env key.  
  - **Guardrails:**  
    - Always use HTTPS for these fetches (Next.js does by default).  
    - The request handlers must have `export const runtime = 'edge'` (to avoid timeouts).  
    - Do **not** assume headers exist; always fallback to `process.env.*` if header is absent or null.  
    - Do not use `process.env` values directly in client code (only on server side).  
    - Ensure the header names are lowercased and consistent (HTTP headers are case-insensitive, but `headers.get()` is case-sensitive for the code string).  

### Step 3: Key Override and Fallback Logic  
- **Sub-step:** Implement granular override and error handling for keys.  
  - **AI Coding Instructions:**  
    1. In your LLM-calling code (inside the Edge API routes), wrap each fetch to the LLM provider in a `try/catch`.  
    2. If a 401 or 429 error occurs (invalid or rate-limited), catch it and then retry the same call using the default environment key. Example:  
       ```ts
       try {
         const res = await fetch(providerURL, { 
           headers: { 'Authorization': `Bearer ${chosenKey}` }, 
           // ...body, etc.
         });
         if (!res.ok) throw res;
         // use res...
       } catch (err: any) {
         if (err.status === 401 || err.status === 429) {
           // Notify the user (via SSE event or response metadata)
           // Then retry with fallback key
           const resFallback = await fetch(providerURL, { 
             headers: { 'Authorization': `Bearer ${process.env.DEFAULT_KEY}` },
             // ...
           });
           // Use resFallback...
         } else {
           throw err;
         }
       }
       ```  
    3. Emit a client-side toast (or console.warn) when falling back, to inform the user gracefully. You can push a special SSE event like `event: error` or return a JSON `{ fallback: true }`.  
    4. Only override the specific call that failed; do not override other agent calls that were successful.  
  - **Guardrails:**  
    - Do **not** crash the debate if a key fails; always attempt fallback.  
    - Be careful with error objects: Next.js Edge `fetch` may throw a `Response` object; check `err.status` accordingly.  
    - Do not echo the invalid key back to the client. Sanitize any logs.  
    - Ensure retries with fallback also obey rate limits (e.g., avoid infinite loops on repeated failure).  

# Phase 6: Debate Arena Implementation

### Step 1: Debate API Route (Edge Runtime)  
- **Sub-step:** Create an API route to run the multi-agent debate.  
  - **AI Coding Instructions:**  
    1. Under `src/app/api/`, create a new folder (e.g., `debate/route.ts`). Include:  
       ```ts
       export const runtime = 'edge';   // Use Edge runtime for unlimited request duration  
       export const revalidate = 0;      // Force dynamic  
       export async function POST(req: NextRequest) { /* ... */ }
       ```  
    2. Parse the incoming JSON: user prompt and personas. Determine which provider and key to use per agent based on earlier logic.  
    3. Implement the sequential loop: call Agent 1 with the user prompt, stream its answer to the client (SSE, see below), then feed Agent 1’s response into Agent 2 prompt, etc.  
    4. Use `await fetch()` to call LLM APIs (Gemini via Google API, others via OpenRouter endpoints), including streaming if supported.  
    5. After each agent answer, append to a server-side transcript string. After the last agent, write the full transcript to Supabase (see next step).  
  - **Guardrails:**  
    - This route must set `export const runtime = 'edge'` to bypass Vercel’s default 15s Node limit.  
    - Use `export const dynamic = 'force-dynamic'` if needed to disable any caching.  
    - When reading `req.json()`, use `await req.json()` (Edge requires async).  
    - Structure the route logic so that each agent’s call is awaited in sequence (not parallel) to preserve order.  
    - Handle streaming carefully: you’ll likely use `new Response(stream, { headers: SSE headers })` (see below).  

### Step 2: Streaming Responses to Client (SSE)  
- **Sub-step:** Stream agent dialogue back to the client in real-time.  
  - **AI Coding Instructions:**  
    1. In the API route, use Server-Sent Events (text/event-stream) to push updates. Example:  
       ```ts
       const encoder = new TextEncoder();
       const stream = new ReadableStream({
         async start(controller) {
           // After calling each agent:
           controller.enqueue(encoder.encode(`data: ${agentName}: ${agentResponse}\n\n`));
           // Continue for next agent...
           controller.enqueue(encoder.encode("event: done\n\n")); // when finished
           controller.close();
         },
       });
       return new Response(stream, {
         status: 200,
         headers: {
           'Content-Type': 'text/event-stream; charset=utf-8',
           'Cache-Control': 'no-cache, no-transform',
           Connection: 'keep-alive',
         },
       });
       ```  
    2. Ensure after each `fetch` to an LLM, you parse the streamed chunks and enqueue them to the SSE stream as they arrive (do not wait for full completion).  
    3. On the client, use an `EventSource` or SSE hook to receive and display each message instantly.  
  - **Guardrails:**  
    - Set headers exactly as SSE requires: `Content-Type: text/event-stream`, and `Cache-Control: no-cache, no-transform`.  
    - Use `ReadableStream` as shown; do **not** buffer the entire response before streaming.  
    - Include `Connection: keep-alive` header.  
    - The stream controller must `close()` only after all agents have finished.  
    - Prefix data with `data:` and separate SSE events properly (two newlines).  

### Step 3: Saving Debate Transcript to Supabase  
- **Sub-step:** After all agents have spoken, persist the transcript.  
  - **AI Coding Instructions:**  
    1. In the debate route (after the last agent finishes), compile the full transcript string.  
    2. Use the Supabase client (Edge function can use `@supabase/supabase-js` with service role key via `createClient` if needed) to insert a new row in `transcripts`:  
       ```ts
       await supabase
         .from('transcripts')
         .insert([{ session_id, user_id, debate_text: fullTranscript }]);
       ```  
    3. Generate a unique `session_id` for each debate (could be a UUID generated by the server). Return or embed this session_id in the SSE stream so the client knows where to save it.  
  - **Guardrails:**  
    - The Insert call should use `await` and catch any errors silently (the debate UX should not break if save fails).  
    - Use a server-side Supabase service key **not exposed to client** if needed (store in env). But for MVP, the anon key might suffice if RLS allows it.  
    - Ensure `user_id` is taken from the authenticated user’s session (verify auth context or token).  
    - Do not store transcripts on the client; only send them through SSE to the UI.  

# Phase 7: Lead Synthesizer Integration

### Step 1: Invoke Synthesizer After Debate  
- **Sub-step:** Automatically trigger the Lead Synthesizer once the debate completes.  
  - **AI Coding Instructions:**  
    1. After writing the full transcript to Supabase, continue in the same Edge route (or call a separate `/api/synthesize` route).  
    2. The Synthesizer route should be Edge runtime and use SSE streaming like the debate route.  
    3. In the Synthesizer logic, load the saved transcript (or use the local variable if still in memory) and send it to the LLM (Gemini or OpenRouter) with a prompt like: “Given the above discussion, produce a concrete roadmap.”  
    4. Stream the Synthesizer’s output chunks back to the client via SSE (same pattern as debate).  
    5. Once complete, append this roadmap to the `transcripts` table under `roadmap`.  
  - **Guardrails:**  
    - Ensure this route also has `export const runtime = 'edge'` and correct SSE headers (like in the debate route).  
    - The client should distinguish between agent SSE messages and synthesizer SSE messages (e.g., subscribe to different `/api` endpoint or include event type).  
    - Do not drop the client connection between debate and synthesizer; either make separate requests or indicate sequencing on client side.  
    - The synthesizer must stream; do **not** wait for the full roadmap string before sending.  

### Step 2: Retain Chat Context with Synthesizer  
- **Sub-step:** Allow users to ask follow-ups after the roadmap is generated.  
  - **AI Coding Instructions:**  
    1. After the roadmap is streamed, keep the chat interface open. The user can type follow-up questions to the Lead Synthesizer.  
    2. Treat the synthesizer interaction as a normal chat: each question and answer is appended to the `transcripts.roadmap` as continuation.  
    3. Use the full prior transcript (debate + roadmap + follow-ups) as context for any additional LLM calls to the synthesizer.  
  - **Guardrails:**  
    - Maintain the UI state so that the entire debate transcript and roadmap are visible during follow-ups.  
    - Each additional query to the synthesizer can either be handled client-side (append events) or by reusing the same SSE connection if still open.  
    - Ensure you mark in Supabase which part of transcript is debate vs. roadmap vs. extended chat.  

# Phase 8: UI/UX Design & Animations

### Step 1: Responsive Layout with Tailwind v4  
- **Sub-step:** Ensure all pages/components are fully responsive.  
  - **AI Coding Instructions:**  
    1. Use Tailwind’s responsive utility classes (`sm:`, `md:`, `lg:`, etc.) to adapt layouts. For example:  
       ```html
       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
         <!-- columns stack on small, side-by-side on medium+ -->
       </div>
       ```  
    2. Test key views on mobile, tablet, and desktop widths to ensure no overflow or layout breaking.  
  - **Guardrails:**  
    - Do not assume any fixed widths; use flex or grid with breakpoints.  
    - Avoid horizontal scrollbars; prefer stacking or overflowing content gracefully.  
    - For text and images, use `max-w-full` and `h-auto` to adapt.  
    - Keep button sizes tappable on mobile (at least 44x44 pixels recommended).  

### Step 2: Framer Motion for Page Transitions & Layout Animations  
- **Sub-step:** Integrate Framer Motion for high-level UI animations.  
  - **AI Coding Instructions:**  
    1. Install Framer Motion: `npm install framer-motion`.  
    2. In `app/layout.tsx`, wrap the `<html>` or main layout with `<AnimatePresence>` to animate route changes. Example:  
       ```tsx
       import { AnimatePresence, motion } from 'framer-motion';
       export default function RootLayout({ children }) {
         return (
           <html><body>
             <AnimatePresence mode="wait">
               <motion.div
                 key={router.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 {children}
               </motion.div>
             </AnimatePresence>
           </body></html>
         );
       }
       ```  
    3. Use Framer Motion’s `motion.*` components for UI elements that mount/unmount or change layout (e.g., modals, panel switches).  
  - **Guardrails:**  
    - Only animate **layout/mount transitions** with Framer. Do not use it for per-character text animation (that’s GSAP).  
    - Use React keys properly to ensure `<AnimatePresence>` works as intended (unique key per route).  
    - Respect accessibility: do not animate too rapidly or in a way that causes motion sickness. Keep duration ~200–300ms.  
    - Declare `'use client'` for components that use Framer’s hooks or components.  

### Step 3: GSAP for Typography and Micro-animations  
- **Sub-step:** Use GSAP timelines for text reveals and micro-interactions.  
  - **AI Coding Instructions:**  
    1. Install GSAP: `npm install gsap`.  
    2. In components where sequential text animation is needed (e.g., revealing agent’s response, headings), initiate GSAP in a `useEffect`. For example:  
       ```tsx
       import { gsap } from 'gsap';
       useEffect(() => {
         const ctx = gsap.context(() => {
           gsap.from('.agent-response', {
             duration: 0.5,
             opacity: 0,
             y: 20,
             stagger: 0.1,
           });
         });
         return () => ctx.revert();
       }, []);
       ```  
    3. For complex sequences (like multi-line reveals during debate), use a `gsap.timeline()` to stagger in phrases or words for emphasis.  
    4. If combining with Framer Motion, use Framer to animate container changes and GSAP for inner text. For example, a parent `motion.div` handles fade-in, then GSAP staggers the text inside.  
  - **Guardrails:**  
    - Wrap GSAP calls in `useEffect` or `useLayoutEffect` to ensure elements exist.  
    - Use `gsap.context()` when in React to ensure cleanup (as shown).  
    - Do **not** use GSAP to animate layout properties (like flex changes) – reserve that for Framer. Keep GSAP focused on transforms/opacity of individual elements.  
    - Avoid conflicts: when a component re-renders, either guard GSAP to not re-run or clean up previous timelines.  
    - **Example Integration:** See Richard Shackleton’s article where `useMotionValue` and `gsap.timeline` share a progress value for complex scroll-based animations. Use this pattern if syncing motion values between Framer and GSAP.  

### Step 4: Polished UI Details  
- **Sub-step:** Apply minimalist, “quiet luxury” styling.  
  - **AI Coding Instructions:**  
    1. Define a restrained color palette in your `@theme` (e.g., muted grays and one accent). Use Tailwind’s utility classes and custom theme tokens.  
    2. Use clean, spacious font sizes (e.g., `text-base`, `text-lg`) and plenty of padding/margin to create whitespace.  
    3. For dark/light mode, ensure contrast meets accessibility.  
    4. Animate subtle micro-interactions: button hover states, loading spinners, etc., using Framer Motion or CSS transitions.  
  - **Guardrails:**  
    - Avoid loud gradients or heavy neon colors; stick to neutral tones.  
    - Limit the number of colors – ideally <5 distinct hues.  
    - Focus on typography: choose 1-2 web fonts (Tailwind’s default plus one premium font like Poppins for headers).  
    - Ensure text remains legible at all sizes and on all backgrounds.  

# Phase 9: Testing, Deployment, & Optimization

### Step 1: Skip Automated Tests for MVP  
- **Sub-step:** Rely on type-safety instead.  
  - **AI Coding Instructions:**  
    1. Omit Jest or other test suite setup to save time.  
    2. Rigorously use TypeScript interfaces and types; enable `"strict": true` in `tsconfig.json`.  
    3. Manually test all flows in the browser (simulate judge vs user).  
  - **Guardrails:**  
    - Enforce all API and component boundaries with explicit types (props, responses).  
    - Use exceptions (try/catch) where necessary to catch runtime issues.  
    - During code generation, guard LLMs to produce types, e.g., instruct LLM to include TypeScript types in output.  

### Step 2: Deployment on Vercel  
- **Sub-step:** Prepare for Vercel environment.  
  - **AI Coding Instructions:**  
    1. Set Vercel project environment variables for:  
       ```
       SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
       GEMINI_KEY, OPENROUTER_KEY, JUDGE_CODE, NEXT_PUBLIC_BASE_URL (if needed)
       ```  
    2. In `next.config.js`, ensure no experimental SSR caching is enabled that would conflict with Edge.  
    3. Add `"vercel-build": "next build"` to `package.json` scripts if needed.  
    4. Push code to GitHub and import to Vercel.  
  - **Guardrails:**  
    - Do not commit any secret keys to the repo (use `.env.local` for dev).  
    - For Edge Routes, Vercel automatically uses the Edge environment; ensure no Node-only code leaks in (e.g., avoid using modules not supported in the Edge runtime).  
    - Confirm that `process.env.*` access is only on server-side code (Edge routes, not in client).  

### Step 3: Basic Performance Considerations  
- **Sub-step:** Monitor and optimize critical flows.  
  - **AI Coding Instructions:**  
    1. Since one debate per tab is required, manage concurrency by disabling the “Start Debate” button until the previous debate finishes or is cancelled.  
    2. Leverage streaming to keep the UI responsive (users see answers as they come, even if network is slow).  
    3. Consider using Next.js cache invalidation or revalidation rules (`dynamic: 'force-dynamic'`) on critical routes.  
  - **Guardrails:**  
    - Do not spawn multiple simultaneous debate loops; limit each client session to one at a time.  
    - Handle slow network gracefully: show spinners or “Agent X is thinking…” messages.  
    - Ensure that memory usage is bounded: do not store full transcripts on the server for longer than needed beyond saving to DB.  
    - Avoid recursive calls or infinite loops in the route handlers.  

# References & Supporting Research

- Tailwind v4’s CSS-First theming: Use `@import "tailwindcss"; @theme { ... }` in a global CSS file for tokens.  
- Forwarding dynamic API keys via headers and using `headers()` in Next.js Edge routes.  
- Edge runtime and SSE streaming pattern (must add Edge runtime to avoid 15s limit) and SSE headers (`Cache-Control: no-cache, Content-Type: text/event-stream`).  
- Framer Motion + GSAP integration strategy: use Framer for layout and GSAP timelines for text, syncing via `useMotionValue`.  

