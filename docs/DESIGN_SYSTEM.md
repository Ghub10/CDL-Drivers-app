# Design System
## CDL Drivers — Minimal, Accessible UI

---

## Color Palette

**Source of truth:** [`src/styles/theme.css`](../src/styles/theme.css) — edit CSS variables there, then add matching keys in `tailwind.config.js` if you introduce new tokens.

| Tailwind utility prefix | CSS variable | Default | Usage |
|-------------------------|--------------|---------|--------|
| `bg-primary` / `text-primary` | `--color-primary` | #1d4ed8 | Main actions, brand accent |
| `bg-primary-hover` (via `hover:bg-primary-hover`) | `--color-primary-hover` | #2563eb | Button hover |
| `bg-primary-muted` | `--color-primary-muted` | #eff6ff | Selected rows, soft highlights |
| `bg-accent` / `text-accent` | `--color-accent` | #0ea5e9 | Optional second brand color |
| `bg-accent-muted` | `--color-accent-muted` | #e0f2fe | Accent backgrounds |
| `text-text-secondary` | `--color-text-secondary` | #64748b | Captions, hints |
| `border-border` | `--color-border` | #e2e8f0 | Dividers |
| `bg-page` | `--color-page` | #f1f5f9 | Page background |

**Adding a new color:** See the comment block at the top of `theme.css`.

---

## Typography Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 1.75rem | 700 | 1.2 |
| H2 | 1.5rem | 600 | 1.3 |
| H3 | 1.25rem | 600 | 1.4 |
| Body | 1rem | 400 | 1.5 |
| Small | 0.875rem | 400 | 1.5 |
| Caption | 0.75rem | 400 | 1.4 |

**Font family:** System stack — `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`

---

## Spacing Scale

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Tight gaps |
| sm | 8px | Between related items |
| md | 16px | Section padding |
| lg | 24px | Card padding |
| xl | 32px | Page margins |
| 2xl | 48px | Large gaps |

---

## Buttons

**Primary**
- Background: Primary
- Text: White
- Padding: 12px 24px
- Border radius: 8px
- Min touch target: 44px height
- Hover: Primary Hover

**Secondary**
- Background: Transparent
- Border: 2px Secondary
- Text: Primary
- Same padding and radius

**Disabled**
- Opacity: 0.5
- No pointer events

---

## Inputs

- Height: 48px (touch-friendly)
- Border: 1px Secondary
- Border radius: 8px
- Padding: 12px 16px
- Focus: 2px ring Primary
- Error: Border Error color

---

## Cards

- Background: Surface
- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: lg

---

## Accessibility Notes

- All interactive elements: min 44x44px touch target
- Color contrast: WCAG AA minimum
- Form labels: visible, associated with inputs
- Focus indicators: visible outline
- Error messages: announced to screen readers
