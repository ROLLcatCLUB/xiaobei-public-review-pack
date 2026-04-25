# Prep Mainline Overview

## Product gate

The current product gate is:

1. allow **quick prep for one lesson**
2. keep **teaching plan adjustable**
3. split homepage by **user intent first**

This means the system should support both:

- a full prep path
- a short quick-prep path

## Current mainline

```text
Teaching Calendar
-> Formal Lesson Picker
-> Preclass Brief
-> Rapid Draft (primary)
-> Refine Workspace (when needed)
-> Save draft
-> Continue editing later
```

## Fast path

```text
Prep Entry Hub
-> Quick Prep One Lesson
-> Light Lesson Selection
-> Short Orientation
-> Rapid Draft
-> Save
```

## Page roles

### 1. Prep Entry Hub

File:
- [../frontend/xiaobei_prepare_desktop_preview.html](../frontend/xiaobei_prepare_desktop_preview.html)

Role:
- split user intent
- continue previous prep
- enter quick prep
- adjust / view semester arrangement

### 2. AI Semester Planner

File:
- [../frontend/xiaobei_ai_semester_planner_preview.html](../frontend/xiaobei_ai_semester_planner_preview.html)

Role:
- mock AI planner wizard
- build a semester arrangement draft
- read teacher profile schedule by default

### 3. Teaching Calendar

File:
- [../frontend/xiaobei_teaching_calendar_preview.html](../frontend/xiaobei_teaching_calendar_preview.html)

Role:
- show semester arrangement
- keep both original plan and actual execution
- support adjustment mode

### 4. Formal Lesson Picker

File:
- [../frontend/xiaobei_formal_lesson_picker_preview.html](../frontend/xiaobei_formal_lesson_picker_preview.html)

Role:
- pick one real lesson task
- write the minimal lesson context
- support standard path and fast path

### 5. Preclass Brief

File:
- [../frontend/xiaobei_preclass_brief_preview.html](../frontend/xiaobei_preclass_brief_preview.html)

Role:
- orient the teacher before generation
- not a generation page
- not a mini lesson plan

### 6. Draft Prep

File:
- [../frontend/xiaobei_prepare_draft_preview.html](../frontend/xiaobei_prepare_draft_preview.html)

Role:
- rapid draft is the primary next step
- minimal draft remains secondary
- supports save / restore / continue editing

### 7. Refine Workspace

File:
- [../frontend/xiaobei_prepare_refine_preview.html](../frontend/xiaobei_prepare_refine_preview.html)

Role:
- continue from the same lesson and same draft chain
- support shared main draft + class-level differences
- support save / restore

## Current non-goals

These are intentionally not part of this review pack:

- execution dashboard as phase-1 homepage
- assignment collection workflow
- student learning dashboard
- real login/account system
- complex agentic AI orchestration
- deep backend refactor
