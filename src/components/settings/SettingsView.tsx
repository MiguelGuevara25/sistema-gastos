"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useFinance } from "../../context/FinanceContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Coins,
  ShieldAlert,
  Cloud,
  LogIn,
  LogOut,
} from "lucide-react";
import { PwaInstallPrompt } from "../pwa/PwaInstallPrompt";

interface SettingsFormData {
  userName: string;
  currency: string;
  currencyCode: string;
  monthlyBudget: number | string;
  phantomExpenseThreshold: number | string;
  rateUSD: number | string;
  rateEUR: number | string;
}

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDefaultData,
    clearAllData,
    exportToCSV,
    exportToJSON,
    importFromJSON,
    user,
    setIsAuthModalOpen,
    signOut,
    syncLocalDataToCloud,
    isCloudSyncing,
  } = useFinance();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch } = useForm<SettingsFormData>({
    values: {
      userName: settings.userName,
      currency: settings.currency,
      currencyCode: settings.currencyCode,
      monthlyBudget: settings.monthlyBudget.toString(),
      phantomExpenseThreshold: (settings.phantomExpenseThreshold || 20).toString(),
      rateUSD: (settings.exchangeRates?.USD || 3.75).toString(),
      rateEUR: (settings.exchangeRates?.EUR || 4.05).toString(),
    },
  });

  const currentCurrency = watch("currency");

  const onSaveProfile = (data: SettingsFormData) => {
    const budgetNum = parseFloat(String(data.monthlyBudget));
    const phantomNum = parseFloat(String(data.phantomExpenseThreshold));
    const usdNum = parseFloat(String(data.rateUSD));
    const eurNum = parseFloat(String(data.rateEUR));

    updateSettings({
      userName: data.userName.trim() || "Usuario",
      currency: data.currency,
      currencyCode: data.currencyCode,
      monthlyBudget: !isNaN(budgetNum) && budgetNum > 0 ? budgetNum : settings.monthlyBudget,
      phantomExpenseThreshold: !isNaN(phantomNum) && phantomNum > 0 ? phantomNum : 20,
      exchangeRates: {
        PEN: 1.0,
        USD: !isNaN(usdNum) && usdNum > 0 ? usdNum : 3.75,
        EUR: !isNaN(eurNum) && eurNum > 0 ? eurNum : 4.05,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importFromJSON(content);
        if (success) {
          setImportStatus("Datos importados exitosamente.");
        } else {
          setImportStatus("Error: El archivo JSON no tiene un formato válido.");
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Save Toast Notification */}
      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="size-4" />
          Configuración guardada correctamente
        </div>
      )}

      {importStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            importStatus.includes("Error")
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          <AlertCircle className="size-4" />
          {importStatus}
        </div>
      )}

      {/* Profile & Currency Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4 text-primary" />
            Preferencias Generales & Moneda Base
          </CardTitle>
          <CardDescription className="text-xs">
            Personaliza tu moneda de reporte, nombre de usuario y límites de gastos
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Nombre de Usuario
                </Label>
                <Input
                  type="text"
                  {...register("userName")}
                  placeholder="Tu nombre"
                  className="h-10 bg-muted/40"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Moneda Base Principal
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { symbol: "S/.", code: "PEN", label: "Soles (PEN)" },
                    { symbol: "$", code: "USD", label: "Dólares (USD)" },
                    { symbol: "€", code: "EUR", label: "Euros (EUR)" },
                  ].map((cur) => (
                    <Button
                      key={cur.code}
                      type="button"
                      variant={
                        currentCurrency === cur.symbol ? "secondary" : "outline"
                      }
                      onClick={() => {
                        setValue("currency", cur.symbol);
                        setValue("currencyCode", cur.code);
                      }}
                      className={`h-auto py-1.5 px-2 flex flex-col items-center cursor-pointer ${
                        currentCurrency === cur.symbol
                          ? "border-primary/50 font-bold"
                          : ""
                      }`}
                    >
                      <span className="text-xs">{cur.symbol}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {cur.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Presupuesto y Gastos Hormiga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Presupuesto Mensual Global ({currentCurrency})
                </Label>
                <Input
                  type="number"
                  step="50"
                  {...register("monthlyBudget")}
                  className="h-10 bg-muted/40 font-mono font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-amber-400" />
                  Umbral de Gasto Hormiga ({currentCurrency})
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  {...register("phantomExpenseThreshold")}
                  className="h-10 bg-muted/40 font-mono font-semibold"
                />
                <p className="text-[10px] text-muted-foreground">
                  Gastos menores o iguales a este monto se catalogarán como micro-compras
                </p>
              </div>
            </div>

            {/* Tipos de Cambio para Multi-moneda */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Coins className="size-3.5 text-primary" />
                  Tipos de Cambio Referenciales (Respecto al Sol PEN)
                </Label>
                <Badge variant="outline" className="text-[10px]">
                  Multi-divisa
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    1 Dólar (USD) equivale a (PEN):
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.1"
                    {...register("rateUSD")}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    1 Euro (EUR) equivale a (PEN):
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.1"
                    {...register("rateEUR")}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="cursor-pointer font-semibold shadow-xs"
              >
                Guardar Preferencias
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Supabase Cloud Sync Info Card */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cloud className="size-4 text-emerald-400" />
              Sincronización en la Nube (Supabase Cloud)
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] text-emerald-400 font-semibold">
              PostgreSQL & RLS
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Estado de sincronización multi-dispositivo con base de datos relacional PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">
              ✓ Base de datos PostgreSQL relacional con Row Level Security (RLS)
            </p>
            <p>
              Tus finanzas se sincronizan en la nube con Supabase. Cada cuenta, movimiento y deuda está protegida por políticas RLS a nivel de base de datos.
            </p>
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  Conectado como: {user.email}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  UID: <span className="font-mono">{user.id.slice(0, 12)}...</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCloudSyncing}
                  onClick={() => syncLocalDataToCloud()}
                  className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
                >
                  <RefreshCw className={`size-3.5 ${isCloudSyncing ? "animate-spin" : ""}`} />
                  <span>{isCloudSyncing ? "Sincronizando..." : "Subir Datos a la Nube"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="h-8 text-xs font-semibold text-destructive hover:text-destructive cursor-pointer gap-1"
                >
                  <LogOut className="size-3.5" />
                  <span>Desconectar</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">
                  Modo Local Activo
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Inicia sesión con Google o correo para respaldar tus finanzas en la nube.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="h-8 text-xs font-semibold cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0"
              >
                <LogIn className="size-3.5" />
                <span>Conectar Supabase</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile App PWA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Smartphone className="size-4 text-primary" />
            Aplicación Móvil (PWA)
          </CardTitle>
          <CardDescription className="text-xs">
            Instala Finanza en tu iPhone, Android o PC para tener acceso instantáneo a pantalla completa
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/20 border border-border">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                Instalación Directa y Segura
              </p>
              <p className="text-[11px] text-muted-foreground">
                No necesitas descargar nada de la App Store ni Google Play. Funciona como una Web App Progresiva instalable.
              </p>
            </div>
            <PwaInstallPrompt />
          </div>
        </CardContent>
      </Card>

      {/* Storage and Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HardDrive className="size-4 text-muted-foreground" />
            Copia de Seguridad & Exportación de Datos
          </CardTitle>
          <CardDescription className="text-xs">
            Descarga tus movimientos o importa respaldos completos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="w-full flex items-center justify-center gap-2 h-10 cursor-pointer text-xs"
            >
              <Download className="size-4" />
              Exportar a Excel / CSV
            </Button>

            <Button
              variant="outline"
              onClick={exportToJSON}
              className="w-full flex items-center justify-center gap-2 h-10 cursor-pointer text-xs"
            >
              <Download className="size-4" />
              Descargar Copia de Respaldo (JSON)
            </Button>
          </div>

          <div className="pt-2">
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-10 cursor-pointer text-xs"
            >
              <Upload className="size-4" />
              Restaurar / Importar Copia de Seguridad (JSON)
            </Button>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Limpieza total: borra transacciones, cuentas y metas tanto en tu equipo como en Supabase.
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (
                  confirm(
                    "¿Estás seguro de que deseas borrar TODOS los datos y empezar de 0? Esta acción limpiará todo tanto en tu navegador como en Supabase."
                  )
                ) {
                  await clearAllData();
                  alert("¡Listo! Todos los datos han sido limpiados y tu cuenta está en 0.");
                }
              }}
              className="w-full sm:w-auto text-xs cursor-pointer gap-1.5 font-semibold"
            >
              <Trash2 className="size-3.5" />
              Borrar Todo y Empezar de 0
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
