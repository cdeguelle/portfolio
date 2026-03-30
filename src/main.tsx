import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log(
  "%c👋 Hey, tu fouilles dans le code — j'aime ça.",
  "color: #1084d0; font-size: 14px; font-weight: bold;"
)
console.log(
  "%cJe suis Clément Deguelle, dev front-end.\nStack : React · TypeScript · Three.js · Tailwind",
  "color: #c0c0c0; font-size: 12px;"
)
console.log(
  "%cTu cherches un profil curieux qui cache des messages dans sa console ?\n→ clement.deguelle@hotmail.com\n→ https://www.linkedin.com/in/clement-deguelle/",
  "color: #00ff90; font-size: 12px;"
)
console.log(
  "%c(Ce portfolio est fait maison, de A à Z.)",
  "color: #808080; font-size: 11px; font-style: italic;"
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
