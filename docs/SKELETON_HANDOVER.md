# Skeleton Loading — Handover Notes

## What was changed today

- Added an optional `skeleton` prop to `frontend/src/components/AsyncSection.tsx`.
  - When `skeleton` is supplied, `Shimmer` uses that placeholder while data loads and fades it out before rendering the real `children`.
  - `AsyncLoadingContext` still disables `FadeIn`/`Stagger` inside `AsyncSection` so the layout fades in once, then the skeleton shimmers, then the real content appears without extra entrance animations.
- Updated the following pages so their loading placeholders mirror the real content layout (stat cards, rows, progress bars, avatars, etc.):
  - `frontend/src/pages/Levels.tsx`
  - `frontend/src/pages/Leaderboard.tsx`
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/AdminDashboard.tsx`
  - `frontend/src/pages/Profile.tsx`
  - `frontend/src/pages/EditProfile.tsx`
  - `frontend/src/pages/admin/Users.tsx`
  - `frontend/src/pages/admin/Logs.tsx`
  - `frontend/src/pages/admin/UserDetails.tsx` (activity tables)

## How the pattern works

```tsx
import AsyncSection from '../components/AsyncSection';

<AsyncSection state={data} onRetry={data.reload} skeleton={<MySkeleton />}>
  <RealContent data={data.data} />
</AsyncSection>
```

1. `state` comes from `useData<T>(fetcher, deps, { initial })`.
2. `skeleton` is a static React element with placeholder `div`s sized to match the real content.
3. Use `bg-slate-200 dark:bg-slate-700` (light pages) or `bg-slate-500/30` (dark admin pages) so `Shimmer` has visible blocks to overlay.
4. Keep the same container, spacing, and width classes as the real content so the skeleton looks like the final UI.

## Remaining work for tomorrow

The following pages still use `AsyncSection` (or `useData`) but do not have dedicated, layout-aware skeleton placeholders yet. In most cases the loading state either mirrors the `initial` placeholder data (which produces a generic shimmer) or collapses to a "No ... found" message, which does not look like the real layout.

### Admin pages

| Page | What needs a skeleton | Notes |
|------|----------------------|-------|
| `frontend/src/pages/admin/Analytics.tsx` | Dashboard stats, level performance, activity charts/lists | Check what cards/tables/lists exist and add a placeholder for each `AsyncSection`. |
| `frontend/src/pages/admin/Backup.tsx` | Backup history list or table | Add row placeholders that match the backup item layout. |
| `frontend/src/pages/admin/Reports.tsx` | Report form / user dropdown / certificate preview | Add skeleton placeholders for the report generation UI and any result area. |
| `frontend/src/pages/admin/Schedule.tsx` | Form fields / scheduled items list | Add form-shaped and list-shaped placeholders. |
| `frontend/src/pages/admin/UserDetails.tsx` | **User overview panel** (avatar + detail cards) | The activity tables are done; the left-side avatar and `DetailItem` grid still conditionally renders `null` while loading. Add a `UserDetailsOverviewSkeleton`. |

### Other pages

| Page | What needs a skeleton | Notes |
|------|----------------------|-------|
| `frontend/src/pages/Contact.tsx` | No async data; N/A | Static page. |
| `frontend/src/pages/About.tsx` | No async data; N/A | Static page. |
| `frontend/src/pages/Cookies.tsx` | No async data; N/A | Static page. |
| `frontend/src/pages/Privacy.tsx` | No async data; N/A | Static page. |
| `frontend/src/pages/Terms.tsx` | No async data; N/A | Static page. |
| `frontend/src/pages/Home.tsx` | Hero + feature cards | No `AsyncSection` here yet; only add if/when data is fetched. |

## Step-by-step for the remaining pages

1. Open the target page and identify every `useData`/`AsyncSection` call.
2. Look at the real content that renders when data is loaded.
3. Create a local skeleton component (e.g., `AnalyticsSkeleton`, `BackupListSkeleton`) at the bottom of the file.
4. Match the real layout:
   - Same grid/flex container classes (`grid`, `gap-`, `sm:grid-cols-` etc.).
   - Same number of rows/cards.
   - Approximate widths for text placeholders (`w-32`, `w-48`, etc.).
   - Same card borders/padding if relevant (the `Shimmer` overlay needs visible boxes to shimmer).
5. Pass the skeleton to `AsyncSection`:
   ```tsx
   <AsyncSection state={myData} onRetry={myData.reload} skeleton={<MySkeleton />}>
     <RealContent />
   </AsyncSection>
   ```
6. Remove or leave the `initial` placeholder data only if it is useful for the hook; `AsyncSection` will prefer the `skeleton` prop for the visual placeholder.
7. Run `npx tsc --noEmit` and `npm run build` from `frontend/`.
8. Smoke-test the loading state with the browser network throttled to see the skeleton.

## Verification checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] The shimmer blocks visually map to the final content (no single big rectangle where the real UI has multiple sections)
- [ ] `FadeIn`/`Stagger` entrance animations do not play *inside* the `AsyncSection` after data loads
- [ ] Pages with dark admin themes use `bg-slate-500/30` style placeholders so they are visible under the shimmer overlay
