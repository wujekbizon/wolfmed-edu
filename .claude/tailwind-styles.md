# Tailwind CSS v4 Styling Guide

**Version:** Tailwind CSS v4  
Last Updated: October 31, 2025  
**Configuration File:** `globals.css`

## Core Principles

### 1. CSS-First Configuration (v4 Change)
Tailwind v4 moves configuration from JavaScript to CSS using the `@theme` directive in `globals.css`.

**NEVER modify `tailwind.config.js`** - all customization happens in `globals.css`:
```css
@theme {
  --custom-property: value;
}
```

### 2. Import Structure
```css
@import "tailwindcss";        /* Base Tailwind v4 */
@import "uploadthing/tw/v4";  /* Third-party integrations */
@source "path/to/components"; /* Component scanning */
```

## Custom Animations

### Adding New Animations
All custom animations are defined in `globals.css` under `@theme` directive.

**Pattern:**
1. Define CSS variable with animation shorthand
2. Create corresponding @keyframes
3. Use via utility class

**Example:**
```css
@theme {
  /* 1. Define animation variable */
  --animate-bounce: bounce 1s ease-in-out infinite;
  
  /* 2. Create keyframes */
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
}
```

**Usage in components:**
```tsx
<div className="animate-bounce">Bouncing element</div>
```

### Existing Animations
Our project includes these custom animations:

- `--animate-slideInDown` - Slide from top with fade
- `--animate-slideInUp` - Slide from bottom with border-radius morph
- `--animate-slideInLeft` - Slide from left with fade
- `--animate-slideInRight` - Slide from right with fade
- `--animate-fadeInUp` - Gentle fade up
- `--animate-scaleIn` - Scale from 0.35 to 1
- `--animate-gradient` - Opacity pulse for gradients
- `--animate-gradientPosition` - Background position shift
- `--animate-gradientScale` - Scale pulse
- `--animate-gradientRotate` - Multi-color gradient rotation
- `--animate-radialPulse` - Radial scaling pulse

**Usage pattern:**
```tsx
<div style={{ '--slidein-delay': '0.2s' }} 
     className="animate-slideInUp">
  Content with delayed animation
</div>
```

## Custom Properties (CSS Variables)

### Theme Variables
All design tokens are defined as CSS variables in `@theme`:

```css
@theme {
  /* Colors */
  --background: hsl(255 100% 100%);
  --foreground: hsl(240 10% 3.9%);
  --primary: hsl(240 5.9% 10%);
  --primary-foreground: hsl(0 0% 98%);
  
  /* Spacing */
  --radius: 0.5rem;
  
  /* Breakpoints (v4 feature) */
  --breakpoint-xs: 480px;
}
```

**Usage:**
```tsx
<div className="bg-(--background) text-(--foreground)">
  Content
</div>
```

### Animation Delays
Use `--slidein-delay` for staggered animations:
```tsx
{items.map((item, i) => (
  <div 
    key={item.id}
    style={{ '--slidein-delay': `${i * 0.1}s` }}
    className="animate-fadeInUp"
  >
    {item.content}
  </div>
))}
```

## Custom Utilities

### Creating Custom Utility Classes
Define in `@layer utilities` in `globals.css`:

```css
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #fcf2f1 white;
  }
  
  .custom-shadow {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}
```

### Existing Custom Utilities
- `.scrollbar-thin` - Thin scrollbar styling
- `.scrollbar-webkit` - Comprehensive webkit scrollbar with arrows
  - Custom track, thumb, button styling
  - Hover effects included
  - Arrow indicators for scroll direction

## Dark Mode

### Pattern
Dark mode overrides are defined in `@layer base`:

```css
@layer base {
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* ... other overrides */
  }
}
```

**Usage:**
```tsx
<html className="dark"> {/* or toggle dynamically */}
  <body className="bg-(--background)">
    {/* Dark mode applied automatically */}
  </body>
</html>
```

## Responsive Design

### Breakpoints (v4 Custom)
Custom breakpoints defined in `@theme`:
```css
@theme {
  --breakpoint-xs: 480px;
}
```

**Usage:**
```tsx
<div className="text-sm xs:text-base md:text-lg">
  Responsive text
</div>
```

### Standard Breakpoints
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px
- `xs:` - 480px (custom)

## Best Practices

### 1. Use Existing Variables First
Before creating new custom properties, check if existing ones can be used:
```tsx
/* ❌ Bad */
<div className="bg-white text-black">

/* ✅ Good */
<div className="bg-(--background) text-(--foreground)">
```

### 2. Animation Composition
Combine animations thoughtfully:
```tsx
<div className="animate-slideInUp hover:scale-105 transition-transform">
  Interactive animated element
</div>
```

### 3. Semantic Naming
When adding new CSS variables, use semantic names:
```css
/* ❌ Bad */
--color-1: hsl(240 10% 3.9%);

/* ✅ Good */
--card-background: hsl(240 10% 3.9%);
```

### 4. Keep Animations Performant
Prefer `transform` and `opacity` for animations:
```css
/* ✅ Good - GPU accelerated */
@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ❌ Bad - causes reflow */
@keyframes slideIn {
  from { left: -100px; }
  to { left: 0; }
}
```

### 5. Scrollbar Styling
Use existing `.scrollbar-webkit` or `.scrollbar-thin` utilities:
```tsx
<div className="overflow-auto scrollbar-webkit">
  {/* Scrollable content with custom scrollbar */}
</div>
```

## Common Patterns

### Hero Section with Animated Background
```tsx
<section className="relative overflow-hidden">
  <div className="absolute inset-0 animate-gradientRotate 
                  opacity-20 blur-3xl" />
  <div className="relative z-10 animate-fadeInUp">
    Content
  </div>
</section>
```

### Staggered List Animation
```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    style={{ '--slidein-delay': `${index * 0.1}s` }}
    className="animate-slideInLeft"
  >
    {item.content}
  </div>
))}
```

### Card with Hover Effect
```tsx
<div className="bg-(--card) border border-(--border) 
                rounded-(--radius) hover:scale-105 
                transition-transform duration-300">
  Card content
</div>
```

## Migration from v3

### Key Differences
1. **No tailwind.config.js** - Use `@theme` in CSS
2. **Import syntax** - `@import "tailwindcss"` instead of directives
3. **CSS variables** - Direct CSS variable definition in `@theme`
4. **@source directive** - New way to specify content paths

### Converting v3 Config to v4
```javascript
// v3 - tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#000000'
      }
    }
  }
}
```

```css
/* v4 - globals.css */
@theme {
  --color-primary: #000000;
}
```

## Troubleshooting

### Animation Not Working
1. Check if `@keyframes` is defined in `@theme` block
2. Verify animation variable follows `--animate-*` naming
3. Ensure `animate-[var(--animate-name)]` syntax is correct

### Custom Property Not Applied
1. Confirm definition is in `@theme` block
2. Check for typos in variable name
3. Use `var(--property-name)` syntax in class

### Scrollbar Styles Not Showing
1. Ensure element has `overflow-auto` or `overflow-scroll`
2. Content must exceed container height/width
3. Check browser compatibility (webkit prefixes for Chrome/Safari)

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [CSS Variables in Tailwind](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [Animation Documentation](https://tailwindcss.com/docs/animation)

---

**Quick Reference Card:**
- New animation? → Add to `@theme` in `globals.css`
- New color? → Add CSS variable to `@theme`
- New utility? → Use `@layer utilities` in `globals.css`
- Dark mode? → Override in `@layer base .dark`
- Custom breakpoint? → Add `--breakpoint-*` to `@theme`