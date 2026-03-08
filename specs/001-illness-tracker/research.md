# Research: Health Records & Illness Tracker

**Date**: 2026-03-08  
**Feature**: [Health Records & Illness Tracker](spec.md)  
**Status**: Phase 0 Complete  
**Input**: Technical Context from plan.md + Specification decisions

---

## Executive Summary

No "NEEDS CLARIFICATION" markers required research. All technical decisions are driven by explicit specification requirements and deployment target (Vercel). This document captures the architecture research underlying the design.

---

## Research Topics & Decisions

### 1. Framework Selection: Next.js

**Question**: What full-stack framework best supports Vercel deployment + mobile-first web app + real-time sync?

**Findings**:

| Framework | Fit | Pros | Cons |
|-----------|-----|------|------|
| **Next.js** | ⭐⭐⭐⭐⭐ | Vercel-native, API routes, built-in image optimization, React ecosystem, TypeScript-first, full-stack in one repo | Opinionated file structure |
| SvelteKit | ⭐⭐⭐ | Fast, simple, good DX | Smaller ecosystem, less jobs market |
| Remix | ⭐⭐⭐⭐ | Great DX, similar to Next.js | Fewer Vercel optimizations |
| Astro + SPA | ⭐⭐ | Static site perf | Not ideal for dynamic real-time sync app |
| Separate React + Node.js | ⭐⭐ | Flexibility | More infrastructure, deployment complexity |

**Decision**: **Next.js 13+ (App Router)**

**Rationale**:
- Spec explicitly specifies Vercel deployment
- Full-stack capability (React frontend + API routes backend) in single codebase reduces complexity (Principle V)
- Built-in image optimization for photo gallery display
- Server components reduce JavaScript sent to mobile clients (performance requirement NFR-006 <3s load)
- Ecosystem maturity and community support reduce onboarding time (Principle V)

**Implementation Notes**:
- Use App Router (not Pages Router)—newer, better TypeScript support
- API routes in `app/api/` for backend endpoints
- Server components for data-heavy pages (history, trends)
- Client components for interactive forms (illness creation, photo upload)

---

### 2. Database: PostgreSQL vs Alternatives

**Question**: What database best stores illness/treatment/photo relationships with 1-2k records per user scale?

**Findings**:

| Database | Schema Fit | Scale | Vercel Support | Recommendations |
|----------|-----------|-------|----------------|-----------------|
| **PostgreSQL** | ⭐⭐⭐⭐⭐ | Perfect (relational) | ⭐⭐⭐⭐⭐ (Vercel Postgres) | Strong choice |
| MongoDB | ⭐⭐⭐ | Good (flexible) | ⭐⭐⭐⭐ | Schema-less but overkill |
| SQLite | ⭐⭐ | Local only | ⭐ (no cloud version) | Dev-only, not production |
| Firebase  | ⭐⭐⭐ | Good (scalable) | ⭐⭐⭐ | Different vendor, real-time but pricey |

**Decision**: **PostgreSQL with Vercel Postgres or similar**

**Rationale**:
- Illness entities have clear relationships (Illness → Photos, Illness → Treatments, Photo/Treatment → metadata)
- Array fields (symptoms) supported natively in PostgreSQL JSON columns
- Strong query language for filtering (by date, name, symptoms)
- Vercel Postgres integrates directly with Next.js API routes
- ACID compliance ensures data integrity (important for medical records, Principle V "simplicity")
- Cost-effective at 1-2k records per user scale

**Implementation Notes**:
- Use PostgreSQL JSON type for `symptoms` array (queryable filtering)
- Foreign keys enforce referential integrity (no orphaned photos/treatments)
- Indexing on `illness_name`, `date_started`, `user_id` for fast filtering
- Migrations via schema versioning (tracked in git)

---

### 3. File Storage for Photos: Vercel Blob vs AWS S3

**Question**: How to handle 25MB photo uploads with multi-device sync and fast retrieval?

**Findings**:

| Storage | Capacity | Performance | Cost | Integration |
|---------|----------|-------------|------|-------------|
| **Vercel Blob** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (CDN) | ⭐⭐⭐⭐ | Native Next.js/Vercel |
| AWS S3 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ (CloudFront) | ⭐⭐⭐ | More config needed |
| Firebase Cloud Storage | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Different vendor |
| Cloudinary | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (transforms) | ⭐⭐ | Image optimization |

**Decision**: **Vercel Blob (with S3 fallback capability)**

**Rationale**:
- Vercel-native integration (preferred per Principle V "simplicity")
- CDN delivery meets performance target (NFR-006: <3s page load on 4G)
- 25MB file size supported
- Automatic cleanup and versioning
- If Vercel Blob becomes limiting, can migrate to S3 (same API layer abstraction)

**Implementation Notes**:
- Abstract storage layer in `src/services/storage.ts` (allows swapping backends)
- Pre-signed URLs for secure photo retrieval and editing
- Automatic compression for very large mobile uploads (optional client-side or server-side)
- CDN cache headers for fast repeat views

