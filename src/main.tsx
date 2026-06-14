import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { registerSW } from "virtual:pwa-register";

// Globally guard storage APIs against AbortErrors or FILE_ERROR_NO_SPACE constraints
try {
  const originalSetItem = window.localStorage.setItem;
  window.localStorage.setItem = function(key: string, value: string) {
    try {
      originalSetItem.call(window.localStorage, key, value);
    } catch (e: any) {
      console.warn("localStorage.setItem failed (disk full or quota exceeded):", e?.message || e);
    }
  };
} catch (e) {
  console.warn("Could not patch localStorage:", e);
}

try {
  const originalSessionSetItem = window.sessionStorage.setItem;
  window.sessionStorage.setItem = function(key: string, value: string) {
    try {
      originalSessionSetItem.call(window.sessionStorage, key, value);
    } catch (e: any) {
      console.warn("sessionStorage.setItem failed:", e?.message || e);
    }
  };
} catch (e) {
  console.warn("Could not patch sessionStorage:", e);
}

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
