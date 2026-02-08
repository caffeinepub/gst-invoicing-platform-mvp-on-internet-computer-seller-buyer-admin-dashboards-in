# Specification

## Summary
**Goal:** Add authenticated ingestion of live energy readings and enable near-real-time, fault-tolerant live updates across the dashboard with streaming when possible and polling fallback.

**Planned changes:**
- Add an authenticated backend ingestion API to accept, validate, normalize, and store incoming readings for appliance power (W), solar generation (kW), battery charge (%), and grid import/export.
- Persist time-ordered readings in the existing single Motoko actor and expose queries for (a) latest values (single response) and (b) incremental updates since a timestamp/cursor with bounded payload size.
- Centralize backend authorization so only authenticated users (token from `localStorage["auth_token"]`) can ingest or query live readings.
- Implement a frontend real-time client service that prefers a stream endpoint (WS or SSE when available) and otherwise falls back to incremental polling; manage reconnect/backoff, recovery via last-seen cursor, and throttled/batched UI updates.
- Add shared React live-telemetry state (context + hooks) providing latest readings, rolling averages, connection status (LIVE/DISCONNECTED), and last-updated timestamps.
- Update `/consumption`, `/solar-analysis`, and `/cost-estimation` to show live-updating values, LIVE/DISCONNECTED indicator, and data freshness timestamps with smooth value transitions while keeping existing loading/error/empty states and manual “Fetch Data” as fallback.
- Add lightweight, configurable frontend logging for connection health/events and errors without exposing JWTs or sensitive data.

**User-visible outcome:** Authenticated users see energy metrics update automatically on the Consumption, Solar Analysis, and Cost Estimation pages with a LIVE/DISCONNECTED status and “Last updated” timestamps; if streaming isn’t available or disconnects occur, the UI recovers using polling and existing manual fetch flows.
