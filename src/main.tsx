import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const savedTheme = localStorage.getItem("packdconnect_settings_theme") || "light";
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

const savedAccent = localStorage.getItem("packdconnect_settings_accent") || "coral";
document.documentElement.classList.add(`accent-${savedAccent}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
