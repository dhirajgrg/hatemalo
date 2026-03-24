import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.jsx";

// Capture beforeinstallprompt early — it fires before React mounts
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
});

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
