# E2E Test Suite for Health Story

This directory contains end-to-end tests using Playwright for the Health Story application.

## Test Files

### 1. **01-record-illness.e2e.ts** (T031)
Tests the workflow for recording an illness with symptoms and cause.

**Tests:**
- Create a new illness record with name, date, and symptoms
- Validate required fields (name, date)
- Verify record appears in history after save
- Test date range validation for illness duration

**User Flow:**
1. Navigate to /record
2. Fill illness form with name, date, symptoms, cause
3. Submit form
4. Verify success confirmation
5. Check that record appears in /history

### 2. **03-view-history.e2e.ts** (T040)
Tests viewing and navigating illness history.

**Tests:**
- Display illness records sorted chronologically
- Verify illness cards show key information
- Navigate to detail page by clicking on illness
- View complete illness details
- Navigate back to history list
- Display empty state when no records exist
- Verify treatment count appears on cards

**User Flow:**
1. Navigate to /history
2. View list of illnesses sorted by date
3. Click on an illness to view detail
4. Navigate back to list

### 3. **04-track-treatments.e2e.ts** (T049)
Tests adding, editing, and deleting treatments for illnesses.

**Tests:**
- Add a new treatment to an illness
- Display treatment with effectiveness status
- Edit treatment to change effectiveness
- Delete a treatment
- Validate required treatment fields
- Validate end date must be after start date

**User Flow:**
1. Create or navigate to an illness
2. Add a treatment (name, type, effectiveness, dates)
3. Edit the treatment to change effectiveness
4. Verify changes are saved
5. Delete the treatment
6. Confirm removal

## Installation

Playwright is already installed. If not, run:

```bash
npm install --save-dev @playwright/test
```

## Running Tests

### Run all E2E tests
```bash
npm run e2e
```

### Run in UI mode (interactive)
```bash
npm run e2e:ui
```

### Run in debug mode
```bash
npm run e2e:debug
```

### Run with browser visible
```bash
npm run e2e:headed
```

### Run specific test file
```bash
npx playwright test tests/e2e/01-record-illness.e2e.ts
```

### Run specific test
```bash
npx playwright test -g "should create a new illness record"
```

## Prerequisites

Before running E2E tests:

1. **Start the development server** (in a separate terminal):
   ```bash
   npm run dev
   ```
   The app must be running on `http://localhost:3000`

2. **Ensure database is running** (Docker):
   ```bash
   docker-compose up -d
   ```

3. **Optional: Seed test data** (if available):
   ```bash
   npm run db:seed
   ```

## Test Output

After running tests, view results in:
- **HTML Report**: `playwright-report/index.html` (open in browser)
- **Console**: Test summary with pass/fail counts
- **Trace Files**: Detailed traces for failed tests (if `trace: 'on-first-retry'` is set)

### Viewing HTML Report
```bash
npx playwright show-report
```

## Configuration

Playwright configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers tested**: Chromium, Firefox, WebKit
- **Parallel execution**: Enabled (3+ workers)
- **Retry policy**: 2 retries on CI, 0 on local
- **Auto-start**: Dev server starts automatically if not running

## Debugging Tips

1. **Slow down tests** to see what's happening:
   ```bash
   npx playwright test --debug
   ```

2. **Take screenshots** on failure (automatic with trace files)

3. **Run single browser** for faster feedback:
   ```bash
   npx playwright test --project=chromium
   ```

4. **Watch mode** with specific file:
   ```bash
   npx playwright test --watch tests/e2e/01-record-illness.e2e.ts
   ```

5. **Check page state** with inspector:
   ```bash
   npx playwright test --debug
   ```

## Common Issues

### Tests timeout waiting for navigation
- Increase `timeout` in `expect()` calls
- Ensure app is running: `npm run dev`
- Check network connectivity

### Elements not found
- App markup might have changed
- Update selectors to match current HTML structure
- Use `--headed` mode to see real browser UI

### Database connection errors
- Verify `docker-compose up -d` is running
- Check `.env.local` has correct `DATABASE_URL`

## CI/CD Integration

For GitHub Actions or CI/CD pipelines, tests run automatically with:

```bash
npm run e2e
```

Configuration automatically adjusts:
- `CI=true` mode: Runs with 1 worker, 2 retries
- Uses trace recording for failed tests
- Generates HTML report for artifacts

## Best Practices

1. **Keep tests independent**: Each test should set up its own data
2. **Use meaningful assertions**: Check for actual user-visible outcomes
3. **Wait for dynamic content**: Use `waitForLoadState('networkidle')`
4. **Avoid hard-coded waits**: Use `expect()` with timeouts instead
5. **Test happy paths**: Focus on typical user workflows

## Maintenance

- Update selectors if UI changes
- Add new tests for new features
- Keep test data realistic and independent
- Review failed tests regularly in HTML reports
- Update timeouts if app performance changes
