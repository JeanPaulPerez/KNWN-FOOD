# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** KNWN-FOOD
**Generated:** 2026-02-10 11:15:00
**Category:** Restaurant/Food Service

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable | Tailwind |
|------|-----|--------------|----------|
| Primary | `#2B1C70` | `--color-primary` | `brand-primary` |
| Secondary | `#1E1549` | `--color-secondary` | `brand-dark` |
| Accent | `#5B5291` | `--color-accent` | `brand-accent` |
| Subtle | `#DDD9ED` | `--color-subtle` | `brand-subtle` |
| Background | `#F8F7FF` | `--color-background` | `brand-bg` |
| Text | `#2B1C70` | `--color-text` | `brand-primary` |
| White | `#FFFFFF` | `--color-white` | `brand-white` |

**Color Notes:** Deep purple branding with lavender accents. sophisticated and premium.

### Typography

- **Heading Font:** Instrument Serif
- **Body Font:** Instrument Sans
- **Mood:** premium, culinary, elegant, modern, sophisticated
- **Google Fonts:** [Instrument Serif + Instrument Sans](https://fonts.google.com/share?selection.family=Instrument+Sans:ital,wght@0,400..800;1,400..800|Instrument+Serif:ital@0;1)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..800;1,400..800&family=Instrument+Serif:ital@0;1&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #2B1C70;
  color: white;
  padding: 12px 24px;
  border-radius: 9999px; /* Pill shape */
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
  font-family: "Instrument Sans", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.btn-primary:hover {
  background: #1E1549;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #2B1C70;
  border: 1px solid #2B1C70;
  padding: 12px 24px;
  border-radius: 9999px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
  border: 1px solid rgba(43, 28, 112, 0.05);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #DDD9ED;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
  background: #FFFFFF;
}

.input:focus {
  border-color: #2B1C70;
  outline: none;
  box-shadow: 0 0 0 3px rgba(43, 28, 112, 0.1);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(43, 28, 112, 0.2);
  backdrop-filter: blur(8px);
}

.modal {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Premium, Minimalist, & Culinary

**Keywords:** Sophisticated, clean, deep colors, elegant typography, high contrast, chef-driven

**Best For:** Premium ghost kitchen, high-end food delivery

**Key Effects:** Pill-shaped buttons, glassmorphism (blur), deep purple accents, ample whitespace, serif headings

### Page Pattern

**Pattern Name:** Visual-First + Conversion

- **CTA Placement:** Above fold and sticky
- **Section Order:** Hero (Visual) > Menu Highlights > Story > CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Low-quality imagery
- ❌ Outdated hours

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Lucide)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout unexpectedly
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
