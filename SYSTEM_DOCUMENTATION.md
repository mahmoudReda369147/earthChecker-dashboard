# EarthChecker / Feedbrush — System & Architecture Documentation

## Executive Summary

**Feedbrush (EarthChecker)** is an AI-powered visual quality control and industrial inspection platform. It allows manufacturing and quality management teams to define inspection **Modules**, create structured multi-stage **Forms**, configure specialized **AI Inspection Agents** (powered by Gemini AI), assign **Staff** (CEOs, Supervisors, Workers), and execute sequential **Inspection Cycles**. 

When inspectors submit images during a cycle stage, assigned AI agents evaluate the images in real time against strict quality control prompts and tolerance criteria, returning `PASS`/`FAIL` verdicts, confidence scores, and detailed failure explanations.

---

## Technical Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend API** | Node.js, Express.js, MongoDB (Mongoose ORM), CommonJS |
| **Authentication** | JWT (Access Token in `localStorage`, Refresh Token in `httpOnly` cookie), bcryptjs |
| **AI Integration** | `@google/generative-ai` (Google Gemini AI Vision) |
| **File Storage** | Cloudinary CDN (via Multer memory storage) |
| **Email Service** | Nodemailer (Gmail App Passwords) |
| **Documentation & Security** | Swagger UI (`/api/docs`), Helmet, CORS, Express Rate Limit |
| **Frontend App** | React 18, Vite, React Router v6, React Query (TanStack Query v5), Axios |
| **Styling** | Custom Tailwind CSS, CSS variables, Glassmorphism design system |

---

## 1. Status Overview: What's Working vs. What's Not Working

### ✅ Fully Working & Implemented Features

1. **Authentication & Session Management (`/api/auth`)**
   - User Registration (Auto-creates Company and CEO role).
   - Email Verification using signed, tamper-proof JWT tokens.
   - Secure Login with 15-min Access Tokens & 7-day Refresh Tokens stored in `httpOnly` path-locked cookies.
   - Automatic token rotation & reuse detection (instantly revokes all active sessions if token reuse is detected).
   - Password reset workflow via SHA-256 tokens sent via Gmail/Nodemailer.
   - Full Role-Based Access Control (RBAC): `ceo`, `supervisor`, `worker`.

2. **Module Management (`/api/modules`)**
   - Full CRUD operations with title, description, and Cloudinary cover images.
   - Paginated listing, keyword searching, and soft-delete audit logging.

3. **Form Builder & Stage Reordering (`/api/forms`)**
   - Form creation within modules, support for custom field types (text, number, select, image, toggle, date, etc.).
   - Section-level AI Agent assignment (linking image fields to specific AI agents).
   - Sequential form ordering & drag-and-drop / index reordering (`/api/forms/reorder`).

4. **Staff & Team Management (`/api/staff`)**
   - Team member creation with direct activation (skips email verification for admin-created staff).
   - Role hierarchy enforcement (users cannot create/edit staff with authority equal to or higher than their own).
   - Staff listing, role updates, and account deactivation.

5. **AI Inspection Agents (`/api/agents`)**
   - Agent creation with custom system prompts, tolerance strictness rating (0–100), and state reference images (default, pass, fail, thinking).
   - Aggregate statistics computation (total analyses, pass/fail counts, like/dislike feedback).

6. **Inspection Cycles & Sequential Stage Gating (`/api/cycles` & `/api/stages`)**
   - Creation of inspection cycles assigned to specific modules, supervisors, and workers.
   - Automatic generation of sequential stage records from module forms.
   - **Sequential Stage Gating**: Stage 1 starts `available`, while Stage 2+ are `locked`. Submitting Stage 1 automatically unlocks Stage 2.
   - Lifecycle state machine: `new` ➔ `inProgress` ➔ `paused` ➔ `cancelledRequest` ➔ `cancelled` / `completed`.

7. **Form Submissions & Real-Time AI Analysis (`/api/submissions` & `/api/analyses`)**
   - Submission of form answers for active stages.
   - Automatic interception of image fields with assigned AI Agents.
   - Real-time image fetching and base64 encoding sent to Gemini AI.
   - Evaluation against strict prompt criteria and tolerance thresholds.
   - Rating system (`like`/`dislike`) for user feedback on AI decisions.

8. **Media Upload Utility (`/api/upload/image`)**
   - Memory-buffered Multer middleware pushing images directly to Cloudinary CDN and returning secure HTTPS URLs.

---

### ⚠️ What Is NOT Working / Missing Features & Technical Debt

1. **Overview Dashboard Page Uses Static Mock Data**
   - **Location**: `src/features/overview/pages/OverviewPage.jsx`
   - **Issue**: Displays hardcoded static data for KPIs (`12,480 total inspections`, `94.2% acceptance rate`), Recent Cycles, and AI Feed.
   - **Root Cause**: `src/features/overview/services.js` contains `// TODO: add Overview service functions`. No backend aggregate metrics endpoint exists yet (e.g. `/api/overview/stats`).

2. **Settings Page Is Unconnected to Backend**
   - **Location**: `src/features/settings/pages/SettingsPage.jsx`
   - **Issue**: Organization details, AI thresholds, Notifications, API keys, and Danger Zone settings use local React state (`useState`) without persisting changes.
   - **Root Cause**: `src/features/settings/services.js` has `// TODO: add Settings service functions`. No backend routes exist for managing organization settings or rotating API keys.

