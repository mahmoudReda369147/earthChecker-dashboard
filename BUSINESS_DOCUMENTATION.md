# EarthChecker / Feedbrush — Complete Business & Operations Guide

## 1. Business Vision & Core Purpose

**Feedbrush (EarthChecker)** is an enterprise AI-powered visual quality control and industrial inspection platform. Designed for manufacturing, apparel, automotive, and physical product industries, EarthChecker digitizes manual quality checks and enhances them with automated **Generative AI Vision Analysis** (powered by Google Gemini AI).

### Primary Business Objectives
- **Standardize Quality Inspections**: Create centralized inspection templates (Modules & Forms) across factory lines or operational locations.
- **Automate Visual Quality Control**: Replace manual human eyes with AI Inspection Agents capable of analyzing visual defects in real time based on natural language prompts and configurable tolerance thresholds.
- **Enforce Sequential Workflow Integrity**: Ensure field workers complete inspection stages in strict, ordered sequence with automated stage unlocking.
- **Maintain Full Audit Trails & Feedback**: Track every submission, AI decision reasoning, confidence score, and human rating (`like`/`dislike`) to continuously measure and refine inspection quality.

---

## 2. Business Entity Hierarchy & Data Domain

```
                    ┌─────────────────────────┐
                    │    Company (Tenant)     │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
 ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
 │ User Roles   │        │   Modules    │        │  AI Agents   │
 │ (CEO / Sup / │        │(QC Standard) │        │ (Vision Bots)│
 │  Worker)     │        └───────┬──────┘        └───────┬──────┘
 └──────────────┘                │                       │
                                 ▼                       │
                         ┌──────────────┐                │
                         │    Forms     │                │
                         │ (Form Stages)│                │
                         └───────┬──────┘                │
                                 │                       │
                                 ▼                       │
                         ┌──────────────┐                │
                         │   Cycles     │                │
                         │(Executions)  │                │
                         └───────┬──────┘                │
                                 │                       │
                                 ▼                       │
                         ┌──────────────┐                │
                         │    Stages    │                │
                         │(Stage Gating)│                │
                         └───────┬──────┘                │
                                 │                       │
                                 ▼                       │
                         ┌──────────────┐                │
                         │ Submissions  │ ◄──────────────┘
                         │ (Field Data) │
                         └───────┬──────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │ AI Analyses  │
                         │(Pass / Fail) │
                         └──────────────┘
```

---

## 3. Organizational Roles & Authority Matrix (RBAC)

EarthChecker enforces a strict 3-tier Role-Based Access Control (RBAC) model. Each role has distinct operational responsibilities and system capabilities.

| Feature / Action | CEO (Executive) | Supervisor (Manager) | Worker (Inspector) |
| :--- | :---: | :---: | :---: |
| **Manage Company & Billing Settings** | ✅ Full Access | ❌ No Access | ❌ No Access |
| **Create & Edit Staff Accounts** | ✅ All Roles (Supervisor, Worker) | ✅ Workers Only | ❌ No Access |
| **Create & Edit Inspection Modules** | ✅ Full Access | ❌ Read Only | ❌ Read Only |
| **Create & Edit Forms / Questions** | ✅ Full Access | ❌ Read Only | ❌ Read Only |
| **Configure AI Inspection Agents** | ✅ Full Access | ❌ Read Only | ❌ Read Only |
| **Create & Assign Cycles** | ✅ Full Access | ✅ Full Access | ❌ No Access |
| **Start / Pause Cycles** | ✅ Full Access | ✅ Assigned Cycles | ❌ No Access |
| **Request Cycle Cancellation** | N/A (Direct Cancel) | ✅ Assigned Cycles | ❌ No Access |
| **Approve Cycle Cancellation** | ✅ Full Access | ❌ No Access | ❌ No Access |
| **Execute Cycle Stages & Submit Data** | ✅ Full Access | ✅ Full Access | ✅ Assigned Cycles |
| **Rate AI Decisions (Like/Dislike)** | ✅ Full Access | ✅ Full Access | ✅ Assigned Cycles |

---

## 4. Key Business Components & Concepts

### 🏢 1. Tenant Company (`Company`)
Every organization operates in an isolated tenant environment. All data—including staff, modules, forms, agents, cycles, and submissions—is strictly scoped by `companyId`.

---

### 📦 2. Inspection Modules (`Module`)
A **Module** represents a specific quality inspection standard or product line category. 
- *Examples*: "T-Shirt Stitching & Seam QC", "Leather Texture Audit", "Label & Packaging Verification".
- *Properties*: Title, Description, Cover Image, Creator ID, Company ID, Soft-delete flag (`isDeleted`).

---

### 📋 3. Dynamic Forms & Questionnaires (`Form`)
Modules contain one or more ordered **Forms** (representing inspection stages). Each form contains customizable sections/questions:
- **Field Types**: Short Text, Paragraph, Number, Multiple Choice (Radio), Checkbox, Dropdown (Select), Image Upload, Linear Rating Scale, Date, and Section Headers.
- **AI Linkage**: Image fields can be linked to a specific **AI Inspection Agent**. When a worker uploads a image to that field, the assigned AI agent automatically analyzes the picture.

---

