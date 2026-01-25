---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

## Responsive & Cross-Platform Checklist

Every frontend implementation MUST consider multi-device experiences. Before finalizing any component or page, verify the following:

### Layout Strategy Decision

Ask: "Do mobile and desktop need fundamentally different experiences?"

- **Simple responsive**: Same layout structure, just scaled/reflowed (use breakpoint modifiers like `md:`, `lg:`)
- **Separate layouts**: Completely different UI patterns per device (use `hidden`/`block` toggles to render distinct components)

Choose separate layouts when:
- The interaction model differs (tap vs hover, scroll vs click)
- Information hierarchy should change dramatically
- Visual density requirements conflict between devices

### Device-Specific Theming

Consider whether the same color theme works across all contexts:

- Light backgrounds may work better on mobile (outdoor readability, battery on OLED)
- Dark themes may suit desktop (extended viewing, immersive experience)
- If splitting themes, use consistent breakpoint patterns: `bg-light md:bg-dark`, `text-accent-mobile md:text-accent-desktop`

### Screen Orientation Handling

For layouts with hero images or full-screen visuals:

- Use `portrait:` and `landscape:` modifiers for orientation-specific adjustments
- Adjust image focal points: `object-center portrait:object-[x%_y%]`
- Consider aspect ratio differences between phone portrait and desktop landscape

### Image Optimization

For every significant image:

- [ ] Use framework's optimized Image component (Next.js Image, etc.)
- [ ] Set appropriate `sizes` attribute for responsive loading
- [ ] Use `priority` for above-the-fold/LCP images
- [ ] Apply `object-fit` and `object-position` for cropping control
- [ ] Test image focal points across all breakpoints and orientations

### Responsive Scale System

Maintain consistent scaling ratios:

- **Typography**: Define a scale (e.g., `text-sm md:text-base`, `text-2xl md:text-4xl`)
- **Spacing**: Scale padding/margins proportionally (e.g., `py-12 md:py-24`, `gap-3 md:gap-6`)
- **Components**: Scale interactive elements (e.g., `w-10 h-10 md:w-12 md:h-12` for icons)

Avoid arbitrary values; use a consistent multiplier across breakpoints.

### Conditional UI Elements

Identify elements that should appear/disappear per device:

- **Desktop-only**: Complex decorations, hover-dependent features, wide data tables
- **Mobile-only**: Simplified navigation, touch-optimized controls, condensed layouts
- Use `hidden md:block` / `md:hidden` patterns consistently

### Media Embeds (Video, Maps, etc.)

For embedded content:

- [ ] Use `aspect-video` or `aspect-square` to maintain ratios
- [ ] Wrap iframes in relative containers with absolute positioning
- [ ] Test controls accessibility on touch devices

### Touch vs Pointer Interactions

Design for both input methods:

- Hover states should have touch equivalents (active states, tap feedback)
- Touch targets minimum 44x44px on mobile
- Consider `@media (hover: hover)` for hover-only enhancements

### Favicon & Meta Assets

Before deployment, verify:

- [ ] Favicon in multiple sizes (16x16, 32x32, 180x180 for Apple Touch)
- [ ] Consider using favicon generator tools for comprehensive coverage
- [ ] OpenGraph image for social sharing
- [ ] Theme color meta tag for mobile browser chrome

### Testing Checklist

Before considering any page complete:

- [ ] Mobile portrait (375px width)
- [ ] Mobile landscape
- [ ] Tablet portrait (768px)
- [ ] Tablet landscape
- [ ] Desktop (1280px+)
- [ ] Ultra-wide displays (1920px+)
- [ ] Portrait monitor orientation (rotated desktop display)

### Common Pitfalls to Avoid

- **Forgetting mobile-first**: Start with mobile constraints, enhance for desktop
- **Inconsistent breakpoints**: Pick a breakpoint system and use it everywhere
- **Orphaned hover states**: Every `:hover` should have a touch alternative
- **Fixed dimensions**: Avoid `px` for layout; prefer relative units and percentages
- **Untested orientations**: Portrait mode on desktop monitors is increasingly common
- **Missing touch feedback**: Mobile users need visual confirmation of interactions