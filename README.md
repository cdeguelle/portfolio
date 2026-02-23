# (づ￣ ³￣)づ — clemdegdev.fr

My personal portfolio, built as a **Windows 95-style desktop** experience.

Live at **[clemdegdev.fr](https://clemdegdev.fr)**

## Concept

The site opens with a retro terminal boot sequence, then drops you into a fully interactive Windows 95 desktop — complete with draggable windows, a start menu, a taskbar, and a right-click context menu. Each "app" reveals a section of the portfolio.

| Window | Content |
|--------|---------|
| About | Bio & tech stack |
| Projects | Featured work |
| CV | Résumé (PDF) |
| Contact | Links & email |
| Terminal | Easter egg |
| Music | Currently listening |

## Tech Stack

- **React 19** + **TypeScript** — UI & logic
- **Vite** — build tooling
- **Tailwind CSS** — utility styling
- **Three.js / WebGL** — used in project demos
- **GitHub Actions** + **FTP Deploy** — CI/CD to Hostinger

## Local Development

```bash
npm install
npm run dev
```

## Deployment

Pushes to `main` automatically build and deploy to [clemdegdev.fr](https://clemdegdev.fr) via the GitHub Actions workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

Required repository secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
