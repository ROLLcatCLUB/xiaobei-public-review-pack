# Visual Language Rules V1

This file freezes the current visual language used by `clean-prototype-v1`.

The goal is simple:

**make the design center and execution center feel like one product system instead of several prototype styles stitched together.**

## 1. Scope

This standard applies to:

- Design Center
- Execution Center
- Supporting pages (Profile / Planner / Assistant)

## 2. Core principles

### 2.1 Distinguish role before content

Every page should make these distinctions obvious:

- navigation vs editing
- information vs status
- explanation vs real content

### 2.2 Same object, same visual grammar

Do not let:

- navigation cards look like edit cards
- edit cards look like passive info panels
- status panels look like action buttons

## 3. Shell rules

### 3.1 Left sidebar

- deep teal background
- light cyan foreground
- active item uses a light cyan card
- first-level nav = center switching
- second-level nav lives under the first-level item, not as a floating top menu

### 3.2 Top bar

- narrow and compressed
- left side only shows the current page label
- no oversized teacher identity headline
- profile / assistant settings live on the top right

## 4. Color semantics

### Primary action

- cyan gradient
- used for the most important action on the page

### Editing

- white or light blue-white surface
- inputs stay pure white

### Information

- soft cyan / soft neutral tinted surface
- used for read-only identity and summary blocks

### Status

- pale cyan surface
- lighter and calmer than editing

### Guidance text

- weaker color
- always lighter than real content text

## 5. Card grammar

### Navigation cards

- lightweight surface
- hover lift
- used for “go somewhere / next step”

### Edit cards

- clearer border
- stronger shadow than info cards
- contain real form controls

### Info cards

- tinted surface
- visually quieter than edit cards

### Status cards

- soft tinted surface
- used for current state / saved state / draft stage

## 6. Button grammar

### Primary button

- cyan gradient
- strongest action

### Secondary button

- white surface with light border
- return / view / secondary action

### Edit buttons

- should not look like plain text links
- should have clear hover feedback

## 7. Icon grammar

- use thin SVG line icons
- avoid heavy outlines
- icons support content, they do not lead the page

## 8. Text hierarchy

- `h1`: one clear page title
- `h2`: section / card title
- `small / meta`: lighter support line
- guide text must never compete with real content

## 9. Reference pages

Current visual reference pages:

- `frontend/design-center.html`
- `frontend/unit-design.html`
- `frontend/lesson-design.html`
- `frontend/calendar.html`
- `frontend/brief.html`

## 10. Anti-patterns

Avoid reintroducing:

- menus that look like edit cards
- guidance text with the same weight as actual content
- mixed purple/green/cyan primary action systems
- oversized identity headlines in the top bar

## 11. One-line summary

**Sidebar = navigation, white = editing, tinted surfaces = information, cyan = action, lighter text = explanation.**
