# Screenshot Guide

This project uses Playwright to generate consistent UI screenshots for documentation and the README.

## Locations

All screenshots live in `docs/screenshots/` and are referenced relatively in the README so they work on GitHub Pages.

## Naming Convention

Base names represent feature areas. Suffixes:

- `-desktop` : 1200px wide viewport
- `-mobile`  : 390px wide viewport
- No suffix  : generic / primary view

Example set for a feature:

```text
boost.png
boost-desktop.png
boost-mobile.png
boost.svg (optional vector placeholder)
```

## Updating Screenshots

1. Run the app: `npm run dev`
2. (Optional) Use Playwright for automated capture: `npm run screenshots`
3. Manually verify clarity (avoid personal data) and that dark/light modes are showcased where relevant.
4. Optimize (runs automatically in `screenshots` script) or manually with `npm run screenshots:optimize`.

## Adding A New Feature Section

1. Capture screenshots with the same widths as existing ones.
2. Save into `docs/screenshots/` following naming convention.
3. Add them to the README using relative paths: `![Feature](docs/screenshots/feature.png)`.

## Accessibility & Quality Tips

- Prefer light mode for primary shots unless dark mode is the subject.
- Avoid scrollbars; resize content or container where possible.
- Keep consistent padding around the main content region.
- Use production build (`npm run build && npm run preview`) for pixel‑accurate layout.

## Housekeeping

Remove obsolete screenshots when refactoring sections to keep the repository lean. Consider running lossless compression on large additions.
