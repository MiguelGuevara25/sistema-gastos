"use client";

import React, { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  PieChart,
  Target,
} from "lucide-react";

export const WelcomeAuthScreen: React.FC = () => {
  const { enableDemoMode } = useFinance();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isSupabaseConfigured) {
      setErrorMsg("Faltan configurar las credenciales de Supabase en .env.local");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Correo o contraseña incorrectos. Verifica tus datos o crea una cuenta.");
          }
          if (error.message.includes("Email not confirmed")) {
            throw new Error(
              "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o confirma el enlace enviado."
            );
          }
          throw error;
        }

        setSuccessMsg("¡Sesión iniciada con éxito! Cargando tus finanzas...");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.trim().split("@")[0],
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            throw new Error("Este correo ya está registrado. Cambia a 'Iniciar Sesión'.");
          }
          if (error.message.includes("Password should be at least")) {
            throw new Error("La contraseña debe tener al menos 6 caracteres.");
          }
          throw error;
        }

        if (data?.session) {
          setSuccessMsg("¡Cuenta creada con éxito! Entrando al sistema...");
        } else {
          setSuccessMsg(
            "¡Cuenta creada con éxito! Hemos enviado un correo de confirmación para validar tu identidad por seguridad. Por favor revisa tu bandeja de entrada."
          );
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error de autenticación";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-radial-[at_top_right] from-zinc-900 via-zinc-950 to-black text-foreground flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 antialiased relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md sm:max-w-lg z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border border-border/80 text-xs font-medium text-foreground mb-1 shadow-xs">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Sistema Financiero Seguro</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-emerald-400 font-semibold">PostgreSQL</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
              <Wallet className="size-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Finanza
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Control de gastos, presupuestos inteligentes, cuentas multi-divisa y metas de ahorro sincronizadas.
          </p>
        </div>

        {/* Auth Box Card */}
        <Card className="border-border/80 shadow-2xl bg-card/90 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-7 space-y-5">
            {/* Mode Selector Tabs */}
            <div className="flex p-1 bg-muted/50 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "login"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="size-3.5" />
                Iniciar Sesión
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="size-3.5" />
                Crear Cuenta
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-400 flex items-start gap-2.5 animate-in fade-in leading-relaxed">
                <CheckCircle2 className="size-4.5 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Tu Nombre o Apodo</Label>
                  <div className="relative">
                    <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ej. Miguel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 h-10 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Contraseña</Label>
                  <span className="text-[10px] text-muted-foreground">Mínimo 6 caracteres</span>
                </div>
                <div className="relative">
                  <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold text-xs cursor-pointer shadow-md gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : mode === "login" ? (
                  <>
                    <LogIn className="size-4" />
                    <span>Ingresar a mis finanzas</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    <span>Registrarme con seguridad</span>
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-semibold">
                <span className="bg-card px-2.5 text-muted-foreground">
                  O prueba el sistema primero
                </span>
              </div>
            </div>

            {/* Try Demo Mode Button */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={enableDemoMode}
                className="w-full h-11 text-xs font-bold cursor-pointer gap-2 border-primary/40 hover:bg-primary/10 hover:border-primary text-foreground shadow-xs transition-all"
              >
                <Sparkles className="size-4 text-primary animate-pulse" />
                <span>Probar Modo Demo (Sin registrarte)</span>
                <ArrowRight className="size-3.5 ml-auto text-muted-foreground" />
              </Button>

              <p className="text-[11px] text-center text-muted-foreground leading-tight">
                Podrás interactuar con gráficos de muestra, registrar gastos simulados y ver cómo funciona el sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
          <div className="p-2 rounded-xl bg-muted/20 border border-border/40">
            <TrendingUp className="size-4 text-emerald-400 mx-auto mb-1" />
            <span>Control de Gastos</span>
          </div>
          <div className="p-2 rounded-xl bg-muted/20 border border-border/40">
            <PieChart className="size-4 text-primary mx-auto mb-1" />
            <span>Presupuestos</span>
          </div>
          <div className="p-2 rounded-xl bg-muted/20 border border-border/40">
            <Target className="size-4 text-purple-400 mx-auto mb-1" />
            <span>Metas de Ahorro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
