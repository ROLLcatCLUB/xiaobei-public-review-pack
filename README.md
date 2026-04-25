# Xiaobei Public Review Pack

This folder is a **sanitized public review pack** for the Xiaobei prep-system prototype.

It is intended for:

- publishing to a temporary public GitHub repo
- sharing with cloud GPT for stage-by-stage review
- reviewing the current prep-system mainline without exposing the whole internal repository

## What is included

This pack only includes the current **prep mainline prototype**:

```text
Prep Entry Hub
-> AI Semester Planner
-> Teaching Calendar
-> Formal Lesson Picker
-> Preclass Brief
-> Draft Prep (Minimal / Rapid)
-> Refine Workspace
```

It also includes the shared prototype shell and shared prototype truth-source file.

## What is intentionally NOT included

This pack does **not** include:

- student or teacher real-world data exports
- Feishu inventory/reference documents
- staging or deployment reports
- server paths / nginx configs
- internal handoff files with local machine paths
- teaching-execution phase pages outside the current prep mainline

## Review order

1. [docs/review-brief.md](./docs/review-brief.md)
2. [docs/mainline-overview.md](./docs/mainline-overview.md)
3. [frontend/xiaobei_prepare_desktop_preview.html](./frontend/xiaobei_prepare_desktop_preview.html)
4. [frontend/xiaobei_ai_semester_planner_preview.html](./frontend/xiaobei_ai_semester_planner_preview.html)
5. [frontend/xiaobei_teaching_calendar_preview.html](./frontend/xiaobei_teaching_calendar_preview.html)
6. [frontend/xiaobei_formal_lesson_picker_preview.html](./frontend/xiaobei_formal_lesson_picker_preview.html)
7. [frontend/xiaobei_preclass_brief_preview.html](./frontend/xiaobei_preclass_brief_preview.html)
8. [frontend/xiaobei_prepare_draft_preview.html](./frontend/xiaobei_prepare_draft_preview.html)
9. [frontend/xiaobei_prepare_refine_preview.html](./frontend/xiaobei_prepare_refine_preview.html)

## Prototype assumptions

- All pages assume the user is already logged in.
- Teacher profile / schedule are maintained in:
  - [frontend/xiaobei_user_profile_preview.html](./frontend/xiaobei_user_profile_preview.html)
- The floating AI assistant is a global front-end shell, not a standalone product page:
  - [frontend/xiaobei_ai_assistant_panel_preview.html](./frontend/xiaobei_ai_assistant_panel_preview.html)
- Current draft truth source is still prototype-local:
  - [frontend/xiaobei_prep_truth_source_v1.js](./frontend/xiaobei_prep_truth_source_v1.js)

## Why this pack exists

The internal repo contains non-public materials and should not be made public as a whole.

This folder exists so we can:

- keep the prototype review process fast
- expose only the pages and docs needed for review
- avoid leaking unrelated private or internal operational materials
