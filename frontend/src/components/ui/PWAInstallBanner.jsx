import { useEffect, useState } from "react";

export default function PWAInstallBanner() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Hide once installed
    window.addEventListener("appinstalled", () => setPromptEvent(null));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setPromptEvent(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    setDismissed(true);
  };

  if (!promptEvent || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-lg px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/icons/icon-72x72.png"
          alt="Hatemalo"
          className="w-10 h-10 rounded-xl flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-tight">
            Install Hatemalo
          </p>
          <p className="text-xs text-text-secondary truncate">
            Add to home screen for quick access
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
