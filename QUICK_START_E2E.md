# E2E Tests Quick Start Guide

## Summary of Completed Work

✅ **T031: Record Illness E2E Tests** - 4 test scenarios
✅ **T040: View History E2E Tests** - 7 test scenarios  
✅ **T049: Track Treatments E2E Tests** - 6 test scenarios

**Total**: 17 E2E test scenarios × 3 browsers (Chromium, Firefox, WebKit) = **51 automated test runs**

## Installation Status

- ✅ Playwright installed: `@playwright/test`
- ✅ Config created: `playwright.config.ts`
- ✅ Test files created in: `tests/e2e/`
- ✅ NPM scripts added for easy running
- ✅ Task.md updated: T031, T040, T049 marked complete

## Files Created

```
tests/e2e/
├── 01-record-illness.e2e.ts      (T031 - 4 tests)
├── 03-view-history.e2e.ts        (T040 - 7 tests)
├── 04-track-treatments.e2e.ts    (T049 - 6 tests)
└── README.md                      (Comprehensive guide)

playwright.config.ts              (Configuration)
E2E_TESTS_SUMMARY.md             (This summary)
```

## Quick Commands

```bash
# Run all E2E tests (requires dev server running)
npm run e2e

# Run with interactive UI (visual mode)
npm run e2e:ui

# Run with debug inspector
npm run e2e:debug

# Run with visible browser
npm run e2e:headed

# List all tests
npx playwright test --list

# Run specific test file
npx playwright test tests/e2e/01-record-illness.e2e.ts

# Run specific test by name pattern
npx playwright test -g "should create a new illness"

# View test results
npx playwright show-report
```

## Before Running Tests

### Terminal 1: Start Database
```bash
docker-compose up -d
```

### Terminal 2: Start Dev Server
```bash
npm run dev
```
The app must be running at `http://localhost:3000`

### Terminal 3: Run Tests
```bash
npm run e2e
```

## Test Details

### 1️⃣ Record Illness Tests (T031)
**File**: `tests/e2e/01-record-illness.e2e.ts`

Tests user creating a new illness:
- ✅ Create illness with symptoms and cause
- ✅ Validate name is required
- ✅ Validate date is required
- ✅ Accept recovery date (end date)

**Flow**: Navigate to /record → Fill form → Submit → Verify in /history

### 2️⃣ View History Tests (T040)
**File**: `tests/e2e/03-view-history.e2e.ts`

Tests viewing illness history and details:
- ✅ Display illnesses sorted by date
- ✅ Show key info on cards
- ✅ Navigate to detail page
- ✅ View complete record
- ✅ Navigate back to list
- ✅ Handle empty state
- ✅ Show treatment counts

**Flow**: Navigate to /history → Browse list → Click illness → View detail

### 3️⃣ Track Treatments Tests (T049)
**File**: `tests/e2e/04-track-treatments.e2e.ts`

Tests treatment CRUD operations:
- ✅ Add new treatment
- ✅ Display effectiveness status
- ✅ Edit treatment
- ✅ Delete treatment
- ✅ Validate required fields
- ✅ Validate date ranges

**Flow**: Open illness → Add treatment → Edit → Verify → Delete

## Project Status

**MVP Feature Completion**:
- ✅ US1: Record Illness (100% complete)
- ✅ US3: View History (100% complete)
- ✅ US4: Track Treatments (100% complete)
- ❌ US2: Upload Photos (0% - not started)
- ❌ US5: Analyze Trends (0% - deferred to v2)

**Test Coverage**:
- 51 E2E tests (new)
- 105+ unit & integration tests (existing)
- **Total: 156+ automated tests**
- Build: ✅ Passing (0 TypeScript errors)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Start dev server: `npm run dev` |
| Element not found | Update selectors if UI changed |
| Database error | Run `docker-compose up -d` |
| Port 3000 in use | Change port or kill process |
| Tests skip quickly | UI not updating; check app logs |

## Next Steps

1. **Run baseline tests**: `npm run e2e`
2. **Review report**: `npx playwright show-report`
3. **Fix any failures**: Update selectors if UI changed
4. **Add to CI/CD**: Configure GitHub Actions
5. **Monitor regularly**: Before each deployment

## Resources

- **Playwright Docs**: https://playwright.dev
- **Test Guide**: `tests/e2e/README.md`
- **Summary**: `E2E_TESTS_SUMMARY.md`
- **Tasks**: `specs/001-illness-tracker/tasks.md`

---

**Status**: ✅ All E2E tests ready for execution
**Last Updated**: March 9, 2026
