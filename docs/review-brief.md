# Review Brief For GPT

Please review this pack as a **prototype-stage prep system**, not as a final production system.

## Scope to review

Only review the current prep mainline:

```text
Prep Entry Hub
-> Teaching Calendar / Formal Lesson Picker
-> Preclass Brief
-> Rapid Draft
-> Refine Workspace
-> Save / Continue Editing
```

## Important constraints

- user is assumed to be already logged in
- teacher profile / schedule live in the profile page
- AI assistant is a global floating helper shell
- current draft truth source is prototype-local on purpose

## Please answer these 5 questions

1. Is the current mainline smooth enough for a teacher to understand where to go next?
2. Which page is still most likely to confuse the teacher?
3. Which transition still feels like a prototype jump instead of a usable product flow?
4. Is the distinction between:
   - planning
   - selecting a lesson
   - orienting
   - drafting
   - refining
   now clear enough?
5. What is the smallest next improvement that would most improve the whole mainline?

## Please do NOT redirect the review toward

- rebuilding the whole backend
- designing a complex agent first
- phase-2 teaching execution dashboards
- real login system
- broad architecture rewrite

## Most important files

- [../frontend/xiaobei_prepare_desktop_preview.html](../frontend/xiaobei_prepare_desktop_preview.html)
- [../frontend/xiaobei_teaching_calendar_preview.html](../frontend/xiaobei_teaching_calendar_preview.html)
- [../frontend/xiaobei_formal_lesson_picker_preview.html](../frontend/xiaobei_formal_lesson_picker_preview.html)
- [../frontend/xiaobei_preclass_brief_preview.html](../frontend/xiaobei_preclass_brief_preview.html)
- [../frontend/xiaobei_prepare_draft_preview.html](../frontend/xiaobei_prepare_draft_preview.html)
- [../frontend/xiaobei_prepare_refine_preview.html](../frontend/xiaobei_prepare_refine_preview.html)
- [../frontend/xiaobei_prep_truth_source_v1.js](../frontend/xiaobei_prep_truth_source_v1.js)
