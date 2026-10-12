# SRS Changes Log

This document records every deviation from, clarification of, or addition to the
original SRS (`docs/SRS.pdf`). All changes are referenced to their Decision ID (D1–D12)
or Requirement ID (REQ-x.x).

| Change ID | SRS Section | Old Text (paraphrased) | New Text / Clarification | Reason |
|-----------|-------------|------------------------|--------------------------|--------|
| C1  | Table 3 / Milestones | Nine milestones M1–M9 over an unspecified timeframe | Seven milestones M0–M6 over 12 weeks, plus a Week 12 buffer | Project prompt explicitly overrides SRS Table 3. |
| C2  | §5.5 Business Rule | "Place records can only be created, edited or deleted by authenticated administrators. Tourist accounts are managed by administrators." | "Place records and categories can only be created, edited or deleted by authenticated administrators. Tourist accounts are created by **self-registration** and can only be **blocked or deleted** by administrators." | D1 — aligns rule with REQ-5.5 (self-registration) and D1 scope. |
| C3  | TBD-1 (Map API) | Map API unresolved; potential billing/key risk | Resolved: **Leaflet.js + OpenStreetMap tiles** (no API key, no billing). OSM attribution is always displayed. | D resolution (TBD-1). |
| C4  | TBD-2 (Ordering) | Itinerary ordering strategy undefined | Resolved: **"auto"** = nearest-neighbour greedy algorithm starting from Walasmulla town centre; **"manual"** = user-controlled up/down reorder. Both modes returned in API response as `orderMode`. | D2. |
| C5  | TBD-3 (Accounts) | Whether account creation is required to use the planner | Resolved: **Browsing, searching and building a temporary plan require no login** (React Context + localStorage). Self-registration (username + password only) is required **only to save a plan on the server**. | D1. |
| C6  | §5.2 / UX | No explicit dress-code callout specified for religious sites | A **"Respectful visit / dress code"** callout is displayed on the Place Detail page for any place categorised as Religious or Heritage. | D resolution (SRS §5.2 implied; made explicit). |
| C7  | REQ-3.3 | "Reasonable day window" undefined | Defined as **08:00 to 18:00**. A non-blocking warning is emitted if the last stop's finish time exceeds 18:00. The user may adjust the start time. | D3. |
| C8  | REQ-5.2 (lockout) | Lockout parameters undefined | **5 consecutive failed logins → 15-minute lockout**. Error message is always the generic "Invalid username or password" (does not leak whether the username exists). Applies to both tourists and admins. Rate-limiting is also applied to `/api/auth/*`. | D4. |
| C9  | New — REQ-3.5 | Not in original SRS | **REQ-3.5**: The itinerary shall show estimated arrival time (ETA), finish time and travel time from the previous stop for each place. | D12 — clarification addition. |
| C10 | New — REQ-3.6 | Not in original SRS | **REQ-3.6**: A registered tourist shall be able to save a generated plan to their account and retrieve it later. | D12. |
| C11 | New — REQ-5.5 | Not in original SRS | **REQ-5.5**: A tourist shall be able to self-register with a username and password (no email, no real name). | D12 — aligns with D1. |
| C12 | New — REQ-5.6 | Not in original SRS | **REQ-5.6**: A registered tourist shall be able to view, open and delete their own saved plans. | D12. |
| C13 | §4 / Data Model (TBD-4 implied) | Single category per place | A place can have **multiple categories** (min 1). Deleting a category that is still referenced by at least one place is refused with a clear message. | D6. |
| C14 | §4 / Data Model | Distance field origin unspecified | `distanceKm` = road distance from **Walasmulla town centre** (lat 6.155, lng 80.700 — to be verified). For admin-created places, auto-estimated as haversine × 1.3 with admin override. | D7 + A11. |
| C15 | §7 Seed Data — Mulkirigala | SRS Table 2 lists one category | Mulkirigala Raja Maha Vihara → **Religious + Heritage + Cultural** | D10. |
| C16 | §7 Seed Data — Wewurukannala | SRS Table 2 lists one category | Wewurukannala Vihara → **Religious + Cultural** | D10. |
| C17 | §7 Seed Data — Kasagala | SRS Table 2 lists one category | Kasagala Raja Maha Vihara → **Religious + Heritage** | D10. |
| C18 | §7 Seed Data — Rekawa | Opening hours undefined | Opening hours include `notes: "Turtle watching is typically a night-time activity (verify)"`. The plan generator emits a non-blocking night-activity warning. | D9 + D3. |
| C19 | §1 / Scope | Search scope unspecified | REQ-1.3 search matches **place name only** (case-insensitive, partial match, debounced 300 ms client-side). | D11. |
| C20 | §4 / VisitPlan | ETA storage unspecified | ETAs are **computed server-side** on generate/read and are **never stored in the database** nor trusted from the client. | D3 + security principle. |
