# (づ￣ ³￣)づ — clemdegdev.fr

My personal portfolio, available in two distinct themes selectable at startup.

Live at **[clemdegdev.fr](https://clemdegdev.fr)**

## Themes

### Windows 95 Desktop

A fully interactive retro desktop environment — draggable windows, start menu, taskbar, right-click context menu. Each "app" reveals a section of the portfolio.

| Window   | Content                       |
| -------- | ----------------------------- |
| About    | Bio & tech stack              |
| Projects | Featured work with live demos |
| CV       | Résumé                        |
| Contact  | Links & email                 |
| Music    | Currently listening           |

### Editorial

A minimal, animation-heavy editorial design. Features:

- Custom orange cursor with lagged ring and white-text reveal effect
- Hero titles with Matter.js letter-fall physics (drag & throw)
- Project accordion expanding to full viewport height
- Embedded 3D isometric map (Three.js + NASA GeoTIFF data)
- Physics-based skill tag wall in the contact section

## Tech Stack

- **React 19** + **TypeScript** — UI & logic
- **Vite 7** — build tooling
- **Tailwind CSS 4** — utility styling (loading screen)
- **Three.js 0.183** — 3D rendering (map, Discord logo)
- **Matter.js 0.20** — 2D physics (letter fall, tag wall)
- **GitHub Actions** + **FTP Deploy** — CI/CD to Hostinger

## Local Development

```bash
npm install
npm run dev
```

## Deployment

Pushes to `main` automatically build and deploy to [clemdegdev.fr](https://clemdegdev.fr) via the GitHub Actions workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

Required repository secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
