# Kanvas Frontend Client

Next.js 14+ App Router Client for Kanvas, integrating a date-based Kanban board and an interactive polygon image annotator.

---

## 🛠️ Tech Stack & Requirements
*   **Node.js:** v24.13.0+ (standard npm package managers)
*   **Framework:** Next.js 15 (App Router with TS strict mode)
*   **Styling:** Tailwind CSS v4 (Custom color theme in `globals.css`)
*   **State Management:** Zustand (Date selections store)
*   **Auth:** Better Auth (Client-side hook SDK & catch-all handler)
*   **Drag & Drop:** `@dnd-kit/core` & `@dnd-kit/sortable`
*   **Canvas Engine:** `react-konva` & `konva` (SSR dynamic rendering)
*   **Forms & Validation:** `react-hook-form` + `zod`

---

## 🚀 Setup & Execution

### 1. Install Dependencies
From the `Kanvas-Client/` directory:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of `Kanvas-Client/` (already pre-created for this workspace):
```env
BETTER_AUTH_SECRET=a_very_secure_random_string_32_characters_long_kanvas_app
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```
The Next.js client is accessible on `http://localhost:3000`.

---

## 🎨 Design System: "Precision Creative Tool"

We built a custom dark theme design system avoiding generic SaaS defaults:

1.  **Color Palette:**
    *   `--bg-primary`: Deep Obsidian (`hsl(240, 10%, 4%)`)
    *   `--bg-secondary`: Sleek Slate (`hsl(240, 6%, 8%)`)
    *   `--surface`: Dark Card (`hsl(240, 5%, 12%)`)
    *   `--border`: Slate lines (`hsl(240, 5%, 20%)`)
    *   `--accent`: Violet-Indigo (`hsl(250, 89%, 65%)`)
2.  **Typography:**
    *   **Outfit:** Premium geometric display font for title headings and primary controls.
    *   **Inter:** Legible, balanced body font for description cards and task tags.
3.  **Spacings & Curves:** Consistent 4px/8px incremental padding layouts and uniform `8px` (`rounded-lg`) border radius across cards.
4.  **Motion:** Hover-lift card states via transitions, spring translation physics on drags, and custom cubic-bezier animations for modal entrances.

---

## 🧠 Challenges & Solutions

### 1. Next.js SSR Canvas Trap (ReferenceError: window is not defined)
*   **Challenge:** Konva depends on `window` and browser canvas rendering APIs. Importing `react-konva` standard components in Next.js Server Components breaks compilation.
*   **Solution:** We imported the `AnnotationCanvas` component dynamically inside `app/(protected)/annotate/page.tsx` utilizing Next.js `dynamic()` with `{ ssr: false }`, completely preventing server-side pre-render checks.

### 2. Same-Origin Cookie Proxy Handler
*   **Challenge:** Modern browsers restrict third-party HttpOnly cookies due to CORS SameSite policies when making requests across ports (3000 to 8000).
*   **Solution:** We implemented a unified API Proxy Route Handler at `/api/proxy/[...path]/route.ts`. The browser communicates same-origin on port 3000, and the Next.js server proxies the requests to Django on the server side, passing the Better Auth session token seamlessly in headers.