---

### 4. Real-Time Multi-Device Sync Strategy

**Question**: How to synchronize data in real-time across mobile, tablet, and desktop devices?

**Findings**:

| Strategy | Latency | Complexity | Cost | Mobile-Friendly |
|----------|---------|-----------|------|-----------------|
| **WebSockets + Server Events** | <1s | High | Medium | ⭐⭐⭐⭐ (with fallback) |
| **Polling (SWR/React Query)** | 2-5s | Low | Low | ⭐⭐⭐⭐⭐ |
| **Server-Sent Events (SSE)** | <2s | Medium | Low | ⭐⭐⭐⭐ |
| **Firebase Realtime DB** | <1s | Medium | Medium-High | ⭐⭐⭐⭐ (vendor lock) |
| **GraphQL Subscriptions** | <1s | High | Medium | ⭐⭐⭐ |

**Decision**: **Hybrid approach: Polling via SWR (primary) + WebSockets (optional enhancement)**

**Rationale**:
- Spec requires "real-time sync across devices" (clarification #2)
- Polling (SWR/React Query) is simple, works on all networks, handles mobile data limits (Principle V)
- WebSockets adds real-time for better UX but not critical for MVP
- Mobile networks favor polling over persistent connections (battery/data cost)
- SWR handles stale data intelligently, re-fetches when tab regains focus

**Implementation Notes**:
- Use SWR library for HTTP-based polling with smart caching
- Configuration: poll interval 10-30 seconds (configurable per endpoint)
- WebSocket upgrade can be added in v2 without API changes
- Background sync via service workers (PWA) for offline record queuing

---

### 5. Testing Strategy: Jest + RTL + Playwright

**Question**: How to achieve 80%+ coverage while testing mobile UX and E2E workflows?

**Findings**:

| Tool | Unit | Component | Integration | E2E | Mobile | CI Performance |
|------|------|-----------|-------------|-----|--------|-----------------|
| **Jest** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | N/A | <5 min |
| **React Testing Library** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | Medium |
| **Playwright** | ❌ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | <10 min |
| **Cypress** | ❌ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Slower |
| **Vitest** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | N/A | <3 min |

**Decision**: **Jest (unit) + React Testing Library (components) + Playwright (E2E)**

**Rationale**:
- Constitution requires 80%+ coverage (Principle II)
- Jest is industry standard, <5 min test run (fast feedback)
- React Testing Library tests component behavior, not implementation (maintainable tests)
- Playwright supports mobile viewport testing (5"-13" screens per NFR-002)
- Playwright runs E2E tests across all 5 user stories as required
- All three tools integrated in Next.js ecosystem

**Implementation Notes**:
- Jest config includes code coverage reporting (enforced in CI)
- Coverage thresholds: 80% lines/branches, 100% critical paths (US1, US3, US4)
- E2E tests organized by user story (test/e2e/stories/)
- Playwright runs in headed + headless modes in CI
- Mobile device emulation in Playwright (iPhone 12, Pixel 5)

---

### 6. Mobile UI Framework: React + Tailwind CSS (no native apps)

**Question**: Native iOS/Android apps or responsive web + PWA?

**Findings**:

| Approach | Dev Time | Maintenance | Mobile UX | Cost | Spec Fit |
|----------|----------|------------|-----------|------|----------|
| **Responsive Web + PWA** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Perfect |
| React Native (iOS + Android) | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Overkill |
| Flutter (iOS + Android) | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Different language |
| Separate iOS + Android | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ❌ | Too costly |

**Decision**: **Responsive web with PWA capabilities (no native apps)**

**Rationale**:
- Spec says "mobile-first design" but not "native app" (NFR-001-NFR-007 all web-focused)
- Vercel deployment best suited for web
- Single codebase (React) vs maintaining iOS + Android (Principle V "simplicity")
- PWA capabilities (offline, install to home screen, push notifications) provide native-like UX
- 80%+ users on modern browsers support full functionality

**Mobile UX Implementation**:
- Tailwind CSS responsive utilities (mobile-first: base → sm → md → lg → xl)
- Touch targets: 44x44px minimum (NFR-005, enforced via Tailwind spacing)
- Bottom sheets for modals (native iOS/Android pattern, via Headless UI)
- Native HTML5 date/time pickers (mobile optimized)
- Viewport meta tags, PWA manifest, service worker for app-like experience
- Lazy loading images to reduce mobile data usage
- No horizontal scrolling for core workflows (NFR-003)

---

### 7. Authentication (Deferred, Out of Scope)

**Question**: How to authenticate users?

**Decision**: **Deferred - Assumed handled at platform level**

**Rationale**:
- Spec explicitly states "Authentication is handled separately (out of scope for this feature)"
- Implementation will assume authenticated user context via middleware
- Middleware extracts user_id from auth token (JWT, session cookie, etc.)
- All API endpoints enforce user isolation (user_id in queries)

**Implementation Notes**:
- Middleware in `src/middleware.ts` validates auth before routing
- User context passed to API routes via `req.user` object
- Example: `/api/illnesses` filters by authenticated user's ID only
- Can be integrated with Auth0, Next-Auth, Supabase Auth, or any OAuth provider

---

## Technology Stack Summary

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Runtime** | Node.js | 18 LTS+ | Vercel default, LTS support |
| **Framework** | Next.js | 13+ (App Router) | Vercel-native, full-stack |
| **UI Library** | React | 18+ | Industry standard, mobile-friendly |
| **Language** | TypeScript | 5.0+ | Type safety, developer experience |
| **Styling** | Tailwind CSS | 3+ | Mobile-first utilities, accessibility |
| **Forms** | React Hook Form | Latest | Lightweight, performant forms |
| **Validation** | Zod | Latest | Runtime schema validation |
| **API Client** | SWR or React Query | Latest | Data fetching, caching, sync |
| **Database** | PostgreSQL | 14+ | Relational, JSON support |
| **File Storage** | Vercel Blob | - | Vercel-integrated, CDN-backed |
| **Unit Testing** | Jest | 29+ | Fast, mature, Next.js integrated |
| **Component Testing** | React Testing Library | Latest | Behavior-focused, accessible |
| **E2E Testing** | Playwright | Latest | Cross-browser, mobile support |
| **CI/CD** | GitHub Actions + Vercel | - | GitHub-integrated, automatic deploys |
| **Deployment** | Vercel | - | Spec requirement, serverless |

---

## Dependency Graph & Installation

**Core Dependencies** (mvp):
```json
{
  "react": "^18.2.0",
  "next": "^13.5.0",
  "typescript": "^5.2.0",
  "tailwindcss": "^3.3.0"
}
```

**Optional but Recommended**:
```json
{
  "react-hook-form": "^7.48.0",
  "swr": "^2.2.0",
  "zod": "^3.22.0",
  "@headlessui/react": "^1.7.0"
}
```

**Dev Dependencies** (testing):
```json
{
  "jest": "^29.7.0",
  "@testing-library/react": "^14.0.0",
  "playwright": "^1.40.0"
}
```

**Total dependencies**: ~10-15 (minimal per Principle V)

---

## Performance Targets & Justification

| Target | Value | Justification | Measurement |
|--------|-------|---------------|-------------|
| Page Load | <3s on 4G | NFR-006, typical medical app UX | Lighthouse, WebPageTest |
| API Response | <500ms | Illness history retrieval, typical web API | API latency monitoring |
| Photo Upload | <30s for 25MB | NFR-004, on typical 4G connection | Upload profiling |
| Time to Interactive (TTI) | <2s | Core workflows (record, view history) | Lighthouse, RUM data |
| First Contentful Paint (FCP) | <1.5s | Mobile UX perception | Core Web Vitals |
| Cumulative Layout Shift (CLS) | <0.1 | Stable photo gallery, form layouts | Core Web Vitals |

---

## Security Considerations

**Data Protection**:
- All data encrypted at rest (PostgreSQL with transparent encryption)
- HTTPS only (Vercel enforces)
- User isolation via authenticated user_id in queries
- Photo URLs signed/pre-signed to prevent direct access without permission

**Input Validation**:
- Zod schemas validate all API inputs
- File upload validation (image types only, 25MB limit)
- SQL injection prevention via parameterized queries

**Auth & Access Control**:
- User authentication deferred (assumed platform-level)
- Each API endpoint validates user_id matches authenticated user
- No cross-user data leakage possible (queries scoped by user_id)

---

## Scalability & Future-Proofing

**v1 (MVP)**: 1-10k users, personal health records  
**v1.5**: Trend analysis (US5), export features, medication reminders  
**v2**: Multi-user sharing (family health records), doctor collaboration, HL7 FHIR compliance  

**Architectural Scalability**:
- PostgreSQL: Handles 1M+ records per user with proper indexing
- Vercel: Auto-scales serverless functions, pays-per-use
- Storage: Object storage (Blob/S3) scales to petabytes
- Static assets: CDN caching handled by Vercel

**Code Scalability**:
- Modular component structure allows feature modules
- API route organization supports 50+ endpoints
- Test structure supports 1000+ tests with <5 min execution

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Vercel pricing escalation | Cost increase | Monitor usage, vendor evaluation quarterly |
| PostgreSQL: Large photo queries slow down | Performance | Index by user_id, illness_id; lazy load photos |
| Mobile upload reliability on spotty networks | User friction | Retry logic, background task queue, offline support |
| Data privacy regulations (HIPAA, GDPR) | Compliance | Audit logging, encryption, data deletion APIs ready |
| Test suite grows unwieldy | Maintenance | Organize by feature, enforce coverage targets |

---

## Next Steps

1. ✅ Research complete - All decisions documented and justified
2. ⏭️ Phase 1 Design: Generate data-model.md, contracts/, quickstart.md
3. ⏭️ Phase 2 Tasks: Generate actionable tasks for implementation

**Timeline**: Research → Design artifacts → Tasks generation (all Phase 1/0 in this `/speckit.plan` run)