### 🤖 4. AI Inspection Agents (`Agent`)
An **Agent** is an autonomous AI visual quality control bot configured with custom inspection rules:
- **System / Inspection Prompt**: Natural language instructions describing what visual elements to evaluate (e.g., *"Check for loose threads, uneven seam lines, or color discoloration along the collar edges"*).
- **Tolerance Threshold (0–100%)**: Strictness level for quality acceptance.
- **Visual Models**: Reference image assets (Avatar, Pass sample image, Fail sample image, Thinking state graphic).
- **Feedback Metrics**: Cumulative tracking of `totalAnalyses`, `totalPasses`, `totalFails`, `likes`, and `dislikes`.

---

### 🔄 5. Operational Inspection Cycles (`Cycle`)
A **Cycle** is an active operational execution run of a Module assigned to a team.
- **Assignees**: Supervisor (manager overseeing the run) and optional Worker (field inspector executing stage submissions).
- **Lifecycle States**:
  1. `new`: Created, awaiting launch.
  2. `inProgress`: Active; field workers are submitting stages.
  3. `paused`: Temporarily halted by supervisor or CEO (with a pause reason message).
  4. `cancelledRequest`: Supervisor requested cancellation (with a cancellation reason message).
  5. `cancelled`: CEO approved cancellation (terminal state).
  6. `completed`: 100% of stages submitted (terminal state).

---

### 🚧 6. Sequential Stage Gating (`Stage`)
When a Cycle is created, EarthChecker automatically generates **Stage** records corresponding to all forms in the Module, ordered sequentially:
- **Sequential Gating Business Rule**:
  - Stage 1 starts with status `available`.
  - Stage 2, Stage 3, ..., Stage N start with status `locked`.
  - Workers can only fill and submit `available` stages.
  - Upon submission of Stage 1, Stage 1 transitions to `submitted`, and Stage 2 automatically unlocks to `available`.
  - When the final Stage is submitted, the parent Cycle automatically progresses to `completed` with 100% progress.

---

### 🔍 7. Submissions & Automated AI Analysis (`Submission` & `Analysis`)
- **Field Submission**: Workers submit answers for all fields in an available stage.
- **AI Interception**: The system inspects submitted answers. If an image field has an assigned AI Agent, the backend:
  1. Downloads/reads the image URL.
  2. Base64-encodes the image payload.
  3. Sends the image to Google Gemini AI along with the Agent's prompt and tolerance threshold.
  4. Parses the JSON output from Gemini:
     - `result`: `"pass"` or `"fail"`
     - `confidence`: $0 - 100\%$ score
     - `reason`: Detailed text explanation of why the item passed or failed visual inspection.
  5. Stores an `Analysis` record linked to the submission and increments the Agent's statistics counters.
- **Human Rating Loop**: Supervisors or CEOs can review AI analysis results and provide a `like` or `dislike` rating to validate or challenge the AI's accuracy.

---

## 5. End-to-End Business Lifecycle Workflows

### 🟢 Process A: Onboarding & Quality Standard Setup
```
1. Executive registers account ──► Auto-creates Company & sets user role to CEO.
2. CEO creates Inspection Module (e.g. "Outerwear Quality Audit").
3. CEO builds Forms within the Module (e.g. "Stage 1: Fabric Inspection", "Stage 2: Zipper & Seam Scan").
4. CEO configures AI Agents (e.g. "SeamBot-v1" with prompt "Detect loose stitching or broken thread lines").
5. CEO links "SeamBot-v1" to the image upload question in Stage 2 Form.
```

### 🟡 Process B: Operational Cycle Execution
```
1. Supervisor or CEO creates a new Inspection Cycle linked to "Outerwear Quality Audit".
2. Assigns Supervisor and Field Worker.
3. System automatically generates Stage 1 (Available) and Stage 2 (Locked).
4. Cycle status becomes 'new' ──► Started to 'inProgress'.
```

### 🔵 Process C: Inspection & AI Automated Quality Evaluation
```
1. Worker opens Stage 1 ──► Fills required answers ──► Submits Stage 1.
2. System marks Stage 1 'submitted' ──► Automatically unlocks Stage 2 ('available').
3. Worker opens Stage 2 ──► Captures & uploads seam photograph ──► Submits Stage 2.
4. Backend submissionController detects image question linked to "SeamBot-v1".
5. Gemini AI receives image + prompt ──► Returns Verdict: { result: "fail", confidence: 92%, reason: "Loose threads detected on left cuff" }.
6. System saves Analysis record ──► Stage 2 marked 'submitted' ──► Cycle progresses to 'completed' (100%).
7. Supervisor reviews failure log ──► Rates AI verdict with "Like" (verifying accuracy).
```

---

## 6. Business Value & Operational Metrics

1. **Error Reduction**: Automated Gemini vision checks prevent human fatigue oversight during mass manufacturing inspection.
2. **Standardization**: Strict sequential stage gating prevents field workers from skipping foundational verification steps.
3. **Auditing & Compliance**: Every inspection leaves an immutable record containing timestamp, inspector identity, raw imagery, AI analysis verdict, and managerial feedback.
4. **AI Continuous Improvement**: Aggregated `like`/`dislike` ratings allow managers to identify prompts that need tuning or agents that require adjustment.
