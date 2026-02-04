---
name: Magnate Design System
description: Design system and brand guidelines for Magnate landing site
version: 1.0
---

# Magnate Landing Site - Design System & Guidelines

## Brand Overview
Magnate is a B2B narrative consultancy helping founders tell stories that build trust and drive growth. The brand is editorial, confident, and premium - not corporate or generic.

---

## Color System

```css
--gold: #ffde59          /* Primary accent - emphasis, CTAs, highlights */
--gold-light: #ffeb8a    /* Hover states */
--bg-dark: #0D0D0F       /* Page background */
--bg-card: #141416       /* Card backgrounds */
--text-primary: #FFFFFF  /* Headings, important text, white body text */
--text-secondary: #B8B8C0 /* Body text, descriptions (lighter gray) */
--border-color: #27272A  /* Card borders, dividers */
```

### When to Use Each Color
- **Gold (#ffde59)**: Emphasis lines, key statements, CTAs, checkmarks, labels, section tags
- **White (#FFFFFF)**: Headings, lead text (opening statements), conclusion lines base color
- **Gray (#B8B8C0)**: Regular body text, descriptions, list items, card content
- **Never**: Don't use gold for large blocks of text. It's for emphasis moments only.

---

## Typography

### Font Family
- **Primary**: 'Inter Tight', sans-serif
- **Display/Logo**: 'Moon Get' (heavy weight, logos only)

### Heading Hierarchy
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| H1 (page titles) | clamp(2.5rem, 5.5vw, 4rem) | 800 | White |
| H2 (section titles) | clamp(1.75rem, 4vw, 2.5rem) | 800 | White |
| H3 (card headings) | 1.2rem | 700 | White |

### Text Patterns
| Pattern | Size | Weight | Color | Use Case |
|---------|------|--------|-------|----------|
| Body text | 1.15rem or 1rem | 500 | Gray | Regular paragraphs |
| Lead text | 1.15rem | 500 | White | Opening statements that aren't emphasis |
| Gold emphasis | 1.2rem | 700 | Gold | Key standalone statements |
| Conclusion lines | 1.15rem | 600 base | White + Gold spans | End-of-section summaries |
| Section tags | 0.85rem | 600 | Gold | Uppercase labels above headings |
| Card labels | 0.9rem | 700 | Gold | Uppercase category labels |

### Emphasis Pattern (Gold Text)
When a section needs a key statement highlighted:
- Use gold color (#ffde59)
- Font weight 700
- Font size 1.2rem for standalone, or use `.gold` class within conclusion lines
- Examples: "Real voice. Real judgment. Real impact." or "If that's you — we should talk."

### Conclusion Line Pattern (Mixed Gold/White)
For end-of-section statements with partial emphasis:
```html
<p class="conclusion-class"><span class="gold">Key phrase here.</span> Rest of the sentence in white.</p>
```
- Base: 1.15rem, weight 600, white
- Gold span: weight 700

---

## Component Patterns

### Cards
- Background: var(--bg-card)
- Border: 1px solid var(--border-color)
- Border radius: 16px (large cards) or 12px (smaller cards)
- Padding: 36-40px
- No hover effects unless specifically needed

### Section Tags
```html
<span class="section-tag">About Magnate</span>
```
- Gold color, uppercase, 0.85rem, weight 600, letter-spacing 0.1em

### Buttons
- Primary: Gold background, dark text
- Large: padding 16px 32px, font-size 1.1rem

### Month/Status Badges
- All badges use gold consistently (not gray for "ongoing")
- Gold left border (2px), subtle gold background
- Gold uppercase label

---

## Spacing Conventions

### Section Padding
- Standard sections: 80px vertical padding
- Hero sections: 180px top, 100px bottom
- Mobile: Reduce to ~80px top for hero

### Element Spacing
- After H2 headings: 40-48px margin-bottom
- After section tags: 16-24px margin-bottom
- Between paragraphs: 20-24px
- Card gaps: 32px
- Conclusion text margin-top: 48px

---

## Design Principles

1. **Consistency over creativity**: Every text style should match an established pattern
2. **Gold is for emphasis**: Use sparingly for key moments, not decoration
3. **White for importance, gray for body**: Lead text and conclusions are white; descriptions are gray
4. **No floating decorations**: Avoid decorative quote marks, random borders, or ornamental elements
5. **Cards should match**: All cards in a section use identical styling
6. **Symmetry matters**: Two-column layouts should have equal visual weight

---

## Common Mistakes to Avoid

1. Using different font sizes for similar elements across sections
2. Making body text white when it should be gray
3. Using gold for entire paragraphs (use for key phrases only)
4. Inconsistent font weights (stick to 500, 600, 700, 800)
5. Adding decorative elements (floating quotes, unnecessary icons)
6. Different card styles in the same section
7. Forgetting to bump CSS version after changes (use ?v=XX)

---

## File Structure

```
magnate-landing/
├── index.html              # Homepage
├── about.html              # About page
├── blog.html               # Blog page
├── contact.html            # Contact page
├── services.html           # Services overview
├── industries.html         # Industries overview
├── styles.css              # Main stylesheet (bump ?v=XX after changes)
├── SKILL.md                # This design system file
├── fonts/                  # Font files
├── images/
│   ├── logos/              # Brand logos, favicon, client logos
│   ├── backgrounds/        # Background images
│   └── photos/             # Team/founder photos
├── services/               # Service detail pages
│   ├── linkedin-storytelling.html
│   └── company-narrative.html
└── industries/             # Industry vertical pages
    ├── tech.html
    ├── solo-entrepreneurs.html
    ├── franchises.html
    ├── cpg.html
    ├── wellness.html
    └── raising-capital.html
```

---

## CSS Version
Always bump the CSS version number when making style changes:
```html
<link rel="stylesheet" href="styles.css?v=XX">
```
