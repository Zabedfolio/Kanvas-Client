# Kanvas Build Process & Roadmap

This file tracks the build progress of the Kanvas application.

---

## 📅 Roadmap Overview

### Phase 1: Database & Custom Authentication Setup
- [ ] Initialize Django Project & Apps (`users`, `tasks`, `annotations`).
- [ ] Setup Next.js 14 project in `frontend/` with TypeScript, Tailwind, Zustand, and Better Auth.
- [ ] Map custom Django models in `users/models.py` to Better Auth's database tables.
- [ ] Implement `BetterAuthDRFAuthentication` class in Django to read the session cookies and authenticate requests.
- [ ] Enable SQLite Write-Ahead Logging (WAL) in both Next.js and Django settings to support concurrent access.
- [ ] Write a Django management command (`seed_user`) to create a demo user with a pre-hashed bcrypt password.

### Phase 2: Backend Development (API App)
- [ ] Define `Task` and `Tag` models in `tasks/models.py`.
- [ ] Create serializers, ViewSets, and URL routing for Tasks & Tags. Ensure requests filter data strictly by `request.user` and date parameters.
- [ ] Define `AnnotationImage` and `Polygon` models in `annotations/models.py` (with JSONField for points coordinates).
- [ ] Implement views for multipart image upload, polygon addition, polygon list for an image, and polygon deletion.

### Phase 3: Frontend Foundations & Design Tokens
- [ ] Build global CSS variables in `globals.css` with the custom dark theme system.
- [ ] Set up Outfit and Inter font loader in `layout.tsx`.
- [ ] Configure Zustand UI store (`useDateStore`) for selected date.
- [ ] Configure Better Auth client SDK (`lib/auth-client.ts`) and Axios/Fetch client with automatic token-passing headers.

### Phase 4: Shared Navigation & Layout
- [ ] Create `AppShell` with persistent left-hand sidebar navigation, active page highlights, and user logout button.
- [ ] Develop `DateSelector` - a fully modular, horizontally scrollable day-strip selector showing a 2-week window, complete with active date and "today" indicator.

### Phase 5: Kanban Task Management Page (/tasks)
- [ ] Construct the core `<Board />` component handling date filtering and Zustand syncing.
- [ ] Construct the `<Column />` droppable container using `@dnd-kit/core` and `@dnd-kit/sortable`.
- [ ] Construct the `<TaskCard />` presentational draggable card displaying priority indicator, tags, due date, and hover-lift transition.
- [ ] Build `<TaskModal />` using `react-hook-form` + `zod` for validating task creation and edit states.
- [ ] Connect drag-and-drop status changes to optimistic backend updates with rollback capabilities.

### Phase 6: Polygon Annotation Page (/annotate)
- [ ] Build `<ImageUploader />` component handling drag-and-drop uploads and indicating progress.
- [ ] Build `<ImageFilmstrip />` component showing thumbnails of uploaded files and handling image selection.
- [ ] Integrate `react-konva` (or direct HTML5 Canvas fallback) in `<AnnotationCanvas />` to support scaling, responsive background fitting, point placement, closed-loop polygon styling, hovering, and selection.
- [ ] Create the floating `<AnnotationToolbar />` supporting tools: Draw Mode, Move Mode, Delete Shape, Clear Canvas, and Auto-Save notifications.

### Phase 7: Verification, Refinement & Final READMEs
- [ ] Test the entire build pipeline for both frontend and backend.
- [ ] Run functional test assertions (Auth protection redirects, drag-and-drop persistence, multi-vertex coordinate accuracy).
- [ ] Create clean documentation `README.md` files for both folders detailing configuration parameters, dependencies, and swap guides (SQLite to Postgres).
- [ ] Record final walkthrough animation/video showing layout, transitions, and usage.
