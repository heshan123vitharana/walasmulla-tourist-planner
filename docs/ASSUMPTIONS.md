# Assumptions

This document records every assumption made during development where the SRS was
silent or ambiguous, following the working rule "log it and continue."

| ID  | Assumed By | Date       | Description |
|-----|------------|------------|-------------|
| A1  | Dev team   | 2026-10-12 | The SRS PDF filename (`ITE2953_SRS_LocalTouristDayVisitPlanner_E2529013.pdf`) differs from the path referenced in the prompt (`docs/SRS.pdf`). The file was moved to `docs/SRS.pdf` as the canonical location. |
| A2  | Dev team   | 2026-10-12 | Node.js v26.1.0 is in use on the development machine. This satisfies the "Node 20+" requirement stated in the SRS. |
| A3  | Dev team   | 2026-10-12 | JWT tokens are stored in `localStorage` on the client side. A production deployment should switch to `httpOnly` cookies to mitigate XSS risk. This trade-off is documented in the README and ADMIN_GUIDE. |
| A4  | Dev team   | 2026-10-12 | Tailwind CSS v3 (stable) is used. Tailwind v4 was in beta at the time of development and was intentionally excluded. |
| A5  | Dev team   | 2026-10-12 | `lucide-react` v0.400+ is used for category and UI icons. If the exact icon name for a category changes across versions, the `icon` field in the Category model must be updated accordingly. |
| A6  | Dev team   | 2026-10-12 | `react-leaflet` v4 is used, which is compatible with React 18/19. The Leaflet CSS is loaded via CDN in `index.html` to avoid Vite bundling issues. |
| A7  | Dev team   | 2026-10-12 | OpenStreetMap tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`. No API key required. OSM attribution is always displayed per their usage policy. |
| A8  | Dev team   | 2026-10-12 | `autocannon` is used for the performance load test (replaces k6 which has complex install requirements on Windows). Results are recorded in `docs/PERFORMANCE_RESULTS.md`. |
| A9  | Dev team   | 2026-10-12 | Two demo tourist accounts are created by the seed script in `NODE_ENV=development` only. These are never seeded in production. |
| A10 | Dev team   | 2026-10-12 | Place images use royalty-free Unsplash/Wikimedia URLs as placeholders. No blob storage or file upload is implemented in v1.0. |
| A11 | Dev team   | 2026-10-12 | Walasmulla town centre coordinates are set to `lat: 6.155, lng: 80.700` (approximate). These are marked `// TODO verify` in `server/src/config/constants.js` and listed in `docs/DATA_TO_VERIFY.md`. |
| A12 | Dev team   | 2026-10-12 | The `distanceKm` field for admin-created places is auto-estimated as haversine × 1.3 if not provided, and the admin can override it. This matches D7. |
| A13 | Dev team   | 2026-10-12 | The "drag-and-drop" reorder mentioned in D2 is implemented as up/down arrow controls in v1.0 for simplicity and accessibility. True drag-and-drop (e.g., using dnd-kit) can be added in a future iteration. |
| A14 | Dev team   | 2026-10-12 | Strong password validation for the admin seed account requires: min 8 chars, at least 1 uppercase, 1 digit, 1 special character. This is only enforced in `NODE_ENV=production` for the seed script. |
| A15 | Dev team   | 2026-10-12 | The Rekawa Turtle Conservation place is marked with a `notes` field indicating it is a night-time activity. The plan generator emits a non-blocking warning for this place if it appears in a daytime plan. |
