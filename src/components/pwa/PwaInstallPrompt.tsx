"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  Sparkles,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Listen for Android / Chrome beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        );
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Show instructional modal for iOS / manual install
      setIsOpenModal(true);
    }
  };

  if (isInstalled) {
    return null; // Already running inside installed PWA
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstallClick}
        className="cursor-pointer gap-1.5 h-8 text-xs font-semibold border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary shadow-2xs"
        title="Instalar como aplicación en tu celular o PC"
      >
        <Download className="size-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </Button>

      {/* Installation Instructions Modal */}
      <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="size-5 text-primary" />
              Instalar Finanza en tu Celular
            </DialogTitle>
            <DialogDescription>
              Disfruta de una experiencia fluida a pantalla completa, acceso
              instantáneo desde tu pantalla de inicio y funcionamiento sin
              barras del navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            {isIOS ? (
              // iOS Instructions
              <div className="space-y-3 bg-muted/40 p-3.5 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-[10px]"
                  >
                    iPhone / iPad (Safari)
                  </Badge>
                </div>
                <ol className="space-y-2.5 text-xs text-muted-foreground list-decimal list-inside">
                  <li className="leading-relaxed">
                    Abre esta web en el navegador <strong>Safari</strong> de tu
                    iPhone.
                  </li>
                  <li className="leading-relaxed">
                    Toca el botón <strong>Compartir</strong>{" "}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-foreground border border-zinc-700 font-mono">
                      <Share className="size-3 inline" /> Compartir
                    </span>{" "}
                    (en la barra inferior).
                  </li>
                  <li className="leading-relaxed">
                    Desplázate hacia abajo y selecciona{" "}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-foreground border border-zinc-700 font-medium">
                      <PlusSquare className="size-3 inline" /> Agregar a inicio
                    </span>
                    .
                  </li>
                  <li className="leading-relaxed">
                    Pulsa <strong>Agregar</strong> arriba a la derecha. ¡Listo!
                    Tendrás el ícono en tu pantalla de inicio como una
                    aplicación nativa.
                  </li>
                </ol>
              </div>
            ) : (
              // Android / Desktop Instructions
              <div className="space-y-3 bg-muted/40 p-3.5 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-[10px]"
                  >
                    Android (Chrome) o PC
                  </Badge>
                </div>
                <ol className="space-y-2.5 text-xs text-muted-foreground list-decimal list-inside">
                  <li className="leading-relaxed">
                    Toca el menú de tres puntos (<strong>⋮</strong>) en la
                    esquina superior derecha del navegador.
                  </li>
                  <li className="leading-relaxed">
                    Selecciona <strong>&quot;Instalar aplicación&quot;</strong>{" "}
                    o{" "}
                    <strong>&quot;Agregar a la pantalla principal&quot;</strong>
                    .
                  </li>
                  <li className="leading-relaxed">
                    Confirma y la app se añadirá directamente a tu cajón de
                    aplicaciones.
                  </li>
                </ol>
              </div>
            )}

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <Sparkles className="size-4 shrink-0 mt-0.5" />
              <p>
                <strong>100% Privado y Rápido:</strong> Todos tus datos
                permanecen seguros en tu dispositivo y se sincronizan cuando tú
                lo decidas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsOpenModal(false)}
              className="w-full cursor-pointer font-semibold"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
