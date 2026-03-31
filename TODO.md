# Style Alignment TODO For Agents

## Context

The style reference is the current main page at `/` in the frontend. From the current codebase, that reference is defined primarily by:

- Warm cream background and warm border system from [filmoji-frontend/src/index.css](/Users/tobymiles/Filmoji/filmoji-frontend/src/index.css)
- Dark ink text instead of white-on-dark as the default page treatment
- Accent yellow as the main highlight color
- Rounded light cards with visible borders
- Shared utility classes such as `section`, `container-main`, `section-title`, `section-subtitle`, `card-base`, `card-hover`, `btn-primary`, `btn-outline`, and `input-field`

This TODO is based on the current repository state only. It is not a generic redesign brief.

## Goal

Bring non-home pages into the same visual system as the main page. Do not invent a second design language. Prefer reusing and extending the shared styles in `filmoji-frontend/src/index.css` over adding more one-off inline styles.

## Constraints

- Do not revert unrelated user changes already present in the worktree.
- Preserve current page behavior unless a style issue is tightly coupled to markup.
- Keep the home page as the visual reference, not the auth pages or dashboard.
- Reduce inline style usage where practical, especially on pages already using theme variables.

## Priority 1

These files are the clearest mismatches with the home-page style and should be addressed first.

### 1. Categories page title color mismatch

File:

- `filmoji-frontend/src/pages/Categories.jsx`

Issue:

- The page uses the light global background but the main heading is `text-white`, which conflicts with the home-page palette.

Expected direction:

- Convert heading/subheading/layout to the same typography treatment used across the home page.

### 2. Auth pages still use a separate dark split-screen style

Files:

- `filmoji-frontend/src/pages/Login.jsx`
- `filmoji-frontend/src/pages/Register.jsx`
- `filmoji-frontend/src/pages/ForgotPassword.jsx`

Issue:

- These pages still use the older cinematic split-screen look with a dark video panel, heavy shell shadowing, and separate visual language.
- `ForgotPassword.jsx` also has a likely contrast bug because the heading is white on a light `bg-card` panel.

Expected direction:

- Restyle auth flows to feel like part of the same warm editorial system as the main page.
- Reuse shared card, input, button, border, and typography classes.
- Avoid white text on light cards unless the surface is intentionally dark.

### 3. Movie detail uses a dark framed presentation outside the main design system

Files:

- `filmoji-frontend/src/pages/MovieDetail.jsx`
- `filmoji-frontend/src/components/ContainerScroll.jsx`

Issue:

- `MovieDetail.jsx` content is built around white-on-dark inner surfaces.
- `ContainerScroll.jsx` renders a black/gray framed card that does not match the main-page surfaces, borders, or color language.

Expected direction:

- Keep the interaction if it is still wanted, but restyle the container and inner panel to the cream/card/border system.
- Bring CTA buttons, stats blocks, and metadata chips into the same token set as the home page.

### 4. Dashboard mood input still assumes a dark glassmorphism treatment

Files:

- `filmoji-frontend/src/pages/Dashboard.jsx`
- `filmoji-frontend/src/components/MoodInput.jsx`

Issue:

- The dashboard heading is forced to white.
- The mood input uses translucent white surfaces, white text, and a glassy style that does not belong to the main-page reference.

Expected direction:

- Rebuild around the light theme tokens and shared form styles.

## Priority 2

These are not as far off, but they still need cleanup to fully match the main page.

### 5. Emoji recommendation flow mixes good tokens with off-system surfaces

File:

- `filmoji-frontend/src/pages/EmojiRecommendations.jsx`

Issue:

- This page partly uses the theme correctly, but still relies on `bg-white/5`, `border-white/10`, glassy cards, and red/green swipe controls that feel disconnected from the home-page language.

Expected direction:

- Keep the flow and interaction pattern.
- Replace glassy surfaces with warm light card treatments.
- Normalize borders, hover states, and controls to the shared design system.

### 6. Profile and preferences pages are visually closer, but too bespoke

Files:

- `filmoji-frontend/src/pages/UserProfile.jsx`
- `filmoji-frontend/src/pages/PersonalPreference.jsx`

Issue:

- These pages already use theme variables, but rely heavily on inline styles and custom per-element styling.
- They are closer to the target than the auth pages, but still not consistently using the shared system.

Expected direction:

- Convert repeated inline style patterns into shared utility/component classes where practical.
- Keep the information architecture and interaction behavior intact.

## Shared Styling Work

File:

- `filmoji-frontend/src/index.css`

Why it likely needs changes:

- The app already has a decent token base, but some missing shared classes are forcing pages into bespoke implementations.

Good candidates for shared additions:

- Page shell variants for interior pages
- Standard card sections for forms/settings/profile panels
- Tab and pill button variants
- Interior page headings and supporting text blocks
- Input/button variants that work on the light theme without custom inline overrides

## Lower-Priority Polish

These files are mostly aligned already and should be treated as polish work, not redesign work.

Files:

- `filmoji-frontend/src/pages/CategoryDetail.jsx`
- `filmoji-frontend/src/pages/MovieReviews.jsx`
- `filmoji-frontend/src/pages/Recommendations.jsx`
- `filmoji-frontend/src/components/MovieCard.jsx`
- `filmoji-frontend/src/components/CategoryCard.jsx`

Notes:

- `CategoryDetail.jsx` is generally consistent, but the not-found state still uses `text-white`.
- `MovieReviews.jsx` is mostly on-theme but is still heavily inline-styled.
- `MovieCard.jsx` and `CategoryCard.jsx` are close to the target and mainly need consistency polish if the shared classes evolve.

## Suggested Execution Order

1. Fix shared tokens/classes in `filmoji-frontend/src/index.css` first.
2. Align auth pages next because they are the largest visual outliers.
3. Restyle `MovieDetail.jsx` and `ContainerScroll.jsx` together.
4. Restyle dashboard and `MoodInput.jsx`.
5. Normalize `EmojiRecommendations.jsx`.
6. Refactor `UserProfile.jsx` and `PersonalPreference.jsx`.
7. Do final polish on the already-close pages.

## Definition Of Done

- Interior pages look like they belong to the same product as the home page.
- Default page surfaces are warm/light unless there is a deliberate, justified exception.
- Text contrast is correct on all panels.
- Repeated inline color and border styling is reduced in favor of shared classes.
- No page still looks like it belongs to the older dark split-screen auth/dashboard design.