3. **Hardcoded Gemini API Key & Model Version in Code**
   - **Location**: `backend/utils/geminiAgent.js`
   - **Issue**: Line 3 has a hardcoded API key string fallback (`AIzaSyDf...`) instead of exclusively using `process.env.GEMINI_API_KEY`.
   - **Issue**: Line 41 references `gemini-2.5-flash`. Standard Gemini Flash model identifiers are `gemini-1.5-flash` or `gemini-2.0-flash`, which may cause API errors if `2.5` is not supported in the user's region/tier.

4. **Dead AWS S3 Dependencies & Unused Config**
   - **Location**: `package.json`, `.env` (root)
   - **Issue**: `@aws-sdk/client-s3` is listed as a dependency, and AWS S3 credentials are defined in root `.env`, but S3 code is completely unused. Image uploads go through Cloudinary.

5. **Pagination Bug in `useFormsInfinite` Hook**
   - **Location**: `src/features/forms/apiHooks.js`
   - **Issue**: Line 30 checks `lastPage?.data?.pagination?.pages`, whereas the backend returns `totalPages` (`p.totalPages`). This breaks infinite pagination if used.

6. **Disabled Auth Endpoint Rate Limiting**
   - **Location**: `backend/server.js`
   - **Issue**: Lines 62–68 (`authLimiter`) are commented out, relying solely on the standard global limit of 100 requests per 15 minutes.

7. **Standalone `earthchecker-app-landing` Directory**
   - **Location**: `earthchecker-app-landing/`
   - **Issue**: Contains an isolated sub-project/landing page that is unlinked to the main dashboard build system.

---

## 2. Core Application Flows

### Flow 1: User Onboarding & Authentication
```
[Sign Up] ──► Create Company & User (CEO) ──► Send Verification Email (JWT)
                                                     │
[Sign In] ◄── Verify Email Link (Front-end) ◄───────┘
   │
   ├── Issue Access Token (15m, localStorage)
   └── Issue Refresh Token (7d, httpOnly cookie)
```

### Flow 2: Quality Control Setup (CEO)
```
1. Create Module ──► 2. Create Forms & Fields ──► 3. Create AI Agent (Prompt + Tolerance)
                           │                                  │
                           └────── Link Agent to Image Field ──┘
```

### Flow 3: Inspection Cycle Lifecycle & Stage Gating
```
1. CEO/Supervisor creates Cycle linked to Module & assigns Worker.
2. Backend auto-creates Stages corresponding to Module Forms.
3. Stage 1 set to 'available', Stage 2+ set to 'locked'.
4. Worker fills Stage 1 Form ──► Submit ──► Stage 1 marked 'submitted'.
5. Backend unlocks Stage 2 ('available').
6. When final Stage is submitted ──► Cycle marked 'completed' (100% progress).
```

### Flow 4: Automated AI Vision Inspection Flow
```
Worker Submits Stage Form (with image URL + assigned Bot ID)
              │
              ▼
Backend submissionController intercepts image answer
              │
              ▼
Fetch image & query Gemini AI (`geminiAgent.js`) using Agent's prompt & tolerance
              │
              ▼
Gemini evaluates image ──► returns JSON { result: "pass"|"fail", reason, confidence }
              │
              ▼
Save record in Analysis collection ──► Return result to UI
```

---

## 3. Database Schema Overview

| Model | Key Fields | Description |
| :--- | :--- | :--- |
| **User** | `name`, `email`, `password`, `role` (`ceo` \| `supervisor` \| `worker`), `company`, `isEmailVerified`, `isActive` | User accounts and RBAC roles |
| **Company** | `name`, `ceo` | Multi-tenant organization container |
| **Module** | `title`, `description`, `image`, `companyId`, `creatorId`, `isDeleted` | Quality inspection module groupings |
| **Form** | `name`, `description`, `moduleId`, `order`, `sections` (with `assignedBotId`), `companyId` | Dynamic inspection forms |
| **Agent** | `name`, `description`, `userPrompt`, `tolerance` (0–100), `image`, `passImage`, `failImage`, `like`, `dislike` | AI visual inspection agents |
| **Cycle** | `cycleId`, `name`, `moduleId`, `assignedSupervisor`, `assignedWorker`, `status`, `progress` | Execution runs of a quality inspection |
| **Stage** | `cycleId`, `formId`, `order`, `status` (`locked` \| `available` \| `submitted`), `submissionId` | Individual step progression in a cycle |
| **Submission** | `cycleId`, `formId`, `moduleId`, `submittedBy`, `answers` | Worker submitted form responses |
| **Analysis** | `submissionId`, `agentId`, `fieldId`, `imageUrls`, `aiResult` (`result`, `reason`, `confidence`), `userRating` | Gemini AI evaluation results |

---

## 4. Recommendations for Improvements

1. **Implement Overview Analytics Endpoint**:
   - Create `GET /api/overview/stats` in backend to compute real KPIs (total inspections, acceptance rate, failure flags, active cycles) dynamically from `Submissions`, `Analyses`, and `Cycles`.
2. **Implement Settings Persistence Endpoint**:
   - Create `PATCH /api/company/settings` to store company preferences, timezone, AI default thresholds, and notification settings.
3. **Clean Up Environment Variables & Gemini Config**:
   - Update `geminiAgent.js` to strictly use `process.env.GEMINI_API_KEY`.
   - Update model name to `gemini-1.5-flash` or `gemini-2.0-flash`.
4. **Fix `useFormsInfinite` Pagination Property**:
   - Change `p.pages` to `p.totalPages` in `src/features/forms/apiHooks.js`.
5. **Remove Dead AWS S3 Code**:
   - Remove `@aws-sdk/client-s3` from `package.json` to keep dependencies clean.
