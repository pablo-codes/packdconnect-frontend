---
name: Warm Tactile Minimalism
colors:
  surface: "#fff8f3"
  surface-dim: "#dfd9d4"
  surface-bright: "#fff8f3"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f9f2ed"
  surface-container: "#f3ede7"
  surface-container-high: "#ede7e2"
  surface-container-highest: "#e7e1dc"
  on-surface: "#1d1b18"
  on-surface-variant: "#594139"
  inverse-surface: "#32302d"
  inverse-on-surface: "#f6f0ea"
  outline: "#8d7168"
  outline-variant: "#e1bfb5"
  surface-tint: "#ab3500"
  primary: "#ab3500"
  on-primary: "#ffffff"
  primary-container: "#ff6b35"
  on-primary-container: "#5f1900"
  inverse-primary: "#ffb59d"
  secondary: "#4a654e"
  on-secondary: "#ffffff"
  secondary-container: "#c9e8cb"
  on-secondary-container: "#4e6952"
  tertiary: "#605e58"
  on-tertiary: "#ffffff"
  tertiary-container: "#9c9992"
  on-tertiary-container: "#32312c"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdbd0"
  primary-fixed-dim: "#ffb59d"
  on-primary-fixed: "#390c00"
  on-primary-fixed-variant: "#832600"
  secondary-fixed: "#cceace"
  secondary-fixed-dim: "#b0ceb2"
  on-secondary-fixed: "#07200f"
  on-secondary-fixed-variant: "#334d38"
  tertiary-fixed: "#e6e2da"
  tertiary-fixed-dim: "#cac6bf"
  on-tertiary-fixed: "#1c1c17"
  on-tertiary-fixed-variant: "#484741"
  background: "#fff8f3"
  on-background: "#1d1b18"
  surface-variant: "#e7e1dc"
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: "800"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "500"
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "700"
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

This design system centers on a "Human-Centric Tactile" aesthetic, blending the clarity of minimalism with the physical comfort of soft-touch materials. The target audience values intentionality, wellness, and high-quality craft. The emotional response should be one of "calm energy"—where the warm, neutral canvas provides a restful backdrop for the vibrant, high-energy primary accents.

The style rejects the coldness of traditional tech minimalism in favor of a tactile, card-based interface. It utilizes generous negative space, exaggerated roundedness, and subtle depth to make digital interactions feel like handling premium physical stationery. There is no transparency or glassmorphism; every layer is opaque, grounded, and structurally sound.

## Colors

The palette is anchored by **Warm Cream (#F8F6F0)**, which serves as the primary canvas color to reduce eye strain and provide a more organic feel than pure white. **Alabaster Beige (#EFEBE3)** is used for secondary containers and "sunken" surfaces to create a clear visual hierarchy.

**Tangerine Punch (#FF6B35)** is the high-visibility primary color, reserved strictly for calls to action, active states, and critical information. **Soft Sage Green (#8BA88E)** acts as a harmonic secondary, used for success states or subtle categorical distinctions. All text and iconography utilize **Espresso Black (#1C1A17)** to maintain high legibility and a sophisticated, grounded contrast.

## Typography

This design system uses **Plus Jakarta Sans** across all levels to maintain a friendly, modern, and cohesive look. The typeface's soft, geometric curves mirror the large border radii used in the UI components.

Headlines should use heavy weights (700-800) with slight negative letter-spacing to create a "locked-in," editorial feel. Body text is set with generous line-height to ensure readability against the warm background. Labels and small captions utilize increased letter-spacing and semi-bold weights to maintain clarity at smaller scales.

## Layout & Spacing

The layout follows a **fluid grid system** built on an 8px base unit. To emphasize the minimalist aesthetic, the system uses "excessive" whitespace (the `xl` unit) to separate major sections, allowing content to breathe and reducing cognitive load.

- **Desktop:** 12-column grid with 64px side margins. Containers should have a maximum width of 1280px to maintain comfortable line lengths.
- **Tablet:** 8-column grid with 32px side margins.
- **Mobile:** 4-column grid with 20px side margins.

Spacing between cards should rely on the `md` (24px) unit to ensure that shadows do not overlap and blur the visual boundaries of individual elements.

## Elevation & Depth

Depth is created through a combination of **Tonal Layering** and **Ambient Shadows**.

1. **Base Layer:** Warm Cream (#F8F6F0).
2. **Sunken/Secondary Layer:** Alabaster Beige (#EFEBE3) with an `inset` shadow or a 1px solid stroke in a slightly darker beige to indicate fields or secondary areas.
3. **Raised Layer (Cards/Buttons):** These use the `primary_color` or white, paired with a very soft, highly diffused shadow (e.g., `0px 10px 30px rgba(28, 26, 23, 0.05)`).

The goal is a "natural light" effect—shadows should be barely perceptible, serving to lift the element off the page without creating a muddy or "dirty" appearance. No harsh black shadows; always use a low-opacity version of the neutral Espresso Black.

## Shapes

The shape language is defined by **exaggerated roundness**. This reinforces the tactile, friendly nature of the brand.

- **Small Components (Tags, Badges):** Fully pill-shaped.
- **Standard Components (Buttons, Input Fields):** Pill-shaped (rounded-full).
- **Containers (Cards, Modals):** Use `rounded-3xl` (1.5rem to 2rem) to create a soft, approachable frame.
- **Selection States:** Use a thick 3px solid stroke or a subtle "pressed" inner shadow to maintain the tactile metaphor.

## Components

- **Buttons:** Primary buttons are pill-shaped, filled with Tangerine Punch, with Espresso Black text. Hover states involve a slight upward float (negative Y-offset) and an increase in shadow spread.
- **Cards:** White or Alabaster Beige backgrounds with `rounded-3xl` corners. Cards must have a minimum internal padding of `md` (24px).
- **Input Fields:** Pill-shaped with a 1px solid border in Alabaster Beige. On focus, the border thickens to 2px and changes to Soft Sage Green or Tangerine Punch.
- **Chips/Badges:** Small pill-shaped containers with a Soft Sage Green background and dark green text for a "natural" categorization feel.
- **Lists:** Items are separated by generous vertical spacing rather than divider lines. If dividers are used, they should be Alabaster Beige and 2px thick.
- **Checkboxes & Radios:** Exaggerated size (24px) with high-contrast active states using the primary color.
