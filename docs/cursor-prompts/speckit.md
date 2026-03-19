# Speckit-style workflow in Cursor Chat

Use this file as copy/paste prompts for a Spec → Plan → Tasks → Implement loop.

## How to start (one-time per feature)

1) Create a feature folder + branch:

```bash
pwsh ./.specify/scripts/powershell/create-new-feature.ps1 -Json "YOUR FEATURE DESCRIPTION"
```

2) Create the plan template:

```bash
pwsh ./.specify/scripts/powershell/setup-plan.ps1 -Json
```

3) (Optional but recommended) refresh Cursor rules from the plan:

```bash
pwsh ./.specify/scripts/powershell/update-agent-context.ps1 -AgentType cursor-agent
```

Then use the prompts below in Cursor Chat.

---

## Prompt: SPECIFY (create/upgrade spec.md)

Paste into Cursor Chat:

```text
You are writing a feature spec for this repo.

Update `specs/<FEATURE>/spec.md` based on this feature description:
<PASTE DESCRIPTION HERE>

Constraints:
- Write for stakeholders: focus on WHAT/WHY, not implementation.
- Include user stories, acceptance criteria, edge cases, assumptions.
- Keep it consistent with the existing product domain and terminology.

After updating, list any open questions (max 3).
```

---

## Prompt: PLAN (create/upgrade plan.md)

Paste into Cursor Chat:

```text
Create/upgrade `specs/<FEATURE>/plan.md` for implementing the feature described in `specs/<FEATURE>/spec.md`.

Repo context:
- Next.js app router + TypeScript
- Postgres (DATABASE_URL), Docker Compose for local DB

Plan requirements:
- Architecture & file-level plan (what files to add/change)
- Data model & migrations (if needed)
- API routes, validation, error handling patterns
- UI/UX flow changes
- Risks and mitigations
- Non-goals and scope boundaries

If something is unknown, mark it as NEEDS CLARIFICATION with a specific question (max 3).
```

---

## Prompt: TASKS (generate tasks.md)

Paste into Cursor Chat:

```text
Generate `specs/<FEATURE>/tasks.md` from:
- `specs/<FEATURE>/spec.md`
- `specs/<FEATURE>/plan.md`

Rules:
- Use strict checklist lines: `- [ ] T### [P] [US#] Description with file path(s)`
- Order tasks by dependencies (setup → foundational → user stories → polish)
- Each task must be independently executable and include the file path(s)
- Only include test tasks if the spec explicitly asks for tests or if they are necessary for safety

Also include:
- A short dependency graph / ordering notes
- Parallel execution suggestions (only for tasks marked [P])
```

---

## Prompt: IMPLEMENT (execute a slice of tasks)

Paste into Cursor Chat:

```text
Implement tasks T00X–T00Y from `specs/<FEATURE>/tasks.md`.

Rules:
- Make minimal, high-quality changes; keep existing conventions.
- Update the corresponding checkboxes in `tasks.md` as you complete tasks.
- Run the fastest relevant checks (lint/build/tests) for touched areas when possible.
- If a task reveals missing requirements, update `spec.md`/`plan.md` and adjust tasks accordingly.

At the end, summarize what changed and what to do next.
```

