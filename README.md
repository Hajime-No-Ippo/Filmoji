# Filmoji

A movie recommendation platform that suggests films based on your mood.

## Tech Stack

- **React 19** — UI framework
- **Vite** — Build tool with HMR
- **Tailwind CSS v4** — Utility-first styling via `@tailwindcss/vite` plugin
- **React Router DOM** — Client-side routing

## Getting Started

```bash
cd Filmoji
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Project Structure

```
Filmoji/
├── public/
│   ├── bg-video.mp4          # Hero background video
│   ├── panel-bg.jpg          # Login/Register panel background
│   └── favicon.png
├── src/
│   ├── main.jsx              # Entry point (BrowserRouter)
│   ├── App.jsx               # Route layout (Navbar + Routes + Footer)
│   ├── App.css               # Wave divider styles
│   ├── index.css             # Tailwind import, @theme config, component classes
│   ├── components/
│   │   ├── Navbar.jsx        # Scroll-aware transparent → solid navbar
│   │   ├── Hero.jsx          # Full-screen video hero with mood input
│   │   ├── MoodInput.jsx     # Pill-shaped mood search bar
│   │   ├── WaveDivider.jsx   # SVG wave transition
│   │   ├── MovieCard.jsx     # Individual movie card
│   │   ├── FeaturedMovies.jsx
│   │   ├── CategoryCard.jsx  # Genre card with emoji
│   │   ├── CategoriesSection.jsx
│   │   ├── PricingCard.jsx   # Pricing tier card
│   │   ├── PricingSection.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx          # Landing page (Hero + Movies + Categories + Pricing)
│   │   ├── Categories.jsx    # Full categories grid
│   │   ├── Login.jsx         # Split-panel login form
│   │   └── Register.jsx      # Split-panel registration form
│   └── data/
│       ├── movies.js         # 8 mock featured movies
│       ├── categories.js     # 8 categories with emojis
│       └── pricing.js        # 3 pricing tiers (Free, Pro, Team)
```

## Theming

Colors and fonts are managed via CSS custom properties in `src/index.css` using Tailwind's `@theme` directive:

| Variable             | Purpose                  | Value     |
|----------------------|--------------------------|-----------|
| `--color-accent`     | Buttons, links           | `#304FFE` |
| `--color-panel`      | Decorative panel start   | `#2355B5` |
| `--color-panel-end`  | Decorative panel end     | `#102A5D` |
| `--color-dark`       | Page background          | `#0d0d0d` |
| `--color-card`       | Card backgrounds         | `#1e1e1e` |

Accent and panel colors are independent — changing one won't affect the other.

## Fonts

- **Michroma** — Display font (headings, logo, navbar)
- **Inter** — Body font (paragraphs, form labels, links)

Loaded via Google Fonts in `index.html`.

## Pages

| Route         | Page       | Description                              |
|---------------|------------|------------------------------------------|
| `/`           | Home       | Hero, featured movies, categories, pricing |
| `/categories` | Categories | Full grid of all genre categories        |
| `/login`      | Login      | Split-panel form with image panel        |
| `/register`   | Register   | Split-panel form with image panel        |

## Reusable CSS Classes

Common patterns are extracted into `@layer components` in `index.css` to reduce repetition:

`btn-primary`, `btn-outline`, `input-field`, `card-base`, `card-hover`, `nav-link`, `accent-link`, `section-title`, `section-subtitle`, `divider`, `grid-movies`, `grid-categories`

## Status

Frontend with mock data. Custom backend planned for a future phase.
