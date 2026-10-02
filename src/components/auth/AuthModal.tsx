"use client";

import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setShowPassword(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isSupabaseConfigured) {
      setErrorMsg("Faltan configurar las credenciales de Supabase en el archivo .env.local");
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
              "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o desactiva 'Confirm email' en tu panel de Supabase (Authentication > Providers > Email)."
            );
          }
          throw error;
        }

        setSuccessMsg("¡Sesión iniciada con éxito! Sincronizando tus finanzas...");
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 800);
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
            throw new Error("Este correo ya está registrado. Por favor cambia a 'Iniciar Sesión'.");
          }
          if (error.message.includes("Password should be at least")) {
            throw new Error("La contraseña debe tener al menos 6 caracteres.");
          }
          throw error;
        }

        if (data?.session) {
          setSuccessMsg("¡Cuenta creada e iniciada con éxito!");
          setTimeout(() => {
            handleClose();
            onSuccess?.();
          }, 800);
        } else {
          setSuccessMsg(
            "¡Cuenta creada con éxito! Si tienes activada la confirmación por correo, revisa tu bandeja de entrada para validar tu cuenta."
          );
          setTimeout(() => {
            handleClose();
            onSuccess?.();
          }, 2000);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[95vw] sm:max-w-md p-6 rounded-2xl">
        <DialogHeader className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[11px] gap-1 text-emerald-400 border-emerald-500/30">
              <ShieldCheck className="size-3" /> Supabase Cloud
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {mode === "login" ? (
              <>
                <LogIn className="size-5 text-primary" /> Iniciar Sesión
              </>
            ) : (
              <>
                <UserPlus className="size-5 text-primary" /> Crear Cuenta
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === "login"
              ? "Ingresa tus credenciales para sincronizar tus finanzas en la nube y acceder desde cualquier dispositivo."
              : "Regístrate con tu correo y contraseña para guardar tus datos en tu cuenta de Supabase."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex p-1 bg-muted/50 rounded-xl gap-1 mt-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-background text-foreground shadow-xs"
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
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "signup"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="size-3.5" />
            Crear Cuenta
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5 pt-1">
          {mode === "signup" && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nombre o Apodo</Label>
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
            className="w-full h-10 font-semibold text-xs cursor-pointer shadow-xs gap-1.5 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="size-4" />
                <span>Iniciar Sesión</span>
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                <span>Crear Cuenta</span>
              </>
            )}
          </Button>

          <div className="text-center pt-1">
            {mode === "login" ? (
              <p className="text-xs text-muted-foreground">
                ¿Aún no tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                  }}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Crea una aquí
                </button>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                ¿Ya tienes una cuenta registrada?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg(null);
                  }}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
