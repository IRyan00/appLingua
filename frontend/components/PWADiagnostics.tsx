"use client";

import { useEffect } from "react";

export function PWADiagnostics() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Vérifier l'installabilité
      const checkInstallability = async () => {
        console.log("=== PWA Diagnostics ===");

        // Vérifier le manifest
        try {
          const manifestResponse = await fetch("/manifest.json");
          const manifest = await manifestResponse.json();
          console.log("✅ Manifest chargé:", manifest);

          // Vérifier les icônes
          const icons = manifest.icons || [];
          console.log("📱 Icônes configurées:", icons.length);

          for (const icon of icons) {
            try {
              const iconResponse = await fetch(icon.src);
              if (iconResponse.ok) {
                console.log(`✅ Icône accessible: ${icon.src} (${icon.sizes})`);
              } else {
                console.error(`❌ Icône inaccessible: ${icon.src}`);
              }
            } catch (error) {
              console.error(
                `❌ Erreur lors de la vérification de ${icon.src}:`,
                error
              );
            }
          }
        } catch (error) {
          console.error("❌ Erreur lors du chargement du manifest:", error);
        }

        // Vérifier le service worker
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            console.log("✅ Service Worker actif:", registration.scope);
          } else {
            console.error("❌ Aucun service worker enregistré");
          }
        }

        // Vérifier si l'app est déjà installée
        if (window.matchMedia("(display-mode: standalone)").matches) {
          console.log("✅ Application déjà installée");
        } else {
          console.log("ℹ️ Application non installée");
        }

        console.log("=====================");
      };

      checkInstallability();
    }
  }, []);

  return null;
}
