# Current UI Snapshot (Pre-Redesign)

This document captures the existing UI/UX so we can revert if needed.

## Global Look & Feel
- Dark, glassmorphism theme with gradient glows and animated backgrounds.
- Fonts: Inter (body) and Space Grotesk (display).
- Tailwind utilities for glass (`glass`, `glass-strong`), gradient text, glow effects.
- Theme toggle supports light/dark (current default dark).

## Layout (app/page.tsx)
- Hero: Network Health Score widget at top.
- Header actions: Refresh, View toggle (grid/table), Tabs (Nodes/Analytics/Compare), Smart Search (`/` shortcut), Theme Toggle.
- Tabs:
  - **Nodes:** Grid of PNode cards + table view; advanced filters; export button.
  - **Analytics:** Charts (status pie, node count line, storage bar, storage usage pie), insights, flow diagram, heatmap, activity timeline, leaderboard, network health.
  - **Compare:** Node selector + side-by-side comparison (up to 4 nodes) with metrics.

## Components Overview
- **PNodeCard:** Glass card with status, version, storage bar, uptime, location, latency, copy gossip button, XAND reward estimate, consensus info (last vote/block, blocks behind).
- **PNodeTable:** Sortable/searchable table with status, version, storage usage, uptime, location, latency, estimated XAND/month, consensus (last vote, blocks behind), compare add button.
- **Charts (Recharts):** StatusChart (pie), NodeCountChart (line), StorageChart (bar), StorageUsageChart (pie), Sparkline mini-charts in stat cards.
- **NetworkHealth:** Computes health score 0100; displayed in hero and analytics section.
- **Heatmap:** Location aggregation by count/storage/latency; gradient intensity cards per region.
- **FlowDiagram:** Simplified network topology visualization showing node groupings by status.
- **Insights & AI Virtual Analyst:** Narrative insights and recommendation cards based on current/history.
- **AdvancedFilters:** Multi-criteria filtering (status, uptime, latency, storage, location).
- **SmartSearch:** Global quick search with keyboard shortcut (`/`).
- **NodeDetailModal:** Modal with detailed node info and activity timeline.
- **ActivityTimeline:** History snapshots (using localStorage) showing trends.
- **Leaderboard:** Ranks nodes by performance metrics.
- **NodeComparison:** Side-by-side metrics (uptime, storage, latency, version, location, blocks behind).
- **ExportButton:** CSV/JSON export of node data.

## Data & Logic
- Data source: `/api/pnodes` -> `PRPCClient` (tries devnet/mainnet pRPC endpoints, falls back to mock nodes).
- Mock data: 45 nodes, varied status, storage, latency, IP, last vote/block, blocks behind.
- XAND rewards: Calculated in `lib/rewards.ts` (base 100 XAND/TB/month with uptime & latency multipliers).
- Geolocation: `lib/geolocation.ts` + `/api/geolocation` (IP-API, fallback-ready; currently not invoked in UI yet).
- Consensus metrics: last vote, last block stored, blocks behind displayed in cards/table.
- History: `HistoryTracker` stores snapshots in localStorage for charts/timeline.

## Styling & UX Patterns
- Glass cards, rounded corners, subtle borders, gradient hovers.
- Animated background gradients and glow orbs.
- Iconography via lucide-react.
- Error handling: `app/error.tsx`; 404 page: `app/not-found.tsx`.

## Pages/Files of Interest
- UI composition: `app/page.tsx`
- Global styles: `app/globals.css`
- Layout/fonts/Hotjar: `app/layout.tsx`
- Components: `components/*.tsx` (as listed above)
- Data: `lib/prpc.ts`, `lib/rewards.ts`, `lib/geolocation.ts`, `lib/history.ts`
- API routes: `app/api/pnodes/route.ts`, `app/api/geolocation/route.ts`

## Current Strengths
- Feature-rich: rewards, consensus, comparison, analytics, health score.
- Polished dark/glass aesthetic.
- Good discoverability (search, filters, tabs, view toggle).

## Known Gaps / Next Ideas
- Geolocation UI not yet wired to live IP lookup (only data plumbing exists).
- Could add more enterprise-style layout, dense tables, and GA-like side nav.
- Could add workspace/sidebar, breadcrumbs, and sticky top bar for controls.

Use this as the reference to revert if the upcoming redesign is not preferred.
