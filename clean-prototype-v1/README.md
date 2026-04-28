# Clean Prototype V1

This folder is a **review cut** of the Xiaobei prototype after separating the quick prep entrance from the teaching execution center.

It is intended for:

- one more GPT review before human review
- checking whether a teacher can quickly finish one lesson prep from the design side
- checking whether the teaching execution center remains a separate chain for class, homework, evaluation, and records
- reviewing the short default prep path without renaming the execution center into a prep system

## Review order

1. [docs/review-brief-clean.md](./docs/review-brief-clean.md)
2. [docs/visual-language-rules-v1.md](./docs/visual-language-rules-v1.md)
3. [frontend/entry.html](./frontend/entry.html)
4. [frontend/draft.html](./frontend/draft.html)
5. [frontend/picker.html](./frontend/picker.html)
6. [frontend/brief.html](./frontend/brief.html)
7. [frontend/refine.html](./frontend/refine.html)
8. [frontend/calendar.html](./frontend/calendar.html)

Supporting pages:

9. [frontend/design-center.html](./frontend/design-center.html)
10. [frontend/unit-design.html](./frontend/unit-design.html)
11. [frontend/lesson-design.html](./frontend/lesson-design.html)
12. [frontend/planner.html](./frontend/planner.html)
13. [frontend/knowledge-base.html](./frontend/knowledge-base.html)
14. [frontend/assistant.html](./frontend/assistant.html)

Stage-two pages, not mainline review:

- [frontend/classroom.html](./frontend/classroom.html)
- [frontend/assignments.html](./frontend/assignments.html)
- [frontend/evaluation.html](./frontend/evaluation.html)
- [frontend/class-record.html](./frontend/class-record.html)

## Prototype structure under review

```text
Teaching Center Home
-> Teaching Design Center quick prep
-> Recommended Lesson
-> Fast Draft Prep
-> Save / Continue Editing

Optional:
Formal Lesson Picker
-> Full Preclass Brief
-> Refine Workspace

Separate execution chain:
Teaching Execution Center
-> Semester Arrangement
-> Class
-> Homework Collection
-> Evaluation
-> Class Record
```

## Not the focus of this review

- execution dashboard
- homework collection
- student learning pages
- knowledge base administration
- login system
- large backend redesign
- complex agent orchestration
