# Specification

## Summary
**Goal:** Add a standalone, no-build-step vanilla HTML/CSS/JS UI demo for GST Returns and B2B Invoice management that runs by opening `index.html` directly (via `file://`) without affecting the existing React/Vite app.

**Planned changes:**
- Add a new standalone folder containing `index.html`, `style.css`, and `script.js` (plus an optional small README) that runs directly in a browser with no frameworks/libraries.
- Implement a Login view with username/password inputs, client-side validation, dynamic error/success messages, and simulated login state (optionally persisted) that transitions to the Dashboard.
- Implement a single-page-style Dashboard view with nav (Dashboard, Invoices, GST Returns, Logout) and summary cards (Total Invoices, GST Payable, Filing Status) that reflect demo state updates.
- Implement an Invoice Management view with an add-invoice form (validated), an invoices table, and UI-only View (modal/panel/section) and Delete actions that update in-browser state immediately.
- Implement a GST Return view with a simple filing form, client-side validation, and dynamic status messaging that updates the Dashboard filing status.
- Apply a responsive, professional government/finance visual design (blue/white/gray palette) with consistent typography, spacing, and card-based UI patterns.
- In `script.js`, structure logic into clear functions for validation/rendering/state changes and include `fetch()` calls to placeholder REST endpoints (login/invoices/GST filing) with graceful fallback when requests fail (e.g., due to `file://` CORS/offline).

**User-visible outcome:** Users can open the standalone `index.html` directly in a browser, log in to a demo dashboard, add/view/delete invoices, simulate GST return filing, and see summary metrics update—all in a clean, responsive UI without any external libraries.
